import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { CUSTOM_AVATAR_API_PATH } from "@/lib/avatar-presets";
import { saveUserAvatarFile, validateAvatarImage } from "@/lib/avatar-upload";
import { prisma } from "@/lib/db";
import { consumeRateLimit } from "@/lib/rate-limit";
import { clientIpFromRequest } from "@/lib/request-ip";

function revalidatePaths() {
  revalidatePath("/dashboard/profile");
  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard/profile/edit");
}

/**
 * Загрузка пользовательского аватара (multipart, поле `file`).
 * Разрешены только PNG, JPEG, WebP до 2 МБ; SVG не принимаются.
 */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Требуется вход в аккаунт." }, { status: 401 });
  }

  const userId = session.user.id;
  const ip = clientIpFromRequest(req);
  if (
    !consumeRateLimit(`avatar:upload:ip:${ip}`, 40, 60 * 60 * 1000) ||
    !consumeRateLimit(`avatar:upload:user:${userId}`, 20, 60 * 60 * 1000)
  ) {
    return NextResponse.json({ error: "Слишком много загрузок. Попробуйте позже." }, { status: 429 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Некорректные данные формы." }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Прикрепите файл изображения." }, { status: 400 });
  }

  const name = file.name.toLowerCase();
  if (name.endsWith(".svg") || name.endsWith(".svgz")) {
    return NextResponse.json({ error: "Загрузка SVG запрещена. Используйте PNG, JPEG или WebP." }, { status: 400 });
  }

  const buf = Buffer.from(await file.arrayBuffer());
  const validated = validateAvatarImage(buf, file.name);
  if (!validated.ok) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  try {
    await saveUserAvatarFile(userId, validated.ext, buf);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Не удалось сохранить файл." }, { status: 500 });
  }

  await prisma.profile.update({
    where: { userId },
    data: { avatarUrl: CUSTOM_AVATAR_API_PATH },
  });

  revalidatePaths();
  return NextResponse.json({ ok: true, avatar_url: CUSTOM_AVATAR_API_PATH });
}
