import type { Role } from "@prisma/client";
import { getUserAchievementRows } from "@/lib/achievements";
import { getProfileCourseStats } from "@/lib/profile-course-stats";
import { prisma } from "@/lib/db";
export type PublicStudentProfile = {
  userId: string;
  fullName: string;
  role: Role;
  memberSince: string;
  avatarUrl: string | null;
  initials: string;
  educationalInstitution: string | null;
  specialty: string | null;
  city: string | null;
  stats: NonNullable<Awaited<ReturnType<typeof getProfileCourseStats>>>;
  achievements: Awaited<ReturnType<typeof getUserAchievementRows>>;
  achievementsUnlocked: number;
  isSelf: boolean;
};

function profileFullName(p: {
  firstName: string;
  lastName: string;
  middleName: string | null;
}): string {
  return [p.lastName, p.firstName, p.middleName].filter(Boolean).join(" ").trim() || "Студент";
}

function profileInitials(p: { firstName: string; lastName: string }): string {
  const source = `${p.firstName}${p.lastName}`.replace(/[—\s]/g, "");
  if (source.length >= 2) return `${source[0] ?? ""}${source[1] ?? ""}`.toUpperCase();
  return (p.firstName?.[0] ?? "?").toUpperCase();
}

/** Публичный профиль студента для кабинета (без email). */
export async function getPublicStudentProfile(
  targetUserId: string,
  viewerUserId: string,
): Promise<PublicStudentProfile | null> {
  const user = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: {
      id: true,
      role: true,
      createdAt: true,
      profile: {
        select: {
          firstName: true,
          lastName: true,
          middleName: true,
          avatarUrl: true,
          educationalInstitution: true,
          specialty: true,
          city: true,
        },
      },
    },
  });

  if (!user?.profile || user.role !== "USER") return null;

  const stats = await getProfileCourseStats(user.id);
  if (!stats) return null;

  const achievements = await getUserAchievementRows(user.id);

  const p = user.profile;
  const achievementsUnlocked = achievements.filter((a) => a.unlocked).length;

  return {
    userId: user.id,
    fullName: profileFullName(p),
    role: user.role,
    memberSince: new Date(user.createdAt).toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
    avatarUrl: p.avatarUrl,
    initials: profileInitials(p),
    educationalInstitution: p.educationalInstitution?.trim() || null,
    specialty: p.specialty?.trim() || null,
    city: p.city?.trim() || null,
    stats,
    achievements,
    achievementsUnlocked,
    isSelf: viewerUserId === user.id,
  };
}
