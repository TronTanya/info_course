/** Стабильные id и хелперы доступности для страницы практики. */

export const PRACTICE_FORM_VALIDATION_ERROR_ID = "practice-form-validation-error";

export function practiceLabTitleId(taskId: string): string {
  return `practice-lab-title-${taskId}`;
}

export function practiceSubmitDisabledReasonId(taskId: string): string {
  return `practice-submit-disabled-${taskId}`;
}

/** Одна h1 на странице: при нескольких заданиях — h1 у модуля, заголовки заданий — h2. */
export function resolvePracticeLabTitleLevel(taskIndex: number, taskCount: number): 1 | 2 {
  if (taskCount <= 1) return 1;
  return 2;
}

export function practicePageHeadingLabel(moduleTitle: string): string {
  return `Кибер-лаборатория · ${moduleTitle}`;
}

export function minLengthCounterStatus(
  len: number,
  min: number,
): { sufficient: boolean; spokenLabel: string } {
  const sufficient = len >= min;
  return {
    sufficient,
    spokenLabel: sufficient
      ? `Введено ${len} символов, минимум ${min} — достаточно`
      : `Введено ${len} из ${min} символов, нужно ещё ${Math.max(0, min - len)}`,
  };
}

/** Текстовое обозначение severity — не только цвет ячейки. */
export function logSeverityPresentation(severity?: string | null): {
  display: string;
  tone: "danger" | "warning" | "muted" | "neutral";
} {
  const raw = (severity ?? "").trim();
  if (!raw) return { display: "—", tone: "neutral" };
  const upper = raw.toUpperCase();
  if (upper.includes("ERR") || upper.includes("CRIT") || upper.includes("ALERT")) {
    return { display: `Критичность: ${raw}`, tone: "danger" };
  }
  if (upper.includes("WARN")) {
    return { display: `Предупреждение: ${raw}`, tone: "warning" };
  }
  if (upper.includes("INFO") || upper.includes("DEBUG")) {
    return { display: `Информация: ${raw}`, tone: "muted" };
  }
  return { display: raw, tone: "neutral" };
}

export function logSeverityToneClass(tone: ReturnType<typeof logSeverityPresentation>["tone"]): string {
  switch (tone) {
    case "danger":
      return "text-danger";
    case "warning":
      return "text-warning";
    case "muted":
      return "text-muted-foreground";
    default:
      return "text-foreground";
  }
}
