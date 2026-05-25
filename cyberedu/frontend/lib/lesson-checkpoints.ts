import { extractSelfCheckItems } from "@/lib/lesson-page-ui";
import type { CheckpointOption, CheckpointQuestion } from "@/types/lesson-view-model";

/** Варианты самопроверки — не совпадают с graded test answers. */
export const SELF_CHECK_OPTIONS: CheckpointOption[] = [
  {
    id: "yes",
    text: "Понятно, могу объяснить",
    feedback: "Вы можете связать идею урока с примерами и предупреждениями из материала.",
  },
  {
    id: "retry",
    text: "Нужно повторить",
    feedback: "Вернитесь к блокам «Важно» и примерам в тексте урока, затем попробуйте снова.",
  },
];

const POSITIVE_OPTION_IDS = new Set(["yes", "correct", "got_it"]);

export function isPositiveSelfCheckOption(optionId: string): boolean {
  return POSITIVE_OPTION_IDS.has(optionId);
}

/** @deprecated Используйте `buildCheckpointReaction` из `@/lib/mini-checkpoint-ui`. */
export function selfCheckFeedback(
  optionId: string,
  explanation?: string,
  optionFeedback?: string,
): { prefix: string; body: string } {
  const positive = isPositiveSelfCheckOption(optionId);
  const body =
    optionFeedback?.trim() ||
    explanation?.trim() ||
    (positive
      ? "Вы можете связать идею урока с примерами и предупреждениями из материала."
      : "Вернитесь к блокам «Важно» и примерам в тексте урока, затем попробуйте снова.");
  return {
    prefix: positive ? "Верно, потому что…" : "Почти. Обрати внимание на…",
    body,
  };
}

/** Самопроверка из контента урока (2–3 вопроса), без привязки к Test в БД. */
export function buildLessonCheckpoints(content: string, lessonId: string, max = 3): CheckpointQuestion[] {
  const items = extractSelfCheckItems(content, max);
  return items.slice(0, max).map((item, index) => ({
    id: `checkpoint-${lessonId}-${index}`,
    question: item.question,
    options: [...SELF_CHECK_OPTIONS],
    explanation: item.hint,
  }));
}
