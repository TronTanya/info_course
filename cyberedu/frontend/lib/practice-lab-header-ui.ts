import type { BreadcrumbItem } from "@/components/ui/breadcrumbs";
import { formatPracticeDuration } from "@/lib/practice-lab-ui";
import type { PracticeDifficulty, PracticeViewModel, PracticeViewStatus } from "@/types/practice-view-model";

export const PRACTICE_LAB_BADGE = "Практическая лаборатория";

export const PRACTICE_VIEW_STATUS_LABELS: Record<PracticeViewStatus, string> = {
  not_started: "Не начато",
  in_progress: "В процессе",
  submitted: "Отправлено",
  pending_review: "Ожидает проверки",
  approved: "Принято",
  needs_retry: "Нужно доработать",
  rejected: "Отклонено",
  locked: "Заблокировано",
};

export type PracticeLabHeaderStatusTone = "muted" | "primary" | "warning" | "success" | "danger";

export const practiceLabHeaderStatusTone: Record<PracticeViewStatus, PracticeLabHeaderStatusTone> = {
  not_started: "muted",
  in_progress: "primary",
  submitted: "warning",
  pending_review: "warning",
  approved: "success",
  needs_retry: "warning",
  rejected: "danger",
  locked: "muted",
};

const DIFFICULTY_LABELS: Record<PracticeDifficulty, string> = {
  easy: "Начальный",
  medium: "Средний",
  hard: "Продвинутый",
};

export type PracticeLabHeaderCtaKind = "course" | "continue" | "retry" | "next";

export type PracticeLabHeaderCta = {
  kind: PracticeLabHeaderCtaKind;
  label: string;
  href?: string;
  variant: "primary" | "outline";
  /** Для «Продолжить» / «Повторить» без смены маршрута */
  scrollToId?: string;
};

export function practiceDifficultyLabelRu(difficulty?: PracticeDifficulty): string | undefined {
  if (!difficulty) return undefined;
  return DIFFICULTY_LABELS[difficulty];
}

export function buildPracticeLabBreadcrumbs(input: {
  courseTitle: string;
  courseHref: string;
  moduleTitle: string;
  moduleHref: string;
}): BreadcrumbItem[] {
  return [
    { href: input.courseHref, label: input.courseTitle || "Курс" },
    { href: input.moduleHref, label: input.moduleTitle },
    { label: "Практика" },
  ];
}

/** Отправка недоступна при блокировке или ожидании проверки / зачёте. */
export function isPracticeSubmitDisabled(view: Pick<PracticeViewModel, "status" | "canSubmit">): boolean {
  if (view.status === "locked") return true;
  return !view.canSubmit;
}

export function resolvePracticeLabHeaderCtas(
  view: PracticeViewModel,
  opts: {
    courseHref: string;
    workspaceAnchorId?: string;
  },
): PracticeLabHeaderCta[] {
  const course: PracticeLabHeaderCta = {
    kind: "course",
    label: "Вернуться к курсу",
    href: opts.courseHref,
    variant: "outline",
  };

  if (view.status === "locked") {
    return [{ ...course, variant: "primary" }];
  }

  const ctas: PracticeLabHeaderCta[] = [course];

  if (view.status === "approved" && view.nextStep) {
    ctas.unshift({
      kind: "next",
      label: "Следующий шаг",
      href: view.nextStep.href,
      variant: "primary",
    });
    return ctas;
  }

  if ((view.status === "needs_retry" || view.status === "rejected") && view.canRetry) {
    ctas.unshift({
      kind: "retry",
      label: "Повторить",
      variant: "primary",
      scrollToId: opts.workspaceAnchorId,
    });
    return ctas;
  }

  if (view.status === "not_started" || view.status === "in_progress") {
    ctas.unshift({
      kind: "continue",
      label: "Продолжить",
      variant: "primary",
      scrollToId: opts.workspaceAnchorId,
    });
  }

  return ctas;
}

export function formatPracticeHeaderDuration(minutes?: number): string | undefined {
  if (minutes == null || minutes <= 0) return undefined;
  return formatPracticeDuration(minutes);
}

export function practiceHeaderScoreLine(
  submission: PracticeViewModel["submission"],
  maxScore?: number,
): string | undefined {
  const max = submission?.maxScore ?? maxScore;
  if (max == null || max <= 0) return undefined;
  const score = submission?.score;
  if (score == null) return `до ${max} баллов`;
  return `${score} / ${max} баллов`;
}

export function practiceHeaderMetaChips(view: PracticeViewModel): string[] {
  const chips: string[] = [];
  const diff = practiceDifficultyLabelRu(view.difficulty);
  if (diff) chips.push(diff);
  const dur = formatPracticeHeaderDuration(view.estimatedMinutes);
  if (dur) chips.push(dur);
  if (view.skill?.trim()) chips.push(view.skill.trim());
  return chips;
}
