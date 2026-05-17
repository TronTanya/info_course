import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import {
  CUSTOM_AVATAR_API_PATH,
  isAllowedStoredAvatarUrl,
  isCustomAvatarApiPath,
} from "@/lib/avatar-presets";
import { deleteUserAvatarFiles, findUserAvatarFile } from "@/lib/avatar-upload";
import { prisma } from "@/lib/db";
import { withAuthApiRoute } from "@/lib/security/api-guard";

const patchBodySchema = z.object({
  avatar_url: z.string().nullable().optional(),
  clear: z.boolean().optional(),
});

function revalidatePaths() {
  revalidatePath("/dashboard/profile");
  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard/profile/edit");
}

export const PATCH = withAuthApiRoute(
  { bodySchema: patchBodySchema },
  async ({ userId, body }) => {
    if (body.clear === true || body.avatar_url === null) {
      await deleteUserAvatarFiles(userId);
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
        return NextResponse.json(
          { error: "Сначала загрузите изображение через POST /api/profile/avatar/upload." },
          { status: 400 },
        );
      }
    } else if (!isAllowedStoredAvatarUrl(raw)) {
      return NextResponse.json({ error: "Недопустимое значение avatar_url." }, { status: 400 });
    }

    const existing = await prisma.profile.findUnique({ where: { userId }, select: { avatarUrl: true } });
    const prev = existing?.avatarUrl ?? null;

    if (isCustomAvatarApiPath(prev) && raw !== CUSTOM_AVATAR_API_PATH) {
      await deleteUserAvatarFiles(userId);
    }

    await prisma.profile.update({
      where: { userId },
      data: { avatarUrl: raw },
    });

    revalidatePaths();
    return NextResponse.json({ ok: true, avatar_url: raw });
  },
);
