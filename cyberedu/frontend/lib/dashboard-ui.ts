import type { ProfileCourseStats } from "@/lib/profile-course-stats";
import type { CourseProgressModuleRow } from "@/lib/progress";
import { getModuleAction, getUiStatus, moduleDifficultyByOrder } from "@/lib/course-path-ui";

export type DashboardStepMetrics = {
  lessonsDone: number;
  lessonsTotal: number;
  testsDone: number;
  testsTotal: number;
  practiceDone: number;
  practiceTotal: number;
};

export type DashboardUpcomingTask = {
  id: string;
  kind: "lesson" | "test" | "practice";
  title: string;
  moduleTitle: string;
  href: string;
  priority: number;
};

export type DashboardActivityItem = {
  id: string;
  kind: "lesson" | "test" | "practice";
  label: string;
  detail: string;
  at: string;
  meta?: string;
};

export function computeStepMetrics(modules: CourseProgressModuleRow[]): DashboardStepMetrics {
  let lessonsDone = 0;
  let lessonsTotal = 0;
  let testsDone = 0;
  let testsTotal = 0;
  let practiceDone = 0;
  let practiceTotal = 0;

  for (const row of modules) {
    const { requirements: req, progress: p } = row;
    if (req.lessonRequired) {
      lessonsTotal++;
      if (p?.lessonCompleted) lessonsDone++;
    }
    if (req.testRequired) {
      testsTotal++;
      if (p?.testCompleted) testsDone++;
    }
    if (req.practiceRequired) {
      practiceTotal++;
      if (p?.practiceCompleted) practiceDone++;
    }
  }

  return { lessonsDone, lessonsTotal, testsDone, testsTotal, practiceDone, practiceTotal };
}

export function buildRecentActivities(stats: ProfileCourseStats): DashboardActivityItem[] {
  const items: DashboardActivityItem[] = [];

  if (stats.lastLesson) {
    items.push({
      id: "lesson",
      kind: "lesson",
      label: "Лекция",
      detail: stats.lastLesson.lessonTitle,
      at: stats.lastLesson.at,
      meta: stats.lastLesson.moduleTitle,
    });
  }
  if (stats.lastTest) {
    items.push({
      id: "test",
      kind: "test",
      label: "Тест",
      detail: stats.lastTest.testTitle,
      at: stats.lastTest.at,
      meta: `${stats.lastTest.moduleTitle} · ${stats.lastTest.passed ? "зачёт" : "попытка"} ${stats.lastTest.percent}%`,
    });
  }
  if (stats.lastPractice) {
    items.push({
      id: "practice",
      kind: "practice",
      label: "Практика",
      detail: stats.lastPractice.taskTitle,
      at: stats.lastPractice.at,
      meta: `${stats.lastPractice.moduleTitle} · ${stats.lastPractice.statusLabel}`,
    });
  }

  return items.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
}

export function buildUpcomingTasks(modules: CourseProgressModuleRow[]): DashboardUpcomingTask[] {
  const tasks: DashboardUpcomingTask[] = [];

  for (const row of modules) {
    if (!row.unlocked || row.moduleCompleted) continue;
    const { requirements: req, progress: p } = row;
    const base = `/dashboard/course/${row.module.id}`;
    const order = row.module.orderNumber;

    if (req.lessonRequired && !p?.lessonCompleted) {
      tasks.push({
        id: `${row.module.id}-lesson`,
        kind: "lesson",
        title: "Пройти лекцию",
        moduleTitle: row.module.title,
        href: `${base}/lesson`,
        priority: order * 10,
      });
      continue;
    }
    if (req.testRequired && !p?.testCompleted) {
      tasks.push({
        id: `${row.module.id}-test`,
        kind: "test",
        title: "Сдать тест",
        moduleTitle: row.module.title,
        href: `${base}/test`,
        priority: order * 10 + 1,
      });
      continue;
    }
    if (req.practiceRequired && !p?.practiceCompleted) {
      tasks.push({
        id: `${row.module.id}-practice`,
        kind: "practice",
        title: "Выполнить практику",
        moduleTitle: row.module.title,
        href: `${base}/practice`,
        priority: order * 10 + 2,
      });
    }
  }

  return tasks.sort((a, b) => a.priority - b.priority).slice(0, 5);
}

