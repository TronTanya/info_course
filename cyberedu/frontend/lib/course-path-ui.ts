import type { ComponentProps } from "react";
import type { CourseProgressModuleRow, ModuleRequirements } from "@/lib/progress";
import type { Badge } from "@/components/ui/badge";

export type UiStatus = "locked" | "available" | "in_progress" | "completed";

/** Статус узла на карте курса (включая текущий фокус). */
export type RoadmapStatus = UiStatus | "current";

export function getRoadmapStatus(
  row: CourseProgressModuleRow,
  focusModuleId?: string | null,
): RoadmapStatus {
  if (!row.unlocked) return "locked";
  if (row.moduleCompleted) return "completed";
  if (focusModuleId && row.module.id === focusModuleId) return "current";
  return getUiStatus(row);
}

export function getUiStatus(row: CourseProgressModuleRow): UiStatus {
  if (!row.unlocked) return "locked";
  if (row.moduleCompleted) return "completed";
  const p = row.progress;
  const started =
    Boolean(p?.lessonCompleted) ||
    Boolean(p?.videoCompleted) ||
    Boolean(p?.testCompleted) ||
    Boolean(p?.practiceCompleted) ||
    row.progressPercent > 0;
  return started ? "in_progress" : "available";
}

export const statusBadge: Record<
  UiStatus,
  { label: string; variant: NonNullable<ComponentProps<typeof Badge>["variant"]>; className?: string }
> = {
  locked: { label: "Закрыт", variant: "outline", className: "border-muted-foreground/40 text-muted-foreground" },
  available: { label: "Не начат", variant: "outline", className: "border-border text-muted-foreground" },
  in_progress: { label: "В процессе", variant: "primary" },
  completed: { label: "Завершён", variant: "success" },
};

export const roadmapStatusBadge: Record<
  RoadmapStatus,
  { label: string; variant: NonNullable<ComponentProps<typeof Badge>["variant"]>; className?: string }
> = {
  ...statusBadge,
  current: { label: "Текущий", variant: "primary", className: "border-primary/40 bg-primary/15" },
};

export function getModuleAction(row: CourseProgressModuleRow): { href: string; label: string; disabled: boolean } {
  const id = row.module.id;
  const base = `/dashboard/course/${id}`;
  if (!row.unlocked) {
    return { href: "#", label: "Завершите предыдущий модуль", disabled: true };
  }

  const p = row.progress;
  const req = row.requirements;

  if (row.moduleCompleted) {
    return { href: base, label: "Повторить", disabled: false };
  }

  const lessonDone = !req.lessonRequired || Boolean(p?.lessonCompleted);
  const videoDone = !req.videoRequired || Boolean(p?.videoCompleted);
  const testDone = !req.testRequired || Boolean(p?.testCompleted);
  const practiceDone = !req.practiceRequired || Boolean(p?.practiceCompleted);

  const started = Boolean(p?.lessonCompleted || p?.videoCompleted || p?.testCompleted || p?.practiceCompleted);

  if (!lessonDone) {
    return { href: `${base}/lesson`, label: started ? "Продолжить" : "Начать", disabled: false };
  }
  if (!videoDone) {
    return { href: `${base}/lesson`, label: "Продолжить", disabled: false };
  }
  if (!testDone) {
    return { href: `${base}/test`, label: "Продолжить", disabled: false };
  }
  if (!practiceDone) {
    return { href: `${base}/practice`, label: "Продолжить", disabled: false };
  }

  return { href: base, label: "Продолжить", disabled: false };
}

/** Уровень сложности по порядку модуля в треке (1–10). */
export function moduleDifficultyByOrder(orderNumber: number): string {
  if (orderNumber <= 2) return "Начальный";
  if (orderNumber <= 5) return "Средний";
  if (orderNumber <= 8) return "Продвинутый";
  return "Экспертный";
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

/** Подсказка, что нужно для разблокировки (без раскрытия контента модуля). */
export function getLockedUnlockHint(row: CourseProgressModuleRow, modules: CourseProgressModuleRow[]): string {
  const prev = getPreviousModuleRow(modules, row.module.id);
  if (!prev) {
    return "Завершите предыдущий модуль в треке, чтобы открыть этот блок.";
  }
  if (!prev.moduleCompleted) {
    return `Сначала завершите модуль ${prev.module.orderNumber}: «${prev.module.title}».`;
  }
  return "Завершите предыдущий модуль в треке, чтобы открыть этот блок.";
}

/** Следующий модуль в треке (по orderNumber). */
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

/** Превью «что после модуля» на основе данных прогресса (без новых API). */
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

export function buildModuleTrackSteps(row: CourseProgressModuleRow): { key: string; label: string; done: boolean }[] {
  const { requirements: req, progress: p } = row;
  const locked = !row.unlocked;
  if (locked) return [];

  const steps: { key: string; label: string; done: boolean }[] = [];

  if (req.lessonRequired || req.videoRequired) {
    const lessonOk = !req.lessonRequired || Boolean(p?.lessonCompleted);
    const videoOk = !req.videoRequired || Boolean(p?.videoCompleted);
    const label =
      req.videoRequired && req.lessonRequired ? "Лекция и видео" : req.videoRequired ? "Видео к лекции" : "Лекция";
    steps.push({ key: "prep", label, done: lessonOk && videoOk });
  }
  if (req.testRequired) {
    steps.push({ key: "test", label: "Тест", done: Boolean(p?.testCompleted) });
  }
  if (req.practiceRequired) {
    steps.push({ key: "practice", label: "Практика", done: Boolean(p?.practiceCompleted) });
  }

  return steps;
}
