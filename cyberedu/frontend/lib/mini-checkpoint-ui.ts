import { isPositiveSelfCheckOption } from "@/lib/lesson-checkpoints";
import { checkpointReactionStatusLabel } from "@/lib/lesson-page-a11y";

export const MINI_CHECKPOINT_MAX_QUESTIONS = 3;

export const MINI_CHECKPOINT_EMPTY_MESSAGE = "Самопроверка появится после обновления урока.";

export const MINI_CHECKPOINT_DISCLAIMER =
  "Самопроверка не влияет на итоговую оценку.";

export const MINI_CHECKPOINT_SESSION_NOTE =
  "Ответы хранятся только в этой сессии и не отправляются на сервер.";

export type CheckpointReaction = {
  tone: "positive" | "reflect";
  /** Краткая метка статуса (доступна визуально и для SR, не только цвет). */
  statusLabel: string;
  /** Краткий feedback сразу после выбора */
  feedback: string;
  /** Развёрнутое пояснение (из контента урока) */
  explanation: string | null;
};

export function buildCheckpointReaction(
  optionId: string,
  explanation?: string,
  optionFeedback?: string,
): CheckpointReaction {
  const positive = isPositiveSelfCheckOption(optionId);
  const feedback =
    optionFeedback?.trim() ||
    (positive
      ? "Хорошо — вы можете связать идею с примерами из урока."
      : "Стоит ещё раз пройти блоки «Важно» и примеры в материале.");

  const expl = explanation?.trim() || null;
  const explanationDistinct =
    expl && expl !== feedback && !feedback.includes(expl) ? expl : expl;

  const tone = positive ? "positive" : "reflect";
  const statusLabel = checkpointReactionStatusLabel(tone);

  return {
    tone,
    statusLabel,
    feedback,
    explanation: explanationDistinct,
  };
}

export function formatCheckpointProgress(answered: number, total: number): string {
  return `${answered} из ${total}`;
}