export function findCurrentModuleRow(
  modules: CourseProgressModuleRow[],
  currentModuleId: string | null,
): CourseProgressModuleRow | null {
  if (!currentModuleId) return null;
  return modules.find((m) => m.module.id === currentModuleId) ?? null;
}

/** Первый разблокированный модуль, который ещё не завершён (для карты курса). */
export function findFocusModule(modules: CourseProgressModuleRow[]): CourseProgressModuleRow | null {
  return modules.find((m) => m.unlocked && !m.moduleCompleted) ?? null;
}

export function getContinueFromModules(
  modules: CourseProgressModuleRow[],
  courseTitle: string,
): { href: string; label: string; hint: string } {
  const allDone = modules.length > 0 && modules.every((m) => m.moduleCompleted);
  if (allDone) {
    return {
      href: "/dashboard/certificate",
      label: "Перейти к сертификату",
      hint: "Все модули пройдены — оформите сертификат.",
    };
  }

  const focus = findFocusModule(modules);
  if (!focus) {
    return {
      href: "/dashboard/course",
      label: "Продолжить обучение",
      hint: `Курс «${courseTitle}»: выберите доступный модуль ниже.`,
    };
  }

  const action = getModuleAction(focus);
  return {
    href: action.disabled ? `/dashboard/course/${focus.module.id}` : action.href,
    label: "Продолжить обучение",
    hint: `Модуль ${focus.module.orderNumber}: «${focus.module.title}».`,
  };
}

export function getContinueTarget(
  stats: ProfileCourseStats,
  modules: CourseProgressModuleRow[],
): { href: string; label: string; title: string; subtitle: string } {
  if (stats.allModulesComplete) {
    return {
      href: "/dashboard/certificate",
      label: "Перейти к сертификату",
      title: "Курс пройден",
      subtitle: "Оформите сертификат или повторите материалы в карте курса.",
    };
  }

  const row = findCurrentModuleRow(modules, stats.currentModuleId);
  if (row) {
    const action = getModuleAction(row);
    return {
      href: action.disabled ? "/dashboard/course" : action.href,
      label: "Продолжить обучение",
      title: row.module.title,
      subtitle: `Модуль ${row.module.orderNumber} · ${action.label}`,
    };
  }

  return {
    href: "/dashboard/course",
    label: "Продолжить обучение",
    title: stats.courseTitle,
    subtitle: "Откройте карту курса и начните с первого доступного модуля.",
  };
}

export function welcomeStatusLabel(stats: ProfileCourseStats): string {
  if (stats.allModulesComplete) return "Курс завершён — осталось оформить результат";
  if (stats.currentModuleTitle) return `Сейчас: ${stats.currentModuleTitle}`;
  return "Начните с карты курса";
}

export type DashboardNextStepCard = {
  kind: "lesson" | "test" | "practice";
  title: string;
  moduleTitle: string;
  href: string;
  statusLabel: string;
  empty?: boolean;
  difficultyLabel?: string;
  /** Ориентир по шагам модуля (не жёсткий лимит). */
  estimatedLabel?: string;
};

export type DashboardLastTestResult = {
  testTitle: string;
  moduleTitle: string;
  percent: number;
  passed: boolean;
  at: string;
  href: string;
  reviewItems: string[];
};

export type DashboardAiRecommendation = {
  message: string;
  mentorHref: string;
  actionLabel: string;
};

export type DashboardCertificateRequirement = {
  label: string;
  met: boolean;
};

export type DashboardCertificateEligibility = {
  title: string;
  description: string;
  ctaHref: string;
  ctaLabel: string;
  requirements: DashboardCertificateRequirement[];
};

