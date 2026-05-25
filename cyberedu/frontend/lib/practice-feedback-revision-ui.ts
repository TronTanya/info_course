import { practiceNextStepsPanelVisible } from "@/lib/practice-next-step-ui";
import { sanitizeStudentFeedback } from "@/lib/submission-status-panel";
import type { PracticeViewModel, PracticeViewStatus } from "@/types/practice-view-model";
import type { SubmissionStatus } from "@prisma/client";

export type PracticeFormAccess = {
  showStatusPanel: boolean;
  showForm: boolean;
  showImprovementBlock: boolean;
  showPreviousAnswer: boolean;
  showAttemptCount: boolean;
  showNextStepsPanel: boolean;
};

export function resolvePracticeCanSubmit(
  status: PracticeViewStatus,
  gateOk: boolean,
  canRetry: boolean,
): boolean {
  if (!gateOk) return false;
  if (status === "locked" || status === "approved") return false;
  if (status === "submitted" || status === "pending_review") return false;
  if (status === "needs_retry" || status === "rejected") return canRetry;
  return status === "not_started" || status === "in_progress";
}

export function resolvePracticeSubmissionCanEdit(
  status: PracticeViewStatus,
  canRetry: boolean,
): boolean {
  return canRetry && (status === "needs_retry" || status === "rejected");
}

export function resolvePracticeFormAccess(
  view: Pick<
    PracticeViewModel,
    "status" | "canSubmit" | "canRetry" | "submission" | "nextStepsPanel"
  >,
  attemptCount = 0,
): PracticeFormAccess {
  const terminal =
    view.status === "submitted" ||
    view.status === "pending_review" ||
    view.status === "approved" ||
    view.status === "needs_retry" ||
    view.status === "rejected" ||
    view.status === "locked";

  return {
    showStatusPanel: terminal && Boolean(view.submission),
    showForm: view.canSubmit,
    showImprovementBlock:
      view.status === "needs_retry" || view.status === "rejected",
    showPreviousAnswer: resolvePracticeSubmissionCanEdit(view.status, view.canRetry),
    showAttemptCount: attemptCount > 0 && view.status !== "not_started",
    showNextStepsPanel:
      practiceNextStepsPanelVisible(view.status) && Boolean(view.nextStepsPanel),
  };
}

export function practiceSubmissionBlockedMessage(
  status: PracticeViewStatus,
  canRetry: boolean,
): string {
  switch (status) {
    case "locked":
      return "Практика заблокирована. Сначала выполните предыдущие шаги модуля.";
    case "approved":
      return "Задание принято. Повторная отправка не требуется — перейдите к следующему шагу.";
    case "submitted":
    case "pending_review":
      return "Отправка ожидает проверки. Новая станет доступна после решения преподавателя.";
    case "needs_retry":
    case "rejected":
      return canRetry
        ? "Внесите правки в ответ ниже и отправьте обновлённую версию."
        : "Повторная отправка сейчас недоступна. Дождитесь решения преподавателя или откройте модуль позже.";
    default:
      return "Отправка сейчас недоступна.";
  }
}

/** Пункты «что улучшить» для студента (без рубрик и эталонов). */
export function buildPracticeImprovementItems(input: {
  status: PracticeViewStatus;
  feedback?: string | null;
}): string[] {
  const items: string[] = [];
  if (input.status !== "needs_retry" && input.status !== "rejected") return items;

  const safe = sanitizeStudentFeedback(input.feedback);
  if (safe) {
    items.push(`Учтите комментарий проверяющего: «${safe}».`);
  } else {
    items.push("Уточните выводы и обоснование — что проверяли и к какому результату пришли.");
  }

  items.push("Сверьте ответ с инструкцией задания и материалами лекции модуля.");
  items.push("Проверьте, что закрыты все видимые критерии в описании практики.");

  if (input.status === "rejected") {
    items.push("При необходимости уточните формулировки у преподавателя через комментарий к модулю.");
  }

  return items;
}

/** Превью прошлого ответа для доработки (без solution/answerKey). */
export function formatStudentPreviousAnswerPreview(
  textAnswer: string | null | undefined,
  maxLen = 1200,
): { preview: string; isStructured: boolean } | null {
  const raw = textAnswer?.trim();
  if (!raw) return null;

  if (/solution|answerKey|gradingRubric|autoKeywords/i.test(raw)) {
    return null;
  }

  if (raw.startsWith("{") || raw.startsWith("[")) {
    try {
      JSON.parse(raw);
      return {
        preview:
          "Сохранена предыдущая структурированная отправка. Заполните поля формы заново с учётом комментария проверяющего.",
        isStructured: true,
      };
    } catch {
      /* plain text */
    }
  }

  const clipped = raw.length > maxLen ? `${raw.slice(0, maxLen)}…` : raw;
  return { preview: clipped, isStructured: false };
}

export function practiceAttemptCountLabel(count: number): string {
  if (count <= 1) return "Первая отправка по этому заданию.";
  return `Отправок по заданию: ${count}. История попыток сохранена — новая отправка добавит ещё одну запись, старые не удаляются.`;
}

/** Согласование client-side canRetry с последним статусом Prisma. */
export function resolveClientCanRetry(
  submissionStatus: SubmissionStatus | null | undefined,
  gateOk: boolean,
): boolean {
  if (!gateOk) return false;
  return submissionStatus === "NEEDS_REVISION" || submissionStatus === "REJECTED";
}
