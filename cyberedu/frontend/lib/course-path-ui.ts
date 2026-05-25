import type { CourseProgressModuleRow, ModuleRequirements } from "@/lib/progress";
import {
  buildRoadmapInnerSteps,
  COURSE_LOCKED_MODULE_REASON,
  getInnerStepEntityStatus,
  getLockedUnlockHint,
  getModuleContinueCta,
  getModuleEntityStatus,
  getRoadmapDisplayEntityStatus,
  getRoadmapEntityStatus,
  getStatusBadgeConfig,
  isRoadmapFocusModule,
  moduleStatusShellClass,
  type CourseEntityUiStatus,
  type CourseInnerStepKind,
  type CourseRoadmapFocusStatus,
} from "@/lib/course-ui-status";

export type { CourseEntityUiStatus as UiStatus, CourseRoadmapFocusStatus as RoadmapStatus } from "@/lib/course-ui-status";
export type { RoadmapInnerStep, CourseInnerStepKind as RoadmapInnerStepKind } from "@/lib/course-ui-status";
export { COURSE_LOCKED_MODULE_REASON, buildRoadmapInnerSteps, isRoadmapFocusModule, moduleStatusShellClass as moduleStatusAccent };

export const getUiStatus = getModuleEntityStatus;
export const getRoadmapStatus = getRoadmapEntityStatus;
export const getRoadmapDisplayStatus = getRoadmapDisplayEntityStatus;

export const statusBadge: Record<CourseEntityUiStatus, ReturnType<typeof getStatusBadgeConfig>> = {
  locked: getStatusBadgeConfig("locked"),
  available: getStatusBadgeConfig("available"),
  in_progress: getStatusBadgeConfig("in_progress"),
  completed: getStatusBadgeConfig("completed"),
  pending_review: getStatusBadgeConfig("pending_review"),
  needs_retry: getStatusBadgeConfig("needs_retry"),
};

export const roadmapStatusBadge: Record<CourseRoadmapFocusStatus, ReturnType<typeof getStatusBadgeConfig>> = {
  ...statusBadge,
  current: getStatusBadgeConfig("current"),
};

export function getModuleAction(row: CourseProgressModuleRow): { href: string; label: string; disabled: boolean } {
  const cta = getModuleContinueCta(row);
  return { href: cta.href ?? "#", label: cta.label, disabled: cta.disabled };
}

/** Уровень сложности по порядку модуля в треке (1–10). */
export function moduleDifficultyByOrder(orderNumber: number): string {
  if (orderNumber <= 2) return "Начальный";
  if (orderNumber <= 5) return "Средний";
  if (orderNumber <= 8) return "Продвинутый";
  return "Экспертный";
}

/** Краткая строка «навык» для карточки модуля (из описания или уровня сложности). */
export function getModuleSkillLine(row: CourseProgressModuleRow): string {
  const raw = row.module.description?.trim();
  if (raw) {
    const first = raw.split(/[.!?\n]/)[0]?.trim();
    if (first && first.length >= 12) {
      return first.length > 96 ? `${first.slice(0, 93)}…` : first;
    }
  }
  return `Уровень: ${moduleDifficultyByOrder(row.module.orderNumber)}`;
}

export type UserTrackLevel = {
  label: string;
  tier: number;
  hint: string;
};

/** Текущий уровень пользователя по завершённым модулям. */
export function getUserTrackLevel(completedModules: number, totalModules: number): UserTrackLevel {
  if (totalModules === 0) {
    return { label: "Стажёр", tier: 1, hint: "Начните первый модуль трека" };
  }
  if (completedModules === 0) {
    return { label: "Стажёр L1", tier: 1, hint: "Откройте модуль 1 и пройдите лекцию" };
  }
  const ratio = completedModules / totalModules;
  if (ratio >= 1) {
    return { label: "Эксперт", tier: 5, hint: "Трек пройден — оформите сертификат" };
  }
  if (ratio >= 0.7) {
    return { label: "Специалист L4", tier: 4, hint: "Финишная прямая — осталось несколько модулей" };
  }
  if (ratio >= 0.4) {
    return { label: "Аналитик L3", tier: 3, hint: "Середина трека — держите темп" };
  }
  return { label: "Стажёр L2", tier: 2, hint: "Продолжайте по порядку модулей" };
}