export type DashboardWeakTopic = {
  id: string;
  title: string;
  reason: string;
  href: string;
  tone: "warning" | "info";
};

function findModuleByTitle(modules: CourseProgressModuleRow[], moduleTitle: string): CourseProgressModuleRow | null {
  return modules.find((m) => m.module.title === moduleTitle) ?? null;
}

function firstUpcomingByKind(
  modules: CourseProgressModuleRow[],
  kind: DashboardUpcomingTask["kind"],
): DashboardUpcomingTask | null {
  return buildUpcomingTasks(modules).find((t) => t.kind === kind) ?? null;
}

function practiceEstimateLabel(row: CourseProgressModuleRow): string {
  const steps = row.requirements.totalSteps;
  if (steps <= 0) return "Время по заданию";
  const min = steps * 25;
  const max = steps * 45;
  return `~${min}–${max} мин`;
}

function enrichPracticeCard(
  card: DashboardNextStepCard,
  modules: CourseProgressModuleRow[],
): DashboardNextStepCard {
  const mod =
    modules.find((m) => card.href.includes(m.module.id)) ?? findFocusModule(modules);
  if (!mod) return card;
  return {
    ...card,
    difficultyLabel: moduleDifficultyByOrder(mod.module.orderNumber),
    estimatedLabel: card.empty ? undefined : practiceEstimateLabel(mod),
  };
}

/** Карточка ближайшей лекции (или повтор материала перед тестом). */
export function getNextLessonCard(modules: CourseProgressModuleRow[]): DashboardNextStepCard | null {
  if (modules.length === 0) return null;

  const upcoming = firstUpcomingByKind(modules, "lesson");
  if (upcoming) {
    return {
      kind: "lesson",
      title: "Лекция",
      moduleTitle: upcoming.moduleTitle,
      href: upcoming.href,
      statusLabel: "Следующий шаг",
    };
  }

  const focus = findFocusModule(modules);
  if (!focus) {
    return {
      kind: "lesson",
      title: "Нет открытых модулей",
      moduleTitle: "Завершите предыдущий модуль в цепочке",
      href: "/dashboard/course",
      statusLabel: "Карта курса",
      empty: true,
    };
  }

  const base = `/dashboard/course/${focus.module.id}`;
  const { requirements: req, progress: p } = focus;

  if (req.lessonRequired && !p?.lessonCompleted) {
    return {
      kind: "lesson",
      title: "Лекция модуля",
      moduleTitle: focus.module.title,
      href: `${base}/lesson`,
      statusLabel: "К началу модуля",
    };
  }

  if (req.testRequired && !p?.testCompleted && p?.lessonCompleted) {
    return {
      kind: "lesson",
      title: "Повторить материал",
      moduleTitle: focus.module.title,
      href: `${base}/lesson`,
      statusLabel: "Перед тестом",
    };
  }

  if (focus.moduleCompleted) {
    return {
      kind: "lesson",
      title: "Модуль завершён",
      moduleTitle: focus.module.title,
      href: base,
      statusLabel: "Открыть модуль",
    };
  }

  return {
    kind: "lesson",
    title: "Материалы модуля",
    moduleTitle: focus.module.title,
    href: `${base}/lesson`,
    statusLabel: "Лекция пройдена",
  };
}

