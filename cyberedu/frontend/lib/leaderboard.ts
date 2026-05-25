import { prisma } from "@/lib/db";

export type LeaderboardCandidate = {
  userId: string;
  fullName: string;
  educationalInstitution: string | null;
  avatarUrl: string | null;
  initials: string;
  progressPercent: number;
  totalScore: number;
  completedModules: number;
  totalModules: number;
  achievementsUnlocked: number;
  currentModuleTitle: string | null;
};

export type LeaderboardRow = LeaderboardCandidate & { rank: number };

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

/** Сортировка турнирной таблицы: прогресс → баллы → достижения → имя. */
export function sortLeaderboardCandidates(rows: LeaderboardCandidate[]): LeaderboardCandidate[] {
  return [...rows].sort((a, b) => {
    if (b.progressPercent !== a.progressPercent) return b.progressPercent - a.progressPercent;
    if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
    if (b.achievementsUnlocked !== a.achievementsUnlocked) {
      return b.achievementsUnlocked - a.achievementsUnlocked;
    }
    return a.fullName.localeCompare(b.fullName, "ru");
  });
}

export function assignLeaderboardRanks(sorted: LeaderboardCandidate[]): LeaderboardRow[] {
  return sorted.map((row, index) => ({ ...row, rank: index + 1 }));
}

function deriveCurrentModuleTitle(
  modules: { id: string; title: string }[],
  byModule: Map<string, { moduleCompleted: boolean }>,
): string | null {
  if (modules.length === 0) return null;
  let allComplete = true;
  for (const m of modules) {
    const p = byModule.get(m.id);
    if (!p?.moduleCompleted) {
      allComplete = false;
      return m.title;
    }
  }
  return allComplete ? "Все модули завершены" : null;
}

/**
 * Турнирная таблица студентов по основному курсу (только USER с заполненным профилем).
 */
export async function getLeaderboard(): Promise<LeaderboardRow[]> {
  const course = await prisma.course.findFirst({
    orderBy: { createdAt: "asc" },
    select: { id: true, title: true },
  });
  if (!course) return [];

  const modules = await prisma.module.findMany({
    where: { courseId: course.id, isActive: true },
    orderBy: { orderNumber: "asc" },
    select: { id: true, title: true },
  });
  const moduleIds = modules.map((m) => m.id);
  const totalModules = modules.length;

  const students = await prisma.user.findMany({
    where: { role: "USER", profile: { isNot: null } },
    select: {
      id: true,
      profile: {
        select: {
          firstName: true,
          lastName: true,
          middleName: true,
          educationalInstitution: true,
          avatarUrl: true,
        },
      },
    },
  });

  if (students.length === 0) return [];

  const userIds = students.map((s) => s.id);

  const [progressRows, achievementGroups] = await Promise.all([
    moduleIds.length > 0
      ? prisma.progress.findMany({
          where: { userId: { in: userIds }, moduleId: { in: moduleIds } },
          select: { userId: true, moduleId: true, score: true, moduleCompleted: true },
        })
      : Promise.resolve([]),
    prisma.userAchievement.groupBy({
      by: ["userId"],
      where: { userId: { in: userIds } },
      _count: { _all: true },
    }),
  ]);

  const achievementsByUser = new Map(achievementGroups.map((g) => [g.userId, g._count._all]));

  const progressByUser = new Map<string, Map<string, { moduleCompleted: boolean; score: number }>>();
  for (const row of progressRows) {
    let userMap = progressByUser.get(row.userId);
    if (!userMap) {
      userMap = new Map();
      progressByUser.set(row.userId, userMap);
    }
    userMap.set(row.moduleId, { moduleCompleted: row.moduleCompleted, score: row.score });
  }

  const candidates: LeaderboardCandidate[] = students.map((s) => {
    const p = s.profile!;
    const byModule = progressByUser.get(s.id) ?? new Map();
    let completedModules = 0;
    let totalScore = 0;
    for (const mid of moduleIds) {
      const pr = byModule.get(mid);
      if (pr?.moduleCompleted) completedModules += 1;
      totalScore += pr?.score ?? 0;
    }
    const progressPercent = totalModules ? Math.round((completedModules / totalModules) * 100) : 0;

    return {
      userId: s.id,
      fullName: profileFullName(p),
      educationalInstitution: p.educationalInstitution?.trim() || null,
      avatarUrl: p.avatarUrl,
      initials: profileInitials(p),
      progressPercent,
      totalScore,
      completedModules,
      totalModules,
      achievementsUnlocked: achievementsByUser.get(s.id) ?? 0,
      currentModuleTitle: deriveCurrentModuleTitle(modules, byModule),
    };
  });

  return assignLeaderboardRanks(sortLeaderboardCandidates(candidates));
}
