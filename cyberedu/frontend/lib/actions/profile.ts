"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { isInterestTag, serializeProfileInterests } from "@/lib/profile-interests";
import { upsertUserProfile } from "@/lib/profile-upsert";
import { profileEditInputSchema } from "@/lib/validation";

export type UpdateProfileState = {
  errors?: Record<string, string[] | undefined>;
};

export async function updateProfileAction(
  _prev: UpdateProfileState,
  formData: FormData,
): Promise<UpdateProfileState> {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/login");
  }

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
    avatarUrl: formData.get("avatarUrl") ?? "",
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

  const avatarUrl = d.avatarUrl.trim() ? d.avatarUrl.trim() : null;

  await upsertUserProfile(session.user.id, d, interestsJson, avatarUrl);

  revalidatePath("/dashboard/profile");
  revalidatePath("/dashboard/profile/edit");
  revalidatePath("/dashboard/settings");
  redirect("/dashboard/settings?saved=1");
}