/** Карточка ближайшей практики или теста, если практики ещё нет в очереди. */
export function getNextPracticeCard(modules: CourseProgressModuleRow[]): DashboardNextStepCard | null {
  if (modules.length === 0) return null;

  const practice = firstUpcomingByKind(modules, "practice");
  if (practice) {
    return enrichPracticeCard(
      {
        kind: "practice",
        title: practice.title.replace(/^Выполнить /, "") || "Практическая работа",
        moduleTitle: practice.moduleTitle,
        href: practice.href,
        statusLabel: "Следующий шаг",
      },
      modules,
    );
  }

  const test = firstUpcomingByKind(modules, "test");
  if (test) {
    return enrichPracticeCard(
      {
        kind: "test",
        title: "Контрольный тест",
        moduleTitle: test.moduleTitle,
        href: test.href,
        statusLabel: "После лекции",
      },
      modules,
    );
  }

  const focus = findFocusModule(modules);
  if (!focus) {
    return enrichPracticeCard(
      {
        kind: "practice",
        title: "Практика недоступна",
        moduleTitle: "Сначала откройте модуль в карте курса",
        href: "/dashboard/course",
        statusLabel: "Карта курса",
        empty: true,
      },
      modules,
    );
  }

  if (!focus.requirements.practiceRequired) {
    return enrichPracticeCard(
      {
        kind: "practice",
        title: "Без практики в модуле",
        moduleTitle: focus.module.title,
        href: `/dashboard/course/${focus.module.id}`,
        statusLabel: "Перейти к модулю",
        empty: true,
      },
      modules,
    );
  }

  if (focus.progress?.practiceCompleted) {
    return enrichPracticeCard(
      {
        kind: "practice",
        title: "Практика сдана",
        moduleTitle: focus.module.title,
        href: `/dashboard/course/${focus.module.id}/practice`,
        statusLabel: "Повторить лабораторию",
      },
      modules,
    );
  }

  return enrichPracticeCard(
    {
      kind: "practice",
      title: "Практика модуля",
      moduleTitle: focus.module.title,
      href: `/dashboard/course/${focus.module.id}/practice`,
      statusLabel: "После теста",
      empty: true,
    },
    modules,
  );
}

export function getLastTestResultView(
  stats: ProfileCourseStats,
  modules: CourseProgressModuleRow[],
): DashboardLastTestResult | null {
  if (!stats.lastTest) return null;

  const mod = findModuleByTitle(modules, stats.lastTest.moduleTitle);
  const href = mod ? `/dashboard/course/${mod.module.id}/test` : "/dashboard/course";
  const reviewItems: string[] = [];

  if (!stats.lastTest.passed) {
    reviewItems.push(`Результат ${stats.lastTest.percent}% — тест не зачтён, повторите после лекции`);
  } else {
    reviewItems.push(`Зачёт с результатом ${stats.lastTest.percent}%`);
  }

  if (stats.averageTestPercent != null && stats.averageTestPercent < 70) {
    reviewItems.push(`Средний балл по попыткам: ${stats.averageTestPercent}% — имеет смысл закрепить тему`);
  }

  const nextTest = firstUpcomingByKind(modules, "test");
  if (nextTest && !stats.lastTest.passed) {
    reviewItems.push("Перед повторной попыткой пройдите материал лекции ещё раз");
  }

  return {
    testTitle: stats.lastTest.testTitle,
    moduleTitle: stats.lastTest.moduleTitle,
    percent: stats.lastTest.percent,
    passed: stats.lastTest.passed,
    at: stats.lastTest.at,
    href,
    reviewItems,
  };
}

export function buildAiRecommendation(
  stats: ProfileCourseStats,
  modules: CourseProgressModuleRow[],
): DashboardAiRecommendation {
  const mentorHref = getMentorHref(modules, stats);

  if (stats.lastTest && !stats.lastTest.passed) {
    return {
      message: `Разберите ошибки теста «${stats.lastTest.testTitle}» с наставником — он объяснит тему проще, без спойлеров ответов.`,
      mentorHref,
      actionLabel: "Спросить AI",
    };
  }

  if (stats.allModulesComplete) {
    return {
      message: stats.certificateIssued
        ? "Курс и сертификат на месте. Спросите наставника, как перенести навыки в рабочие сценарии SOC."
        : "Все модули закрыты — оформите сертификат и при необходимости повторите слабые темы с наставником.",
      mentorHref: stats.currentModuleId
        ? `/dashboard/course/${stats.currentModuleId}/lesson`
        : "/dashboard/course",
      actionLabel: "Спросить AI",
    };
  }

  const focus = findFocusModule(modules);
  if (focus) {
    const upcoming = buildUpcomingTasks(modules)[0];
    if (upcoming?.kind === "lesson") {
      return {
        message: `Сейчас в фокусе модуль «${focus.module.title}». Наставник поможет понять лекцию перед тестом.`,
        mentorHref,
        actionLabel: "Спросить AI",
      };
    }
    if (upcoming?.kind === "practice") {
      return {
        message: `Готовьтесь к практике в модуле «${focus.module.title}» — наставник даст подсказки без готового решения.`,
        mentorHref,
        actionLabel: "Спросить AI",
      };
    }
  }

  return {
    message: "Откройте лекцию текущего модуля — наставник ускорит понимание и проверит, усвоили ли вы материал.",
    mentorHref,
    actionLabel: "Спросить AI",
  };
}

