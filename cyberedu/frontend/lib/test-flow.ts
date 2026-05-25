/** Фазы UX теста модуля (этап 2). */
export type TestFlowPhase = "intro" | "taking" | "submit_confirm" | "result";

export const TEST_FLOW_PHASE_LABELS: Record<TestFlowPhase, string> = {
  intro: "Перед тестом",
  taking: "Прохождение",
  submit_confirm: "Подтверждение отправки",
  result: "Результат",
};

export const TEST_INTRO_CTA = "Начать тест";
export const TEST_SUBMIT_CTA = "Отправить тест";
export const TEST_RETURN_TO_QUESTIONS_CTA = "Вернуться к вопросам";

export const TEST_RESULT_CTA = {
  reviewMaterial: "Повторить материал",
  practice: "Перейти к практике",
  retry: "Повторить тест",
  course: "Вернуться к курсу",
} as const;

/** Краткое описание теста для intro (без спойлеров). */
export function buildTestIntroDescription(input: {
  moduleTitle: string;
  moduleDescription?: string | null;
  questionCount: number;
}): string {
  const fromModule = input.moduleDescription?.trim();
  if (fromModule) {
    const oneLine = fromModule.replace(/\s+/g, " ").trim();
    if (oneLine.length <= 280) return oneLine;
    const slice = oneLine.slice(0, 277).trim();
    const last = slice.lastIndexOf(" ");
    return `${last > 80 ? slice.slice(0, last) : slice}…`;
  }
  if (input.questionCount > 0) {
    return `Контроль знаний по модулю «${input.moduleTitle}». Проверьте понимание материала лекции перед практикой.`;
  }
  return "Контроль знаний модуля перед переходом к практике.";
}

export function formatTestAttemptHistory(attemptCount: number): string | null {
  if (attemptCount <= 0) return null;
  if (attemptCount === 1) return "1 попытка в вашей истории";
  if (attemptCount < 5) return `${attemptCount} попытки в вашей истории`;
  return `${attemptCount} попыток в вашей истории`;
}

/** Подпись попытки на экране результата (после успешной отправки). */
export function formatTestResultAttemptInfo(
  attemptsUsed: number,
  maxAttempts?: number | null,
): string | null {
  if (attemptsUsed <= 0) return null;
  if (maxAttempts != null && maxAttempts > 0) {
    const left = Math.max(0, maxAttempts - attemptsUsed);
    if (left === 0) return `Попытка ${attemptsUsed} из ${maxAttempts} · лимит исчерпан`;
    return `Попытка ${attemptsUsed} из ${maxAttempts} · осталось ${left}`;
  }
  if (attemptsUsed === 1) return "Попытка 1";
  if (attemptsUsed < 5) return `Попытка ${attemptsUsed}`;
  return `Попытка ${attemptsUsed}`;
}
