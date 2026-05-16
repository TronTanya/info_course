import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  CUSTOM_AVATAR_API_PATH,
  isAllowedStoredAvatarUrl,
  isBuiltinPresetAvatarUrl,
  isCustomAvatarApiPath,
} from "@/lib/avatar-presets";
import { deleteUserAvatarFiles, findUserAvatarFile } from "@/lib/avatar-upload";
import { prisma } from "@/lib/db";

type PatchBody = {
  avatar_url?: string | null;
  clear?: boolean;
};

/**
 * Обновляет только `Profile.avatarUrl` (JSON: `{ "avatar_url": "..." }` или `{ "clear": true }`).
 */
export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Требуется вход в аккаунт." }, { status: 401 });
  }

  let body: PatchBody;
  try {
    body = (await req.json()) as PatchBody;
  } catch {
    return NextResponse.json({ error: "Некорректный JSON." }, { status: 400 });
  }

  const userId = session.user.id;

  if (body.clear === true || body.avatar_url === null) {
    deleteUserAvatarFiles(userId);
    await prisma.profile.update({
      where: { userId },
      data: { avatarUrl: null },
    });
    revalidatePaths();
    return NextResponse.json({ ok: true, avatar_url: null });
  }

  const raw = typeof body.avatar_url === "string" ? body.avatar_url.trim() : "";
  if (!raw) {
    return NextResponse.json({ error: "Передайте avatar_url или clear: true." }, { status: 400 });
  }

  if (raw === CUSTOM_AVATAR_API_PATH) {
    const file = await findUserAvatarFile(userId);
    if (!file) {
      return NextResponse.json({ error: "Сначала загрузите изображение через POST /api/profile/avatar/upload." }, { status: 400 });
    }
  } else if (!isAllowedStoredAvatarUrl(raw)) {
    return NextResponse.json({ error: "Недопустимое значение avatar_url." }, { status: 400 });
  }

  const existing = await prisma.profile.findUnique({ where: { userId }, select: { avatarUrl: true } });
  const prev = existing?.avatarUrl ?? null;

  if (isCustomAvatarApiPath(prev) && raw !== CUSTOM_AVATAR_API_PATH) {
    deleteUserAvatarFiles(userId);
  }

  await prisma.profile.update({
    where: { userId },
    data: { avatarUrl: raw },
  });

  revalidatePaths();
  return NextResponse.json({ ok: true, avatar_url: raw });
}

function revalidatePaths() {
  revalidatePath("/dashboard/profile");
  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard/profile/edit");
}