export function getCertificateEligibility(
  stats: ProfileCourseStats,
  metrics: DashboardStepMetrics,
): DashboardCertificateEligibility {
  const requirements: DashboardCertificateRequirement[] = [
    {
      label: `Модули: ${stats.completedModules} / ${stats.totalModules}`,
      met: stats.allModulesComplete,
    },
    {
      label:
        metrics.lessonsTotal > 0
          ? `Лекции: ${metrics.lessonsDone} / ${metrics.lessonsTotal}`
          : "Лекции: не требуются",
      met: metrics.lessonsTotal === 0 || metrics.lessonsDone >= metrics.lessonsTotal,
    },
    {
      label:
        metrics.testsTotal > 0 ? `Тесты: ${metrics.testsDone} / ${metrics.testsTotal}` : "Тесты: не требуются",
      met: metrics.testsTotal === 0 || metrics.testsDone >= metrics.testsTotal,
    },
    {
      label:
        metrics.practiceTotal > 0
          ? `Практика: ${metrics.practiceDone} / ${metrics.practiceTotal}`
          : "Практика: не требуется",
      met: metrics.practiceTotal === 0 || metrics.practiceDone >= metrics.practiceTotal,
    },
  ];

  if (stats.certificateIssued) {
    return {
      title: "Сертификат выдан",
      description: stats.certificateNumber
        ? `Документ № ${stats.certificateNumber} — скачайте PDF и передайте ссылку на проверку.`
        : "Сертификат доступен в разделе «Сертификат».",
      ctaHref: "/dashboard/certificate",
      ctaLabel: "Открыть сертификат",
      requirements,
    };
  }

  if (stats.allModulesComplete && stats.canGenerateCertificate) {
    return {
      title: "Можно получить сертификат",
      description: "Все требования выполнены — сгенерируйте документ с QR и публичной проверкой.",
      ctaHref: "/dashboard/certificate",
      ctaLabel: "Получить сертификат",
      requirements,
    };
  }

  return {
    title:
      stats.modulesUntilCertificate > 0
        ? `До сертификата: ${stats.modulesUntilCertificate} мод.`
        : "Прогресс к сертификату",
    description: "Завершите все модули программы — после этого откроется выдача сертификата.",
    ctaHref: "/dashboard/certificate",
    ctaLabel: "Условия сертификата",
    requirements,
  };
}

/** Позиция студента в треке для шапки кабинета. */
export function getCoursePositionLabel(stats: ProfileCourseStats, modules: CourseProgressModuleRow[]): string {
  if (stats.allModulesComplete) return "Финиш программы";
  const focus = findFocusModule(modules);
  if (focus) return `Модуль ${focus.module.orderNumber} из ${stats.totalModules}`;
  if (stats.currentModuleTitle) return stats.currentModuleTitle;
  return stats.courseTitle;
}

