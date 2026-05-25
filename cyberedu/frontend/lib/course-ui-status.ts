import type { SubmissionStatus } from "@prisma/client";
import type { BadgeProps } from "@/components/ui/badge";
import type { CourseEntityUiStatus, CourseRoadmapFocusStatus } from "@/types/course-ui-status";
import type { CourseProgressModuleRow } from "@/lib/progress";
export type { CourseEntityUiStatus, CourseRoadmapFocusStatus } from "@/types/course-ui-status";

/** Стандартная причина блокировки модуля (без служебных полей). */
export const COURSE_LOCKED_MODULE_REASON = "Завершите предыдущий модуль, чтобы открыть этот.";

export type CourseStatusCta = {
  label: string;
  href: string | null;
  disabled: boolean;
};

export type CourseStatusPresentation = {
  status: CourseEntityUiStatus;
  label: string;
  showProgress: boolean;
  showCheckIcon: boolean;
  showLockIcon: boolean;
  showClockIcon: boolean;
  badgeVariant: NonNullable<BadgeProps["variant"]>;
  badgeClassName?: string;
  shellClass: string;
  nodeClass: string;
  railClass: string;
  lockReason: string | null;
  primaryCta: CourseStatusCta;
};

export const COURSE_STATUS_PRESENTATION: Record<
  CourseEntityUiStatus,
  Omit<CourseStatusPresentation, "status" | "lockReason" | "primaryCta">
> = {
  completed: {
    label: "Завершено",
    showProgress: false,
    showCheckIcon: true,
    showLockIcon: false,
    showClockIcon: false,
    badgeVariant: "success",
    badgeClassName: "border-success/40 bg-success/10 text-success",
    shellClass:
      "border-success/30 bg-success/[0.06] shadow-[0_0_28px_-10px_hsl(var(--success)/0.25)] hover:border-success/45",
    nodeClass:
      "border-success/50 bg-success/15 text-success shadow-[0_0_20px_color-mix(in_oklab,var(--success)_28%,transparent)]",
    railClass: "bg-success/50",
  },
  in_progress: {
    label: "В процессе",
    showProgress: true,
    showCheckIcon: false,
    showLockIcon: false,
    showClockIcon: false,
    badgeVariant: "primary",
    badgeClassName: "border-primary/40 bg-primary/15 text-primary",
    shellClass:
      "border-primary/35 bg-primary/[0.08] shadow-[0_0_32px_-12px_hsl(var(--primary)/0.28)] hover:border-primary/50",
    nodeClass:
      "border-primary bg-primary/20 text-primary shadow-[0_0_24px_color-mix(in_oklab,var(--primary)_38%,transparent)]",
    railClass: "bg-primary/35",
  },
  available: {
    label: "Доступно",
    showProgress: false,
    showCheckIcon: false,
    showLockIcon: false,
    showClockIcon: false,
    badgeVariant: "outline",
    badgeClassName: "border-cyan/30 bg-cyan/5 text-foreground",
    shellClass: "border-border/80 bg-card/90 hover:border-cyan/30 hover:shadow-[var(--shadow-card-hover)]",
    nodeClass: "border-primary/35 bg-primary/8 text-primary",
    railClass: "bg-primary/35",
  },
  locked: {
    label: "Заблокировано",
    showProgress: false,
    showCheckIcon: false,
    showLockIcon: true,
    showClockIcon: false,
    badgeVariant: "outline",
    badgeClassName: "border-muted-foreground/40 text-muted-foreground",
    shellClass: "border-border/60 bg-muted/20 opacity-90 saturate-[0.88]",
    nodeClass: "border-muted-foreground/30 bg-muted/35 text-muted-foreground",
    railClass: "bg-border/70",
  },
  pending_review: {
    label: "Ожидает проверки",
    showProgress: true,
    showCheckIcon: false,
    showLockIcon: false,
    showClockIcon: true,
    badgeVariant: "cyan",
    badgeClassName: "border-warning/35 bg-warning/10 text-warning",
    shellClass: "border-warning/30 bg-warning/[0.06] shadow-[0_0_28px_-10px_hsl(var(--warning)/0.2)]",
    nodeClass: "border-warning/45 bg-warning/12 text-warning",
    railClass: "bg-warning/40",
  },
  needs_retry: {
    label: "Нужно повторить",
    showProgress: false,
    showCheckIcon: false,
    showLockIcon: false,
    showClockIcon: false,
    badgeVariant: "danger",
    badgeClassName: "border-danger/35 bg-danger/10 text-danger",
    shellClass: "border-danger/30 bg-danger/[0.06] shadow-[0_0_28px_-10px_hsl(var(--danger)/0.22)]",
    nodeClass: "border-danger/45 bg-danger/12 text-danger",
    railClass: "bg-danger/35",
  },
};

