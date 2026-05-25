import { DASHBOARD_MENTOR_PAGE_PATH } from "@/lib/dashboard-ai-widget";
import {
  dashboardHrefByModuleId,
  dashboardHrefForModuleRow,
  findModuleRowByTitle,
} from "@/lib/dashboard-learning-links";
import type { ProfileCourseStats } from "@/lib/profile-course-stats";
import type { CourseProgressModuleRow } from "@/lib/progress";
import {
  getModuleAction,
  getModuleSkillLine,
  getUiStatus,
  moduleDifficultyByOrder,
} from "@/lib/course-path-ui";

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
  kind: "lesson" | "test" | "practice" | "certificate";
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

export type DashboardContinueStepKind = "lesson" | "test" | "practice" | "certificate" | "course";

export type DashboardContinueLearningCard = {
  kind: DashboardContinueStepKind | "empty";
  title: string;
  moduleTitle: string;
  description: string;
  estimatedLabel: string | null;
  statusLabel: string;
  href: string;
  ctaLabel: string;
  empty?: boolean;
};

export const CONTINUE_LEARNING_CTA: Record<DashboardContinueStepKind | "empty", string> = {
  lesson: "Продолжить урок",
  test: "Пройти тест",
  practice: "Открыть практику",
  certificate: "Получить сертификат",
  course: "Открыть курс",
  empty: "Открыть курс",
};

const CONTINUE_STATUS_LABEL: Record<DashboardContinueStepKind | "empty", string> = {
  lesson: "Лекция",
  test: "Тест",
  practice: "Практика",
  certificate: "Сертификат",
  course: "Модуль",
  empty: "Старт",
};

const CONTINUE_PRACTICE_RETRY_DESCRIPTION =
  "Работа возвращена на доработку — откройте задание и обновите отправку.";

export type DashboardRoadmapPreviewModule = {
  moduleId: string;
  orderNumber: number;
  title: string;
  progressPercent: number;
  status: ReturnType<typeof getUiStatus>;
  href: string;
  isCurrent: boolean;
};

const CONTINUE_STEP_DESCRIPTION: Record<"lesson" | "test" | "practice", string> = {
  lesson: "Пройдите лекцию и закрепите материал перед контролем.",
  test: "Проверьте понимание темы — наставник не подсказывает ответы.",
  practice: "Лаборатория: разбор сценария и отправка работы на проверку.",
};

function estimateStepDuration(
  kind: DashboardContinueStepKind,
  modules: CourseProgressModuleRow[],
  moduleId: string | null,
): string | null {
  if (kind === "certificate") return null;
  if (kind === "lesson") return "~25–40 мин";
  if (kind === "test") return "~15–25 мин";
  if (kind === "practice" && moduleId) {
    const row = modules.find((m) => m.module.id === moduleId);
    return row ? practiceEstimateLabel(row) : "~30–45 мин";
  }
  return "~30–45 мин";
}

/** Мотивационная строка под приветствием (без выдуманных метрик). */
export function buildWelcomeMotivation(stats: ProfileCourseStats): string {
  if (stats.allModulesComplete) {
    return stats.certificateIssued
      ? "Курс пройден — сертификат уже в кабинете."
      : "Финиш близко — оформите сертификат и закрепите результат.";
  }
  if (stats.lastTest && !stats.lastTest.passed) {
    return "Разберите ошибки теста и вернитесь к материалу — зачёт в пределах досягаемости.";
  }
  if (stats.modulesUntilCertificate > 0 && stats.modulesUntilCertificate <= 2) {
    return `До сертификата осталось ${stats.modulesUntilCertificate} мод. — держите темп.`;
  }
  return "Каждый модуль добавляет навыки, которые можно применить в реальных сценариях SOC.";
}