/** Рекомендации на основе реальных неуспехов и очереди шагов (без выдуманных тем). */
export function buildWeakTopicRecommendations(
  stats: ProfileCourseStats,
  modules: CourseProgressModuleRow[],
): DashboardWeakTopic[] {
  const items: DashboardWeakTopic[] = [];

  if (stats.lastTest && !stats.lastTest.passed) {
    const mod = findModuleByTitle(modules, stats.lastTest.moduleTitle);
    items.push({
      id: "weak-test",
      title: stats.lastTest.testTitle,
      reason: `Тест не зачтён — ${stats.lastTest.percent}% в модуле «${stats.lastTest.moduleTitle}»`,
      href: mod ? `/dashboard/course/${mod.module.id}/test` : "/dashboard/course",
      tone: "warning",
    });
  }

  if (stats.lastPractice) {
    const { status, statusLabel, taskTitle, moduleTitle } = stats.lastPractice;
    const mod = findModuleByTitle(modules, moduleTitle);
    if (status === "NEEDS_REVISION") {
      items.push({
        id: "weak-revision",
        title: taskTitle,
        reason: `Работа на доработке · ${moduleTitle}`,
        href: mod ? `/dashboard/course/${mod.module.id}/practice` : "/dashboard/my-assignments",
        tone: "warning",
      });
    } else if (status === "REJECTED") {
      items.push({
        id: "weak-rejected",
        title: taskTitle,
        reason: `Отправка отклонена · ${moduleTitle}`,
        href: mod ? `/dashboard/course/${mod.module.id}/practice` : "/dashboard/my-assignments",
        tone: "warning",
      });
    } else if (status === "SUBMITTED" || status === "CHECKING") {
      items.push({
        id: "weak-pending",
        title: taskTitle,
        reason: `${statusLabel} · ${moduleTitle}`,
        href: "/dashboard/my-assignments",
        tone: "info",
      });
    }
  }

  const nextTest = firstUpcomingByKind(modules, "test");
  if (nextTest && !items.some((i) => i.id === "weak-test")) {
    items.push({
      id: "upcoming-test",
      title: nextTest.moduleTitle,
      reason: "Рекомендуем повторить лекцию перед контрольным тестом",
      href: nextTest.href.replace(/\/test$/, "/lesson"),
      tone: "info",
    });
  }

  if (stats.scoreSuccessPercent > 0 && stats.scoreSuccessPercent < 55 && stats.maxPossiblePoints > 0) {
    items.push({
      id: "weak-score",
      title: "Набор баллов по курсу",
      reason: `Сейчас ${stats.scoreSuccessPercent}% от максимума — имеет смысл вернуться к тестам и практике`,
      href: stats.currentModuleId ? `/dashboard/course/${stats.currentModuleId}` : "/dashboard/course",
      tone: "info",
    });
  }

  return items.slice(0, 4);
}

export function getMentorHref(modules: CourseProgressModuleRow[], stats: ProfileCourseStats): string {
  const focus = findFocusModule(modules);
  if (focus) return `/dashboard/course/${focus.module.id}/lesson`;
  if (stats.currentModuleId) return `/dashboard/course/${stats.currentModuleId}/lesson`;
  return "/dashboard/course";
}

export function getQuickActionHrefs(modules: CourseProgressModuleRow[], stats: ProfileCourseStats) {
  const focus = findFocusModule(modules);
  const base = focus ? `/dashboard/course/${focus.module.id}` : stats.currentModuleId ? `/dashboard/course/${stats.currentModuleId}` : null;
  const testTask = firstUpcomingByKind(modules, "test");
  const practiceTask = firstUpcomingByKind(modules, "practice");

  return {
    modules: "/dashboard/course",
    practice: practiceTask?.href ?? (base ? `${base}/practice` : "/dashboard/course"),
    test: testTask?.href ?? (base ? `${base}/test` : "/dashboard/course"),
    mentor: getMentorHref(modules, stats),
  };
}

export function countPendingTasks(modules: CourseProgressModuleRow[]): number {
  return buildUpcomingTasks(modules).length;
}

export { getUiStatus };
