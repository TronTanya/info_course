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
    description: "Первый модуль курса закрыт.",
    hintLocked: "Завершите первый модуль: лекция, тест и практика.",
  },
  {
    kind: "PHISHING_PRACTICE_PASSED",
    slug: "phishing-detective",
    title: "Детектив фишинга",
    description: "Практика по разбору фишинга успешно принята.",
    hintLocked: "Сдайте практику «Разбор фишингового письма» со статусом «Принято».",
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
    description: "Расследование по журналам засчитано.",
    hintLocked: "Сдайте практику «Мини-SOC: анализ логов».",
  },
  {
    kind: "CERTIFICATE_EARNED",
    slug: "course-complete",
    title: "Курс завершён",
    description: "Сертификат получен — поздравляем!",
    hintLocked: "Завершите все модули и получите сертификат.",
  },
  {
    kind: "AI_MENTOR_USED",
    slug: "ai-mentor",
    title: "Спросил наставника",
    description: "Первый вопрос наставнику ИИ.",
    hintLocked: "Откройте чат наставника на лекции или практике и задайте вопрос.",
  },
  {
    kind: "COURSE_HALF_COMPLETE",
    slug: "half-course",
    title: "Ровно полпути",
    description: "Половина модулей курса уже позади.",
    hintLocked: "Закройте половину модулей курса.",
  },
  {
    kind: "TEST_PERFECT_SCORE",
    slug: "perfect-test",
    title: "Идеальный зачёт",
    description: "Тест сдан на 100% — без единой ошибки.",
    hintLocked: "Пройдите любой модульный тест без потери баллов.",
  },
  {
    kind: "LESSON_STUDIED",
    slug: "first-lecture",
    title: "Первая лекция",
    description: "Вы отметили хотя бы одну лекцию как изученную.",
    hintLocked: "На странице урока нажмите «Отметить лекцию изученной».",
  },
  {
    kind: "TEST_PASSED",
    slug: "test-survivor",
    title: "Тест выдержан",
    description: "Модульный тест сдан с проходным баллом.",
    hintLocked: "Пройдите любой тест модуля — не обязательно на 100%.",
  },
  {
    kind: "TWO_MODULES_COMPLETE",
    slug: "two-modules",
    title: "Два модуля",
    description: "Два модуля полностью закрыты.",
    hintLocked: "Полностью завершите второй модуль.",
  },
  {
    kind: "THREE_MODULES_COMPLETE",
    slug: "three-modules",
    title: "Три модуля",
    description: "Три модуля уже в портфеле.",
    hintLocked: "Полностью завершите три модуля.",
  },
  {
    kind: "PRACTICE_SUBMITTED",
    slug: "practice-sent",
    title: "Практика ушла",
    description: "Вы отправили практическое задание на проверку.",
    hintLocked: "Отправьте любую практику (не оставляйте только черновик).",
  },
  {
    kind: "MENTOR_CHAT_ACTIVE",
    slug: "mentor-regular",
    title: "Друг наставника",
    description: "Три сообщения в чате наставника ИИ.",
    hintLocked: "Задайте наставнику три вопроса на лекции или практике.",
  },
  {
    kind: "TEST_RETRY",
    slug: "test-retry",
    title: "Второй заход",
    description: "Вы пересдали тест — упорство вознаграждается.",
    hintLocked: "Пройдите один и тот же модульный тест повторно.",
  },
  {
    kind: "ALL_LESSONS_STUDIED",
    slug: "all-lectures",
    title: "Все лекции",
    description: "Лекции изучены во всех модулях.",
    hintLocked: "Отметьте лекцию изученной в каждом модуле.",
  },
  {
    kind: "ONE_MODULE_REMAINING",
    slug: "almost-done",
    title: "Почти финиш",
    description: "До сертификата остался один модуль.",
    hintLocked: "Завершите все модули, кроме одного.",
  },
];

export type AchievementRow = (typeof ACHIEVEMENT_CATALOG)[number] & {
  unlocked: boolean;
  unlockedAt: string | null;
};