/** Дата последней активности для шапки кабинета. */
export function formatDashboardLastActivity(stats: ProfileCourseStats): string | null {
  const summary = stats.lastActivitySummary;
  if (!summary?.at) return null;
  try {
    return new Intl.DateTimeFormat("ru-RU", {
      day: "numeric",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(summary.at));
  } catch {
    return null;
  }
}

function continueModuleHref(row: CourseProgressModuleRow, step: "lesson" | "test" | "practice" | "module"): string {
  if (!row.unlocked) return "/dashboard/course";
  const base = `/dashboard/course/${row.module.id}`;
  if (step === "module") return base;
  return `${base}/${step}`;
}

function lessonGateMet(row: CourseProgressModuleRow): boolean {
  const { requirements: req, progress: p } = row;
  return !req.lessonRequired || Boolean(p?.lessonCompleted);
}

function testGateMet(row: CourseProgressModuleRow): boolean {
  const { requirements: req, progress: p } = row;
  return !req.testRequired || Boolean(p?.testCompleted);
}

function packContinueCard(
  kind: DashboardContinueLearningCard["kind"],
  row: CourseProgressModuleRow,
  over: Partial<Pick<DashboardContinueLearningCard, "title" | "description" | "statusLabel" | "ctaLabel">>,
): DashboardContinueLearningCard {
  const href =
    kind === "empty"
      ? "/dashboard/course"
      : kind === "certificate"
        ? "/dashboard/certificate"
        : kind === "course"
          ? continueModuleHref(row, "module")
          : continueModuleHref(row, kind);

  const defaultDescription =
    kind === "lesson" || kind === "test" || kind === "practice"
      ? CONTINUE_STEP_DESCRIPTION[kind]
      : "";

  return {
    kind,
    title: over.title ?? row.module.title,
    moduleTitle: row.module.title,
    description: over.description ?? defaultDescription,
    estimatedLabel:
      kind === "certificate" || kind === "empty" || kind === "course"
        ? null
        : estimateStepDuration(kind, [row], row.module.id),
    statusLabel: over.statusLabel ?? CONTINUE_STATUS_LABEL[kind],
    href,
    ctaLabel: over.ctaLabel ?? CONTINUE_LEARNING_CTA[kind],
    empty: kind === "empty",
  };
}

/** Шаги 1–3 в рамках одного разблокированного модуля (без locked href). */
function continueStepInModule(row: CourseProgressModuleRow): DashboardContinueLearningCard | null {
  if (!row.unlocked) return null;

  const { requirements: req, progress: p } = row;

  if (req.lessonRequired && !p?.lessonCompleted) {
    return packContinueCard("lesson", row, {
      title: "Лекция модуля",
      description: CONTINUE_STEP_DESCRIPTION.lesson,
      statusLabel: CONTINUE_STATUS_LABEL.lesson,
      ctaLabel: CONTINUE_LEARNING_CTA.lesson,
    });
  }

  if (req.testRequired && !p?.testCompleted && lessonGateMet(row)) {
    return packContinueCard("test", row, {
      title: "Контрольный тест",
      description: CONTINUE_STEP_DESCRIPTION.test,
      statusLabel: CONTINUE_STATUS_LABEL.test,
      ctaLabel: CONTINUE_LEARNING_CTA.test,
    });
  }

  if (req.practiceRequired && !p?.practiceCompleted && lessonGateMet(row) && testGateMet(row)) {
    return packContinueCard("practice", row, {
      title: "Практическая работа",
      description: CONTINUE_STEP_DESCRIPTION.practice,
      statusLabel: CONTINUE_STATUS_LABEL.practice,
      ctaLabel: CONTINUE_LEARNING_CTA.practice,
    });
  }

  return null;
}

function continuePracticeRetryStep(
  row: CourseProgressModuleRow,
  stats: ProfileCourseStats,
): DashboardContinueLearningCard {
  const taskTitle =
    stats.lastPractice?.moduleTitle === row.module.title
      ? stats.lastPractice.taskTitle
      : "Практика на доработке";

  return packContinueCard("practice", row, {
    title: taskTitle,
    description: CONTINUE_PRACTICE_RETRY_DESCRIPTION,
    statusLabel: "На доработку",
    ctaLabel: CONTINUE_LEARNING_CTA.practice,
  });
}

function continueEmptyStep(stats: ProfileCourseStats): DashboardContinueLearningCard {
  return {
    kind: "empty",
    title: "Начните обучение с первого модуля.",
    moduleTitle: stats.courseTitle,
    description: "Откройте карту курса и выберите первый доступный модуль программы.",
    estimatedLabel: null,
    statusLabel: CONTINUE_STATUS_LABEL.empty,
    href: "/dashboard/course",
    ctaLabel: CONTINUE_LEARNING_CTA.empty,
    empty: true,
  };
}

/**
 * Главный next step для ContinueLearningCard.
 * Приоритет: урок → тест → практика → доработка практики → следующий модуль → сертификат.
 */
export function buildContinueLearningCard(
  stats: ProfileCourseStats,
  modules: CourseProgressModuleRow[],
): DashboardContinueLearningCard {
  if (modules.length === 0) {
    return continueEmptyStep(stats);
  }

  if (stats.allModulesComplete) {
    return {
      kind: "certificate",
      title: stats.certificateIssued ? "Сертификат выдан" : "Оформить сертификат",
      moduleTitle: stats.courseTitle,
      description: stats.certificateIssued
        ? "Документ доступен для скачивания и публичной проверки."
        : "Все модули завершены — сгенерируйте сертификат с QR-кодом.",
      estimatedLabel: null,
      statusLabel: CONTINUE_STATUS_LABEL.certificate,
      href: "/dashboard/certificate",
      ctaLabel: stats.canGenerateCertificate
        ? CONTINUE_LEARNING_CTA.certificate
        : "Посмотреть сертификат",
    };
  }

  const current = resolveActiveModuleRow(stats, modules);
  if (current) {
    const inCurrent = continueStepInModule(current);
    if (inCurrent) return inCurrent;
  }

  const retryRow = modules.find((m) => m.unlocked && m.practiceNeedsRevision);
  if (retryRow) {
    return continuePracticeRetryStep(retryRow, stats);
  }

  const focus = findFocusModule(modules);
  if (focus && focus.module.id !== current?.module.id) {
    const inFocus = continueStepInModule(focus);
    if (inFocus) return inFocus;

    const action = getModuleAction(focus);
    if (!action.disabled && action.href && action.href !== "#") {
      return {
        kind: "course",
        title: focus.module.title,
        moduleTitle: focus.module.title,
        description: `Модуль ${focus.module.orderNumber} · ${action.label}`,
        estimatedLabel: null,
        statusLabel: CONTINUE_STATUS_LABEL.course,
        href: action.href,
        ctaLabel: CONTINUE_LEARNING_CTA.course,
      };
    }

    if (focus.unlocked) {
      return packContinueCard("course", focus, {
        title: focus.module.title,
        description: `Модуль ${focus.module.orderNumber} — продолжите цепочку шагов.`,
        ctaLabel: CONTINUE_LEARNING_CTA.course,
      });
    }
  }

  if (focus) {
    const inFocus = continueStepInModule(focus);
    if (inFocus) return inFocus;
  }

  const anyUnlocked = modules.some((m) => m.unlocked);
  if (!anyUnlocked) {
    return continueEmptyStep(stats);
  }

  return continueEmptyStep(stats);
}

/** 3–5 ближайших модулей для превью карты курса. */
export function buildRoadmapPreviewModules(
  modules: CourseProgressModuleRow[],
  currentModuleId: string | null,
  limit = 5,
): DashboardRoadmapPreviewModule[] {
  if (modules.length === 0) return [];

  let anchorIdx = currentModuleId ? modules.findIndex((m) => m.module.id === currentModuleId) : -1;
  if (anchorIdx < 0) {
    anchorIdx = modules.findIndex((m) => m.unlocked && !m.moduleCompleted);
  }
  if (anchorIdx < 0) anchorIdx = Math.max(0, modules.length - 1);

  const start = Math.max(0, anchorIdx - 1);
  const slice = modules.slice(start, start + limit);
  const currentId =
    currentModuleId ?? (anchorIdx >= 0 ? modules[anchorIdx]?.module.id : null);

  return slice.map((row) => ({
    moduleId: row.module.id,
    orderNumber: row.module.orderNumber,
    title: row.module.title,
    progressPercent: row.progressPercent,
    status: getUiStatus(row),
    href: `/dashboard/course/${row.module.id}`,
    isCurrent: row.module.id === currentId,
  }));
}

export function buildRecentActivities(stats: ProfileCourseStats): DashboardActivityItem[] {
  const items: DashboardActivityItem[] = [];

  if (stats.certificateIssued && stats.issuedAt) {
    items.push({
      id: "certificate",
      kind: "certificate",
      label: "Сертификат",
      detail: stats.certificateNumber
        ? `Документ № ${stats.certificateNumber}`
        : "Сертификат получен",
      at: stats.issuedAt.toISOString(),
      meta: stats.courseTitle,
    });
  }

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

export type DashboardActiveModuleStep = {
  kind: "lesson" | "test" | "practice";
  label: string;
  state: "done" | "current" | "locked";
};

export type DashboardActiveModuleSnapshot = {
  moduleId: string;
  orderNumber: number;
  title: string;
  progressPercent: number;
  moduleHref: string;
  continueHref: string;
  continueLabel: string;
  skillLine: string;
  steps: DashboardActiveModuleStep[];
};

export type DashboardPendingPracticeItem = {
  id: string;
  taskTitle: string;
  moduleTitle: string;
  moduleId: string;
  statusLabel: string;
  href: string;
  at: string;
};

/** Текущий или фокусный модуль для панели «активный модуль». */
export function resolveActiveModuleRow(
  stats: ProfileCourseStats,
  modules: CourseProgressModuleRow[],
): CourseProgressModuleRow | null {
  if (stats.allModulesComplete) return null;
  const current = findCurrentModuleRow(modules, stats.currentModuleId);
  if (current && current.unlocked && !current.moduleCompleted) return current;
  return findFocusModule(modules);
}

function buildActiveModuleSteps(row: CourseProgressModuleRow): DashboardActiveModuleStep[] {
  const { requirements: req, progress: p } = row;
  const steps: DashboardActiveModuleStep[] = [];
  let foundCurrent = false;

  const push = (
    kind: DashboardActiveModuleStep["kind"],
    label: string,
    required: boolean,
    done: boolean,
  ) => {
    if (!required) return;
    let state: DashboardActiveModuleStep["state"];
    if (done) {
      state = "done";
    } else if (!foundCurrent) {
      state = "current";
      foundCurrent = true;
    } else {
      state = "locked";
    }
    steps.push({ kind, label, state });
  };

  push("lesson", "Лекция", req.lessonRequired, Boolean(p?.lessonCompleted));
  push("test", "Тест", req.testRequired, Boolean(p?.testCompleted));
  push("practice", "Практика", req.practiceRequired, Boolean(p?.practiceCompleted));

  return steps;
}

/** Снимок активного модуля для learning cockpit (без скрытых данных оценки). */
export function getActiveModuleSnapshot(
  stats: ProfileCourseStats,
  modules: CourseProgressModuleRow[],
): DashboardActiveModuleSnapshot | null {
  const row = resolveActiveModuleRow(stats, modules);
  if (!row) return null;

  const action = getModuleAction(row);

  return {
    moduleId: row.module.id,
    orderNumber: row.module.orderNumber,
    title: row.module.title,
    progressPercent: row.progressPercent,
    moduleHref: `/dashboard/course/${row.module.id}`,
    continueHref: action.disabled ? `/dashboard/course/${row.module.id}` : action.href,
    continueLabel: action.label,
    skillLine: getModuleSkillLine(row),
    steps: buildActiveModuleSteps(row),
  };
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

/** Сводный статус курса для шапки кабинета (этап 4). */
export type DashboardWelcomeCourseStatus =
  | "started"
  | "in_progress"
  | "almost_done"
  | "certificate_ready";

export const DASHBOARD_WELCOME_STATUS_LABEL: Record<DashboardWelcomeCourseStatus, string> = {
  started: "Курс начат",
  in_progress: "В процессе",
  almost_done: "Почти завершён",
  certificate_ready: "Сертификат готов",
};

export const DASHBOARD_WELCOME_TAGLINE =
  "Продолжайте обучение и закрепляйте навыки на практических заданиях." as const;

const WELCOME_GENERIC_NAME = /^(студент|student|user|гость)$/i;

/** «Добро пожаловать, {name}» или fallback на бренд. */
export function buildDashboardWelcomeGreeting(displayName: string): string {
  const name = displayName.trim();
  if (name.length > 0 && !WELCOME_GENERIC_NAME.test(name)) {
    return `Добро пожаловать, ${name}`;
  }
  return "Добро пожаловать в CyberEdu";
}

export function getDashboardWelcomeCourseStatus(
  stats: ProfileCourseStats,
): DashboardWelcomeCourseStatus {
  if (
    stats.certificateIssued ||
    (stats.allModulesComplete && stats.canGenerateCertificate)
  ) {
    return "certificate_ready";
  }
  if (
    stats.allModulesComplete ||
    stats.progressPercent >= 75 ||
    (stats.completedModules > 0 && stats.modulesUntilCertificate <= 1)
  ) {
    return "almost_done";
  }
  const hasProgress =
    stats.completedModules > 0 ||
    stats.progressPercent > 0 ||
    stats.lastActivitySummary != null;
  if (!hasProgress) {
    return "started";
  }
  return "in_progress";
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

/** Карточка ближайшего контрольного теста. */
export function getNextTestCard(modules: CourseProgressModuleRow[]): DashboardNextStepCard | null {
  if (modules.length === 0) return null;

  const upcoming = firstUpcomingByKind(modules, "test");
  if (upcoming) {
    return {
      kind: "test",
      title: "Контрольный тест",
      moduleTitle: upcoming.moduleTitle,
      href: upcoming.href,
      statusLabel: "Следующий шаг",
    };
  }

  const focus = findFocusModule(modules);
  if (!focus) {
    return {
      kind: "test",
      title: "Тест недоступен",
      moduleTitle: "Завершите предыдущий модуль в цепочке",
      href: "/dashboard/course",
      statusLabel: "Карта курса",
      empty: true,
    };
  }

  const base = `/dashboard/course/${focus.module.id}`;
  const { requirements: req, progress: p } = focus;

  if (!req.testRequired) {
    return {
      kind: "test",
      title: "Без теста в модуле",
      moduleTitle: focus.module.title,
      href: base,
      statusLabel: "Перейти к модулю",
      empty: true,
    };
  }

  if (p?.testCompleted) {
    return {
      kind: "test",
      title: "Тест зачтён",
      moduleTitle: focus.module.title,
      href: `${base}/test`,
      statusLabel: "Повторить тест",
    };
  }

  if (req.lessonRequired && !p?.lessonCompleted) {
    return {
      kind: "test",
      title: "Сначала лекция",
      moduleTitle: focus.module.title,
      href: `${base}/lesson`,
      statusLabel: "Перед тестом",
      empty: true,
    };
  }

  return {
    kind: "test",
    title: "Контрольный тест",
    moduleTitle: focus.module.title,
    href: `${base}/test`,
    statusLabel: "Готов к прохождению",
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

  const mod = findModuleRowByTitle(modules, stats.lastTest.moduleTitle);
  const href = dashboardHrefForModuleRow(mod, "test");
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
  const mentorHref = getMentorHref();

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
    const mod = findModuleRowByTitle(modules, stats.lastTest.moduleTitle);
    items.push({
      id: "weak-test",
      title: stats.lastTest.testTitle,
      reason: `Тест не зачтён — ${stats.lastTest.percent}% в модуле «${stats.lastTest.moduleTitle}»`,
      href: dashboardHrefForModuleRow(mod, "test"),
      tone: "warning",
    });
  }

  if (stats.lastPractice) {
    const { status, statusLabel, taskTitle, moduleTitle } = stats.lastPractice;
    const mod = findModuleRowByTitle(modules, moduleTitle);
    if (status === "NEEDS_REVISION") {
      items.push({
        id: "weak-revision",
        title: taskTitle,
        reason: `Работа на доработке · ${moduleTitle}`,
        href: mod?.unlocked ? dashboardHrefForModuleRow(mod, "practice") : "/dashboard/my-assignments",
        tone: "warning",
      });
    } else if (status === "REJECTED") {
      items.push({
        id: "weak-rejected",
        title: taskTitle,
        reason: `Отправка отклонена · ${moduleTitle}`,
        href: mod?.unlocked ? dashboardHrefForModuleRow(mod, "practice") : "/dashboard/my-assignments",
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
      href: dashboardHrefByModuleId(modules, stats.currentModuleId),
      tone: "info",
    });
  }

  return items.slice(0, 4);
}

export function getMentorHref(): string {
  return DASHBOARD_MENTOR_PAGE_PATH;
}

export function getQuickActionHrefs(modules: CourseProgressModuleRow[], stats: ProfileCourseStats) {
  const focus = findFocusModule(modules);
  const base = focus ? `/dashboard/course/${focus.module.id}` : stats.currentModuleId ? `/dashboard/course/${stats.currentModuleId}` : null;
  const practiceTask = firstUpcomingByKind(modules, "practice");

  return {
    course: "/dashboard/course",
    practice: practiceTask?.href ?? (base ? `${base}/practice` : "/dashboard/course"),
    mentor: getMentorHref(),
    profile: "/dashboard/profile",
  };
}

export function countPendingTasks(modules: CourseProgressModuleRow[]): number {
  return buildUpcomingTasks(modules).length;
}

/** Практики на проверке или в очереди проверки (без текста работ и рубрик). */
export function getPendingPracticeReviews(
  stats: ProfileCourseStats,
  modules: CourseProgressModuleRow[] = [],
): DashboardPendingPracticeItem[] {
  const seen = new Set<string>();
  const items: DashboardPendingPracticeItem[] = [];

  for (const s of stats.recentSubmissions) {
    if (s.outcome !== "pending") continue;
    const key = `${s.moduleId}:${s.taskTitle}`;
    if (seen.has(key)) continue;
    seen.add(key);
    items.push({
      id: key,
      taskTitle: s.taskTitle,
      moduleTitle: s.moduleTitle,
      moduleId: s.moduleId,
      statusLabel: s.statusLabel,
      href: dashboardHrefByModuleId(modules, s.moduleId, "practice"),
      at: s.at,
    });
  }

  return items.slice(0, 5);
}

export { getUiStatus };