/** Безопасный маппер Prisma SubmissionStatus → UI (без новых enum в БД). */
export function mapSubmissionStatusToCourseUi(
  status: SubmissionStatus | "OTHER" | null | undefined,
): CourseEntityUiStatus | null {
  if (!status || status === "DRAFT" || status === "ACCEPTED") return null;
  if (status === "SUBMITTED" || status === "CHECKING") return "pending_review";
  if (status === "NEEDS_REVISION" || status === "REJECTED") return "needs_retry";
  return "needs_retry";
}

function lessonPrepDone(row: CourseProgressModuleRow): boolean {
  const { requirements: req, progress: p } = row;
  return (
    (!req.lessonRequired || Boolean(p?.lessonCompleted)) &&
    (!req.videoRequired || Boolean(p?.videoCompleted))
  );
}

function moduleStarted(row: CourseProgressModuleRow): boolean {
  const p = row.progress;
  return Boolean(
    p?.lessonCompleted ||
      p?.videoCompleted ||
      p?.testCompleted ||
      p?.practiceCompleted ||
      row.progressPercent > 0,
  );
}

export function moduleHasTestRetry(row: CourseProgressModuleRow): boolean {
  if (row.testNeedsRetry) return true;
  const p = row.progress;
  if (!p || p.testCompleted || !row.requirements.testRequired) return false;
  return lessonPrepDone(row) && row.score > 0;
}

export function moduleHasPracticeReview(row: CourseProgressModuleRow): boolean {
  return Boolean(
    row.practicePendingReview &&
      row.requirements.practiceRequired &&
      !row.progress?.practiceCompleted,
  );
}

export function moduleHasPracticeRetry(row: CourseProgressModuleRow): boolean {
  return Boolean(
    row.practiceNeedsRevision &&
      row.requirements.practiceRequired &&
      !row.progress?.practiceCompleted,
  );
}

/** Статус модуля для карточек и сводок (без «current»). */
export function getModuleEntityStatus(row: CourseProgressModuleRow): CourseEntityUiStatus {
  if (!row.unlocked) return "locked";
  if (row.moduleCompleted) return "completed";
  if (moduleHasPracticeReview(row)) return "pending_review";
  if (moduleHasPracticeRetry(row) || moduleHasTestRetry(row)) return "needs_retry";
  if (moduleStarted(row)) return "in_progress";
  return "available";
}

/** Статус на карте курса с выделением текущего модуля. */
export function getRoadmapEntityStatus(
  row: CourseProgressModuleRow,
  focusModuleId?: string | null,
): CourseRoadmapFocusStatus {
  if (!row.unlocked) return "locked";
  if (row.moduleCompleted) return "completed";
  if (focusModuleId && row.module.id === focusModuleId) return "current";
  return getModuleEntityStatus(row);
}

export function getRoadmapDisplayEntityStatus(
  row: CourseProgressModuleRow,
  focusModuleId?: string | null,
): CourseEntityUiStatus {
  const raw = getRoadmapEntityStatus(row, focusModuleId);
  if (raw === "current") return "in_progress";
  return raw;
}

