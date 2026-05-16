import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { UPLOAD_API_GUARD } from "@/lib/api/guard-presets";
import { CUSTOM_AVATAR_API_PATH } from "@/lib/avatar-presets";
import { saveUserAvatarFile, validateAvatarImage } from "@/lib/avatar-upload";
import { prisma } from "@/lib/db";
import { withApiGuard } from "@/lib/security/api-guard";

function revalidatePaths() {
  revalidatePath("/dashboard/profile");
  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard/profile/edit");
}

export const POST = withApiGuard(
  UPLOAD_API_GUARD,
  async ({ userId, req }) => {
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

    await saveUserAvatarFile(userId, validated.ext, buf);

    await prisma.profile.update({
      where: { userId },
      data: { avatarUrl: CUSTOM_AVATAR_API_PATH },
    });

    revalidatePaths();
    return NextResponse.json({ ok: true, avatar_url: CUSTOM_AVATAR_API_PATH });
  },
);