export function formatLessonCount(count: number): string {
  if (count === 0) return "без уроков";
  const n = count;
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return `${n} урок`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return `${n} урока`;
  return `${n} уроков`;
}

export function formatPracticeCount(count: number): string {
  if (count === 0) return "без практик";
  const n = count;
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return `${n} практика`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return `${n} практики`;
  return `${n} практик`;
}

export function formatTestCount(count: number): string {
  if (count === 0) return "без тестов";
  const n = count;
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return `${n} тест`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return `${n} теста`;
  return `${n} тестов`;
}

export type ModuleContentMeta = {
  lessons: number;
  tests: number;
  practices: number;
  lessonsLabel: string;
  testsLabel: string;
  practicesLabel: string;
};

export function getModuleContentMeta(row: CourseProgressModuleRow): ModuleContentMeta {
  const { lessons, tests, practices } = row.contentCounts;
  return {
    lessons,
    tests,
    practices,
    lessonsLabel: formatLessonCount(lessons),
    testsLabel: formatTestCount(tests),
    practicesLabel: formatPracticeCount(practices),
  };
}

export function getPreviousModuleRow(
  modules: CourseProgressModuleRow[],
  currentModuleId: string,
): CourseProgressModuleRow | null {
  const idx = modules.findIndex((m) => m.module.id === currentModuleId);
  if (idx <= 0) return null;
  return modules[idx - 1] ?? null;
}

export { getLockedUnlockHint };

export function getNextModuleRow(
  modules: CourseProgressModuleRow[],
  currentModuleId: string,
): CourseProgressModuleRow | null {
  const idx = modules.findIndex((m) => m.module.id === currentModuleId);
  if (idx < 0 || idx >= modules.length - 1) return null;
  return modules[idx + 1] ?? null;
}

export type AfterModulePreview =
  | { kind: "next_module"; row: CourseProgressModuleRow; opensWhenComplete: boolean }
  | { kind: "certificate"; href: string }
  | { kind: "none" };

export function getAfterModulePreview(
  modules: CourseProgressModuleRow[],
  currentModuleId: string,
  currentModuleCompleted: boolean,
): AfterModulePreview {
  const next = getNextModuleRow(modules, currentModuleId);
  if (next) {
    return {
      kind: "next_module",
      row: next,
      opensWhenComplete: !currentModuleCompleted,
    };
  }
  if (currentModuleCompleted) {
    return { kind: "certificate", href: "/dashboard/certificate" };
  }
  return { kind: "none" };
}

export function moduleTimeEstimate(req: ModuleRequirements): string {
  let lo = 0;
  let hi = 0;
  if (req.lessonRequired) {
    lo += 40;
    hi += 85;
  }
  if (req.videoRequired) {
    lo += 20;
    hi += 50;
  }
  if (req.testRequired) {
    lo += 25;
    hi += 55;
  }
  if (req.practiceRequired) {
    lo += 40;
    hi += 120;
  }
  if (lo === 0) return "—";
  const loH = Math.max(1, Math.round(lo / 60));
  const hiH = Math.max(loH, Math.round(hi / 60));
  return loH === hiH ? `≈ ${loH} ч` : `≈ ${loH}–${hiH} ч`;
}

export function moduleDifficultyLabel(req: ModuleRequirements): string {
  const n = req.totalSteps;
  if (n >= 4) return "Полный цикл";
  if (n === 3) return "Стандарт";
  if (n === 2) return "Компакт";
  return n <= 1 ? "Краткий модуль" : "Стандарт";
}

export type CourseTrackSummary = {
  totalModules: number;
  completedModules: number;
  lockedModules: number;
  inProgressModules: number;
  remainingToCertificate: number;
  allModulesComplete: boolean;
  focusModuleId: string | null;
  focusOrder: number | null;
  focusTitle: string | null;
  positionLabel: string;
  certificateHint: string;
};

