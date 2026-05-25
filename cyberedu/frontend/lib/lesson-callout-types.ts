/** Визуальные типы callout (этап 8). */
export type LessonCalloutType =
  | "info"
  | "example"
  | "warning"
  | "danger"
  | "checklist"
  | "tip";

export const LESSON_CALLOUT_TYPES: LessonCalloutType[] = [
  "info",
  "example",
  "warning",
  "danger",
  "checklist",
  "tip",
];

/** Текстовые заголовки — всегда видны, не только цветом. */
export const LESSON_CALLOUT_HEADINGS: Record<LessonCalloutType, string> = {
  info: "Важно",
  example: "Пример",
  warning: "Предупреждение",
  danger: "Риск",
  checklist: "Чеклист",
  tip: "Совет",
};

const TYPE_ALIASES: Record<string, LessonCalloutType> = {
  info: "info",
  important: "info",
  note: "info",
  example: "example",
  ex: "example",
  warning: "warning",
  warn: "warning",
  danger: "danger",
  risk: "danger",
  error: "danger",
  checklist: "checklist",
  check: "checklist",
  tip: "tip",
  hint: "tip",
  success: "tip",
};

/** Нормализация `type` из MDX / строкового пропа. */
export function resolveLessonCalloutType(raw?: string | null): LessonCalloutType {
  if (!raw?.trim()) return "info";
  const key = raw.trim().toLowerCase();
  return TYPE_ALIASES[key] ?? "info";
}
