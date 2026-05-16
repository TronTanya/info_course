"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { CUSTOM_AVATAR_API_PATH, isCustomAvatarApiPath } from "@/lib/avatar-presets";
import { deleteUserAvatarFiles, saveUserAvatarFile, validateAvatarImage, type AvatarStoredExt } from "@/lib/avatar-upload";
import { isInterestTag, serializeProfileInterests } from "@/lib/profile-interests";
import { upsertUserProfile } from "@/lib/profile-upsert";
import { prisma } from "@/lib/db";
import { profileEditInputSchema } from "@/lib/validation";

export type UpdateUserSettingsState = {
  errors?: Record<string, string[] | undefined>;
  message?: string;
};

export async function updateUserSettingsAction(
  _prev: UpdateUserSettingsState,
  formData: FormData,
): Promise<UpdateUserSettingsState> {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/login");
  }
  const userId = session.user.id;

  const clearAvatar = formData.get("clearAvatar") === "1";
  const fileEntry = formData.get("avatarFile");
  const hiddenAvatarUrl = String(formData.get("avatarUrl") ?? "").trim();

  let pendingFile: { buf: Buffer; ext: AvatarStoredExt } | null = null;
  if (!clearAvatar && fileEntry instanceof File && fileEntry.size > 0) {
    const buf = Buffer.from(await fileEntry.arrayBuffer());
    const validated = validateAvatarImage(buf, fileEntry.name);
    if (!validated.ok) {
      return { errors: { avatarFile: [validated.error] } };
    }
    pendingFile = { buf, ext: validated.ext };
  }

  const avatarForZod =
    clearAvatar ? "" : pendingFile ? CUSTOM_AVATAR_API_PATH : hiddenAvatarUrl;

  const rawTags = formData.getAll("tag").map(String);
  const tags = [...new Set(rawTags.filter(isInterestTag))];

  const parsed = profileEditInputSchema.safeParse({
    lastName: formData.get("lastName"),
    firstName: formData.get("firstName"),
    middleName: formData.get("middleName") ?? "",
    birthDate: formData.get("birthDate"),
    educationalInstitution: formData.get("educationalInstitution") ?? "",
    city: formData.get("city") ?? "",
    specialty: formData.get("specialty") ?? "",
    avatarUrl: avatarForZod,
    tags,
    customInterest: formData.get("customInterest") ?? "",
  });

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    return { errors: fieldErrors };
  }

  const d = parsed.data;
  const interestsJson = serializeProfileInterests({
    version: 1,
    tags: d.tags,
    custom: d.customInterest,
  });

  const existing = await prisma.profile.findUnique({
    where: { userId },
    select: { avatarUrl: true },
  });
  const prevAvatar = existing?.avatarUrl ?? null;

  let finalAvatarUrl: string | null;
  if (clearAvatar) {
    finalAvatarUrl = null;
    deleteUserAvatarFiles(userId);
  } else if (pendingFile) {
    try {
      await saveUserAvatarFile(userId, pendingFile.ext, pendingFile.buf);
    } catch (e) {
      console.error(e);
      return { message: "Не удалось сохранить изображение. Попробуйте ещё раз." };
    }
    finalAvatarUrl = CUSTOM_AVATAR_API_PATH;
  } else {
    const trimmed = d.avatarUrl.trim();
    finalAvatarUrl = trimmed.length ? trimmed : null;
    if (isCustomAvatarApiPath(prevAvatar) && !isCustomAvatarApiPath(finalAvatarUrl)) {
      deleteUserAvatarFiles(userId);
    }
  }

  try {
    await upsertUserProfile(userId, d, interestsJson, finalAvatarUrl);
  } catch (e) {
    console.error(e);
    return { message: "Не удалось сохранить данные. Попробуйте позже." };
  }

  revalidatePath("/dashboard/profile");
  revalidatePath("/dashboard/profile/edit");
  revalidatePath("/dashboard/settings");
  redirect("/dashboard/settings?saved=1");
}