/** Добавлены после первого релиза achievements — на старом Prisma Client их нет. */
const EXTENDED_ACHIEVEMENT_KINDS = new Set<AchievementKind>(
  ACHIEVEMENT_CATALOG.map((d) => d.kind).filter(
    (k) =>
      k !== "FIRST_MODULE_COMPLETE" &&
      k !== "PHISHING_PRACTICE_PASSED" &&
      k !== "PASSWORD_MODULE_COMPLETE" &&
      k !== "LOG_INVESTIGATION_PASSED" &&
      k !== "CERTIFICATE_EARNED",
  ),
);

function isPrismaClientValidationError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    (error as { name: string }).name === "PrismaClientValidationError"
  );
}

async function persistGrantedAchievements(userId: string, kinds: AchievementKind[]): Promise<AchievementKind[]> {
  const batch = [...new Set(kinds)];
  if (batch.length === 0) return [];

  const run = async (kindsToGrant: AchievementKind[]) => {
    const existing = await prisma.userAchievement.findMany({
      where: { userId, kind: { in: kindsToGrant } },
      select: { kind: true },
    });
    const have = new Set(existing.map((e) => e.kind));
    const newlyGranted = kindsToGrant.filter((k) => !have.has(k));
    if (newlyGranted.length === 0) return [];

    await prisma.userAchievement.createMany({
      data: newlyGranted.map((kind) => ({ userId, kind })),
      skipDuplicates: true,
    });
    return newlyGranted;
  };

  try {
    return await run(batch);
  } catch (error) {
    const hasExtended = batch.some((k) => EXTENDED_ACHIEVEMENT_KINDS.has(k));
    if (!hasExtended || !isPrismaClientValidationError(error)) throw error;
    const legacyOnly = batch.filter((k) => !EXTENDED_ACHIEVEMENT_KINDS.has(k));
    return run(legacyOnly);
  }
}

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

  const halfThreshold = Math.ceil(modules.length / 2);

  const [progressRows, acceptedScenario, cert, testAttempts, practiceSubmissions] = await Promise.all([
    prisma.progress.findMany({
      where: { userId, moduleId: { in: moduleIds } },
      select: {
        moduleId: true,
        moduleCompleted: true,
        lessonCompleted: true,
      },
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
    prisma.testAttempt.findMany({
      where: { userId },
      select: { testId: true, score: true, maxScore: true, passed: true },
      take: 200,
    }),
    prisma.submission.count({
      where: {
        userId,
        status: { not: "DRAFT" },
      },
    }),
  ]);

  let aiMessages = 0;
  try {
    aiMessages = await prisma.tutorChatMessage.count({
      where: { thread: { userId }, role: "user" },
    });
  } catch {
    aiMessages = 0;
  }

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

  if (aiMessages > 0) {
    toGrant.push("AI_MENTOR_USED");
  }

  if (completed.size >= halfThreshold) {
    toGrant.push("COURSE_HALF_COMPLETE");
  }

  if (testAttempts.some((a) => a.passed && a.maxScore > 0 && a.score >= a.maxScore)) {
    toGrant.push("TEST_PERFECT_SCORE");
  }

  if (progressRows.some((p) => p.lessonCompleted)) {
    toGrant.push("LESSON_STUDIED");
  }

  if (testAttempts.some((a) => a.passed)) {
    toGrant.push("TEST_PASSED");
  }

  if (completed.size >= 2) {
    toGrant.push("TWO_MODULES_COMPLETE");
  }

  if (completed.size >= 3) {
    toGrant.push("THREE_MODULES_COMPLETE");
  }

  if (practiceSubmissions > 0) {
    toGrant.push("PRACTICE_SUBMITTED");
  }

  if (aiMessages >= 3) {
    toGrant.push("MENTOR_CHAT_ACTIVE");
  }

  const attemptsPerTest = new Map<string, number>();
  for (const a of testAttempts) {
    attemptsPerTest.set(a.testId, (attemptsPerTest.get(a.testId) ?? 0) + 1);
  }
  if ([...attemptsPerTest.values()].some((n) => n >= 2)) {
    toGrant.push("TEST_RETRY");
  }

  const lessonsStudiedCount = progressRows.filter((p) => p.lessonCompleted).length;
  if (lessonsStudiedCount >= modules.length) {
    toGrant.push("ALL_LESSONS_STUDIED");
  }

  if (!cert && completed.size === modules.length - 1 && modules.length > 1) {
    toGrant.push("ONE_MODULE_REMAINING");
  }

  return persistGrantedAchievements(userId, toGrant);
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
