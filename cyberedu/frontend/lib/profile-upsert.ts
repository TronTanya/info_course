import { prisma } from "@/lib/db";
import { dateFromYmd } from "@/lib/profile-dates";
import type { ProfileEditInput } from "@/lib/validation";

export async function upsertUserProfile(
  userId: string,
  d: ProfileEditInput,
  interestsJson: string,
  avatarUrl: string | null,
): Promise<void> {
  const middleName = d.middleName?.trim() ? d.middleName.trim() : null;

  await prisma.profile.upsert({
    where: { userId },
    create: {
      userId,
      lastName: d.lastName,
      firstName: d.firstName,
      middleName,
      birthDate: dateFromYmd(d.birthDate),
      educationalInstitution: d.educationalInstitution.trim(),
      city: d.city.trim(),
      specialty: d.specialty.trim(),
      interests: interestsJson,
      avatarUrl,
    },
    update: {
      lastName: d.lastName,
      firstName: d.firstName,
      middleName,
      birthDate: dateFromYmd(d.birthDate),
      educationalInstitution: d.educationalInstitution.trim(),
      city: d.city.trim(),
      specialty: d.specialty.trim(),
      interests: interestsJson,
      avatarUrl,
    },
  });
}