export function getCourseTrackSummary(
  modules: CourseProgressModuleRow[],
  focusModuleId?: string | null,
): CourseTrackSummary {
  const totalModules = modules.length;
  const completedModules = modules.filter((m) => m.moduleCompleted).length;
  const lockedModules = modules.filter((m) => !m.unlocked).length;
  const inProgressModules = modules.filter(
    (m) => m.unlocked && !m.moduleCompleted && getModuleEntityStatus(m) === "in_progress",
  ).length;
  const remainingToCertificate = Math.max(0, totalModules - completedModules);
  const allModulesComplete = totalModules > 0 && completedModules === totalModules;

  const focus =
    (focusModuleId ? modules.find((m) => m.module.id === focusModuleId) : null) ??
    modules.find((m) => m.unlocked && !m.moduleCompleted) ??
    null;

  let positionLabel = "Курс без модулей";
  if (totalModules > 0) {
    if (allModulesComplete) {
      positionLabel = `Все ${totalModules} модулей завершены`;
    } else if (focus) {
      positionLabel = `Сейчас: модуль ${focus.module.orderNumber} из ${totalModules}`;
    } else {
      positionLabel = `Пройдено ${completedModules} из ${totalModules} модулей`;
    }
  }

  let certificateHint = "Завершите модули курса, чтобы открыть сертификат";
  if (allModulesComplete) {
    certificateHint = "Курс пройден — оформите сертификат в кабинете";
  } else if (remainingToCertificate === 1) {
    certificateHint = "Остался 1 модуль до сертификата";
  } else if (remainingToCertificate > 1) {
    certificateHint = `Осталось ${remainingToCertificate} модулей до сертификата`;
  }

  return {
    totalModules,
    completedModules,
    lockedModules,
    inProgressModules,
    remainingToCertificate,
    allModulesComplete,
    focusModuleId: focus?.module.id ?? null,
    focusOrder: focus?.module.orderNumber ?? null,
    focusTitle: focus?.module.title ?? null,
    positionLabel,
    certificateHint,
  };
}

export type NextRoadmapStep = {
  kind: CourseInnerStepKind;
  label: string;
  stepLabel: string;
  href: string;
  blockedHint?: string;
};

export function getNextRoadmapStep(row: CourseProgressModuleRow): NextRoadmapStep | null {
  if (!row.unlocked || row.moduleCompleted) return null;
  const steps = buildRoadmapInnerSteps(row);
  const priority: CourseEntityUiStatus[] = ["needs_retry", "pending_review", "in_progress", "available"];
  for (const want of priority) {
    const match = steps.find((s) => s.status === want && s.href);
    if (match?.href) {
      return {
        kind: match.kind,
        label: match.label,
        stepLabel: match.label,
        href: match.href,
        blockedHint: match.blockedHint,
      };
    }
  }
  const locked = steps.find((s) => s.status === "locked");
  if (locked) {
    return {
      kind: locked.kind,
      label: locked.label,
      stepLabel: locked.label,
      href: `/dashboard/course/${row.module.id}`,
      blockedHint: locked.blockedHint ?? COURSE_LOCKED_MODULE_REASON,
    };
  }
  return {
    kind: "lesson",
    label: "Модуль",
    stepLabel: "Обзор модуля",
    href: `/dashboard/course/${row.module.id}`,
  };
}

export function roadmapModuleAnchorId(moduleId: string): string {
  return `course-module-${moduleId}`;
}

export function buildModuleTrackSteps(row: CourseProgressModuleRow): { key: string; label: string; done: boolean }[] {
  const { requirements: req } = row;
  if (!row.unlocked) return [];

  const steps: { key: string; label: string; done: boolean }[] = [];

  if (req.lessonRequired || req.videoRequired) {
    steps.push({
      key: "prep",
      label: req.videoRequired && req.lessonRequired ? "Лекция и видео" : req.videoRequired ? "Видео" : "Лекция",
      done: getInnerStepEntityStatus(row, "lesson") === "completed",
    });
  }
  if (req.testRequired) {
    steps.push({ key: "test", label: "Тест", done: getInnerStepEntityStatus(row, "test") === "completed" });
  }
  if (req.practiceRequired) {
    steps.push({
      key: "practice",
      label: "Практика",
      done: getInnerStepEntityStatus(row, "practice") === "completed",
    });
  }

  return steps;
}

export {
  moduleHasPracticeReview,
  moduleHasPracticeRetry,
  moduleHasTestRetry,
  getInnerStepEntityStatus,
  getModuleEntityStatus,
} from "@/lib/course-ui-status";

export { getModuleStatusPresentation, getInnerStepPresentation, getStatusBadgeConfig } from "@/lib/course-ui-status";