export function isRoadmapFocusModule(row: CourseProgressModuleRow, focusModuleId?: string | null): boolean {
  return Boolean(focusModuleId && row.module.id === focusModuleId && row.unlocked && !row.moduleCompleted);
}

export function getLockedUnlockHint(row: CourseProgressModuleRow, modules: CourseProgressModuleRow[]): string {
  const idx = modules.findIndex((m) => m.module.id === row.module.id);
  if (idx <= 0) return COURSE_LOCKED_MODULE_REASON;
  const prev = modules[idx - 1];
  if (prev && !prev.moduleCompleted) {
    return `Завершите модуль ${prev.module.orderNumber}, чтобы открыть этот.`;
  }
  return COURSE_LOCKED_MODULE_REASON;
}

export type CourseInnerStepKind = "lesson" | "test" | "practice";

function stepBlockedHint(kind: CourseInnerStepKind, row: CourseProgressModuleRow): string | undefined {
  const req = row.requirements;
  if (kind === "test" && !lessonPrepDone(row)) return "Сначала завершите урок";
  if (kind === "practice") {
    if (!lessonPrepDone(row)) return "Сначала завершите урок";
    if (req.testRequired && !row.progress?.testCompleted) return "Сначала сдайте тест";
  }
  return undefined;
}

/** Статус шага внутри модуля (урок / тест / практика). */
export function getInnerStepEntityStatus(
  row: CourseProgressModuleRow,
  kind: CourseInnerStepKind,
): CourseEntityUiStatus {
  if (!row.unlocked) return "locked";

  const req = row.requirements;
  const p = row.progress;
  const base = `/dashboard/course/${row.module.id}`;

  if (kind === "lesson") {
    if (!req.lessonRequired && !req.videoRequired) return "completed";
    const done =
      (!req.lessonRequired || Boolean(p?.lessonCompleted)) &&
      (!req.videoRequired || Boolean(p?.videoCompleted));
    if (done) return "completed";
    const started = Boolean(p?.lessonCompleted || p?.videoCompleted);
    return started ? "in_progress" : "available";
  }

  if (kind === "test") {
    if (!req.testRequired) return "completed";
    if (!lessonPrepDone(row)) return "locked";
    if (p?.testCompleted) return "completed";
    if (moduleHasTestRetry(row)) return "needs_retry";
    return moduleStarted(row) && (p?.lessonCompleted || p?.videoCompleted) ? "in_progress" : "available";
  }

  if (kind === "practice") {
    if (!req.practiceRequired) return "completed";
    if (!lessonPrepDone(row) || (req.testRequired && !p?.testCompleted)) return "locked";
    if (p?.practiceCompleted) return "completed";
    if (moduleHasPracticeReview(row)) return "pending_review";
    if (moduleHasPracticeRetry(row)) return "needs_retry";
    if (p?.testCompleted && !p?.practiceCompleted) return "in_progress";
    return "available";
  }

  void base;
  return "available";
}

export function innerStepHref(
  row: CourseProgressModuleRow,
  kind: CourseInnerStepKind,
  status: CourseEntityUiStatus,
): string | null {
  if (status === "locked") return null;
  const base = `/dashboard/course/${row.module.id}`;
  if (kind === "lesson") return `${base}/lesson`;
  if (kind === "test") return `${base}/test`;
  return `${base}/practice`;
}

export type CourseStatusEntity = "module" | "step";

