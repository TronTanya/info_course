import type { AchievementKind } from "@prisma/client";
import { prisma } from "@/lib/db";

/** Метаданные для UI (порядок отображения). */
export const ACHIEVEMENT_CATALOG: {
  kind: AchievementKind;
  slug: string;
  title: string;
  description: string;
  /** Подсказка, как открыть (мотивация). */
  hintLocked: string;
}[] = [
  {
    kind: "FIRST_MODULE_COMPLETE",
    slug: "first-step",
    title: "Первый шаг",
    description: "Вы завершили первый модуль курса — траектория запущена.",
    hintLocked: "Завершите первый модуль: лекция, тест и практика по требованиям модуля.",
  },
  {
    kind: "PHISHING_PRACTICE_PASSED",
    slug: "phishing-detective",
    title: "Детектив фишинга",
    description: "Практика по разбору фишинга успешно принята.",
    hintLocked: "Пройдите учебную практику «Разбор фишингового письма» до статуса «Принято».",
  },
  {
    kind: "PASSWORD_MODULE_COMPLETE",
    slug: "account-defender",
    title: "Защитник аккаунта",
    description: "Модуль с практикой по паролям полностью завершён.",
    hintLocked: "Закройте модуль, где есть задание «Анализ паролей».",
  },
  {
    kind: "LOG_INVESTIGATION_PASSED",
    slug: "log-analyst",
    title: "Аналитик логов",
    description: "Итоговое расследование по журналам событий засчитано.",
    hintLocked: "Успешно сдайте практику «Мини-SOC: анализ логов» или завершите модуль с этим заданием.",
  },
  {
    kind: "CERTIFICATE_EARNED",
    slug: "course-complete",
    title: "Курс завершён",
    description: "Сертификат получен — поздравляем!",
    hintLocked: "Завершите все модули и выпустите сертификат в разделе курса или профиля.",
  },
];

export type AchievementRow = (typeof ACHIEVEMENT_CATALOG)[number] & {
  unlocked: boolean;
  unlockedAt: string | null;
};

/**
 * Синхронизирует достижения с фактами в БД. Идемпотентно: повторные вызовы не создают дубликаты.
 * Вызывать после пересчёта прогресса модуля и после выдачи сертификата.
 */
export function achievementNoticesFromKinds(kinds: AchievementKind[]): {
  kind: AchievementKind;
  title: string;
  description: string;
}[] {
  return kinds.map((kind) => {
    const def = ACHIEVEMENT_CATALOG.find((d) => d.kind === kind);
    return {
      kind,
      title: def?.title ?? kind,
      description: def?.description ?? "",
    };
  });
}

export async function reconcileUserAchievements(userId: string): Promise<AchievementKind[]> {
  const course = await prisma.course.findFirst({
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  if (!course) return [];

  const modules = await prisma.module.findMany({
    where: { courseId: course.id, isActive: true },
    orderBy: { orderNumber: "asc" },
    select: {
      id: true,
      orderNumber: true,
      practicalTasks: { select: { taskType: true } },
    },
  });
  if (modules.length === 0) return [];

  const firstModule = modules[0];
  if (!firstModule) return [];

  const moduleIds = modules.map((m) => m.id);

  const [progressRows, acceptedScenario, cert] = await Promise.all([
    prisma.progress.findMany({
      where: { userId, moduleId: { in: moduleIds } },
      select: { moduleId: true, moduleCompleted: true },
    }),
    prisma.submission.findMany({
      where: {
        userId,
        status: "ACCEPTED",
        practicalTask: { taskType: { in: ["PHISHING_ANALYSIS", "LOG_ANALYSIS"] } },
      },
      select: { practicalTask: { select: { taskType: true } } },
    }),
    prisma.certificate.findUnique({
      where: { userId_courseId: { userId, courseId: course.id } },
      select: { id: true },
    }),
  ]);

  const completed = new Set(progressRows.filter((p) => p.moduleCompleted).map((p) => p.moduleId));
  const acceptedTypes = new Set(acceptedScenario.map((s) => s.practicalTask.taskType));

  const hasTaskTypeCompletedModule = (taskType: "PASSWORD_ANALYSIS" | "PHISHING_ANALYSIS" | "LOG_ANALYSIS") =>
    modules.some(
      (m) => m.practicalTasks.some((t) => t.taskType === taskType) && completed.has(m.id),
    );

  const toGrant: AchievementKind[] = [];

  if (completed.has(firstModule.id)) {
    toGrant.push("FIRST_MODULE_COMPLETE");
  }

  if (acceptedTypes.has("PHISHING_ANALYSIS") || hasTaskTypeCompletedModule("PHISHING_ANALYSIS")) {
    toGrant.push("PHISHING_PRACTICE_PASSED");
  }

  if (hasTaskTypeCompletedModule("PASSWORD_ANALYSIS")) {
    toGrant.push("PASSWORD_MODULE_COMPLETE");
  }

  if (acceptedTypes.has("LOG_ANALYSIS") || hasTaskTypeCompletedModule("LOG_ANALYSIS")) {
    toGrant.push("LOG_INVESTIGATION_PASSED");
  }

  if (cert) {
    toGrant.push("CERTIFICATE_EARNED");
  }

  if (toGrant.length === 0) return [];

  const existing = await prisma.userAchievement.findMany({
    where: { userId, kind: { in: toGrant } },
    select: { kind: true },
  });
  const have = new Set(existing.map((e) => e.kind));
  const newlyGranted = toGrant.filter((k) => !have.has(k));
  if (newlyGranted.length === 0) return [];

  await prisma.userAchievement.createMany({
    data: newlyGranted.map((kind) => ({
      userId,
      kind,
    })),
    skipDuplicates: true,
  });

  return newlyGranted;
}

export async function getUserAchievementRows(userId: string): Promise<AchievementRow[]> {
  const rows = await prisma.userAchievement.findMany({
    where: { userId },
    select: { kind: true, unlockedAt: true },
  });
  const byKind = new Map(rows.map((r) => [r.kind, r.unlockedAt]));

  return ACHIEVEMENT_CATALOG.map((def) => ({
    ...def,
    unlocked: byKind.has(def.kind),
    unlockedAt: byKind.get(def.kind)?.toISOString() ?? null,
  }));
}
