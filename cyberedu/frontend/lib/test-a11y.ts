/** Текст для screen reader после успешной отправки теста (aria-live). */
export function formatTestSubmitResultAnnouncement(
  passed: boolean,
  percent: number,
  score: number,
  maxScore: number,
): string {
  const scorePart =
    maxScore > 0 ? `${score} из ${maxScore} баллов` : `${score} баллов`;
  if (passed) {
    return `Тест пройден. Результат ${percent} процентов, ${scorePart}.`;
  }
  return `Тест не пройден. Результат ${percent} процентов, ${scorePart}. Повторите слабые темы.`;
}

/** Подпись fieldset вариантов ответа. */
export function testAnswerOptionsLegend(questionNumber: number, total: number): string {
  return `Варианты ответа, вопрос ${questionNumber} из ${total}`;
}