function buildPrimaryCta(
  status: CourseEntityUiStatus,
  entity: CourseStatusEntity,
  moduleId: string,
  stepKind?: CourseInnerStepKind,
): CourseStatusCta {
  const base = `/dashboard/course/${moduleId}`;

  switch (status) {
    case "locked":
      return { label: "Заблокировано", href: null, disabled: true };
    case "completed":
      if (entity === "module") {
        return { label: "Открыть", href: base, disabled: false };
      }
      if (stepKind === "lesson") return { label: "Повторить", href: `${base}/lesson`, disabled: false };
      if (stepKind === "test") return { label: "Повторить", href: `${base}/test`, disabled: false };
      if (stepKind === "practice") return { label: "Открыть", href: `${base}/practice`, disabled: false };
      return { label: "Повторить", href: base, disabled: false };
    case "available":
      if (stepKind === "test") return { label: "Начать", href: `${base}/test`, disabled: false };
      if (stepKind === "practice") return { label: "Начать", href: `${base}/practice`, disabled: false };
      return { label: "Начать", href: `${base}/lesson`, disabled: false };
    case "in_progress":
      if (stepKind === "test") return { label: "Продолжить", href: `${base}/test`, disabled: false };
      if (stepKind === "practice") return { label: "Продолжить", href: `${base}/practice`, disabled: false };
      if (stepKind === "lesson") return { label: "Продолжить", href: `${base}/lesson`, disabled: false };
      return { label: "Продолжить", href: base, disabled: false };
    case "pending_review":
      return {
        label: "Посмотреть отправку",
        href: stepKind === "practice" || entity === "module" ? `${base}/practice` : null,
        disabled: false,
      };
    case "needs_retry":
      if (stepKind === "test") return { label: "Повторить", href: `${base}/test`, disabled: false };
      if (stepKind === "practice" || entity === "module") {
        return { label: "Повторить", href: `${base}/practice`, disabled: false };
      }
      return { label: "Повторить", href: base, disabled: false };
    default:
      return { label: "Продолжить", href: base, disabled: false };
  }
}

/** CTA «Продолжить» для активного модуля по цепочке шагов. */
export function getModuleContinueCta(row: CourseProgressModuleRow): CourseStatusCta {
  const status = getModuleEntityStatus(row);
  if (status === "locked") {
    return { label: "Заблокировано", href: null, disabled: true };
  }
  if (status === "completed") {
    return { label: "Открыть", href: `/dashboard/course/${row.module.id}`, disabled: false };
  }
  if (status === "pending_review") {
    return {
      label: "Посмотреть отправку",
      href: `/dashboard/course/${row.module.id}/practice`,
      disabled: false,
    };
  }
  if (status === "needs_retry") {
    if (moduleHasTestRetry(row) && !row.progress?.testCompleted) {
      return {
        label: "Повторить",
        href: `/dashboard/course/${row.module.id}/test`,
        disabled: false,
      };
    }
    return {
      label: "Повторить",
      href: `/dashboard/course/${row.module.id}/practice`,
      disabled: false,
    };
  }

  const req = row.requirements;
  const p = row.progress;
  const base = `/dashboard/course/${row.module.id}`;
  const started = moduleStarted(row);

  if (!lessonPrepDone(row)) {
    return { label: started ? "Продолжить" : "Начать", href: `${base}/lesson`, disabled: false };
  }
  if (req.testRequired && !p?.testCompleted) {
    return { label: moduleHasTestRetry(row) ? "Повторить" : "Продолжить", href: `${base}/test`, disabled: false };
  }
  if (req.practiceRequired && !p?.practiceCompleted) {
    return { label: "Продолжить", href: `${base}/practice`, disabled: false };
  }
  return { label: "Продолжить", href: base, disabled: false };
}

export function buildStatusPresentation(
  status: CourseEntityUiStatus,
  options: {
    entity: CourseStatusEntity;
    moduleId: string;
    stepKind?: CourseInnerStepKind;
    lockReason?: string | null;
    row?: CourseProgressModuleRow;
  },
): CourseStatusPresentation {
  const preset = COURSE_STATUS_PRESENTATION[status];
  let primaryCta = buildPrimaryCta(status, options.entity, options.moduleId, options.stepKind);

  if (options.entity === "module" && options.row && (status === "in_progress" || status === "available")) {
    primaryCta = getModuleContinueCta(options.row);
  }

  return {
    status,
    ...preset,
    lockReason: status === "locked" ? (options.lockReason ?? COURSE_LOCKED_MODULE_REASON) : null,
    primaryCta,
  };
}

export function getModuleStatusPresentation(
  row: CourseProgressModuleRow,
  modules: CourseProgressModuleRow[],
): CourseStatusPresentation {
  const status = getModuleEntityStatus(row);
  return buildStatusPresentation(status, {
    entity: "module",
    moduleId: row.module.id,
    row,
    lockReason: status === "locked" ? getLockedUnlockHint(row, modules) : null,
  });
}

export function getInnerStepPresentation(
  row: CourseProgressModuleRow,
  kind: CourseInnerStepKind,
): CourseStatusPresentation {
  const status = getInnerStepEntityStatus(row, kind);
  return buildStatusPresentation(status, {
    entity: "step",
    moduleId: row.module.id,
    stepKind: kind,
    lockReason: status === "locked" ? stepBlockedHint(kind, row) ?? COURSE_LOCKED_MODULE_REASON : null,
  });
}

/** Конфиг бейджа (совместимость с course-path-ui). */
export function getStatusBadgeConfig(status: CourseEntityUiStatus | "current"): {
  label: string;
  variant: NonNullable<BadgeProps["variant"]>;
  className?: string;
} {
  if (status === "current") {
    return { label: "Текущий", variant: "primary", className: "border-primary/40 bg-primary/15" };
  }
  const p = COURSE_STATUS_PRESENTATION[status];
  return { label: p.label, variant: p.badgeVariant, className: p.badgeClassName };
}

export function getCourseStatusNodeClass(status: CourseEntityUiStatus, isFocus = false): string {
  if (isFocus) return COURSE_STATUS_PRESENTATION.in_progress.nodeClass;
  return COURSE_STATUS_PRESENTATION[status].nodeClass;
}

export function getCourseStatusRailClass(status: CourseEntityUiStatus): string {
  return COURSE_STATUS_PRESENTATION[status].railClass;
}

export function moduleStatusShellClass(status: CourseEntityUiStatus, isCurrent = false): string {
  const base =
    "border bg-card/90 backdrop-blur-sm transition-[border-color,box-shadow,transform] duration-200";
  if (isCurrent) {
    return `${base} ${COURSE_STATUS_PRESENTATION.in_progress.shellClass} ring-2 ring-primary/35`;
  }
  return `${base} ${COURSE_STATUS_PRESENTATION[status].shellClass}`;
}

export type RoadmapInnerStep = {
  kind: CourseInnerStepKind;
  label: string;
  status: CourseEntityUiStatus;
  href: string | null;
  blockedHint?: string;
};

export function buildRoadmapInnerSteps(row: CourseProgressModuleRow): RoadmapInnerStep[] {
  const req = row.requirements;
  const steps: RoadmapInnerStep[] = [];

  if (req.lessonRequired || req.videoRequired) {
    const status = getInnerStepEntityStatus(row, "lesson");
    steps.push({
      kind: "lesson",
      label: req.videoRequired && req.lessonRequired ? "Урок и видео" : req.videoRequired ? "Видео" : "Урок",
      status,
      href: innerStepHref(row, "lesson", status),
      blockedHint: status === "locked" ? stepBlockedHint("lesson", row) : undefined,
    });
  }
  if (req.testRequired) {
    const status = getInnerStepEntityStatus(row, "test");
    steps.push({
      kind: "test",
      label: "Тест",
      status,
      href: innerStepHref(row, "test", status),
      blockedHint: status === "locked" ? stepBlockedHint("test", row) : undefined,
    });
  }
  if (req.practiceRequired) {
    const status = getInnerStepEntityStatus(row, "practice");
    steps.push({
      kind: "practice",
      label: "Практика",
      status,
      href: innerStepHref(row, "practice", status),
      blockedHint: status === "locked" ? stepBlockedHint("practice", row) : undefined,
    });
  }

  const firstActionable = steps.findIndex((s) => s.status === "available");
  if (firstActionable >= 0) {
    const s = steps[firstActionable]!;
    steps[firstActionable] = { ...s, status: "in_progress" };
  }

  return steps;
}
