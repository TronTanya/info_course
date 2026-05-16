/**
 * Учебная оценка разбора фишингового письма (без реальных брендов и внешних вызовов).
 */

export const PHISHING_EMAIL_ELEMENT_IDS = [
  "sender",
  "urgency",
  "suspicious_link",
  "password_request",
  "threat_block",
] as const;

export type PhishingEmailElementId = (typeof PHISHING_EMAIL_ELEMENT_IDS)[number];

const EXPECTED = new Set<string>(PHISHING_EMAIL_ELEMENT_IDS);

export type PhishingScoreResult = {
  score: number;
  maxScore: number;
  passed: boolean;
  feedback: string;
  correctHits: number;
  wrongHits: number;
};

/**
 * Оценка: баллы за верные находки минус ложные срабатывания, диапазон 0…5.
 */
export function scorePhishingEmailSelection(selectedElements: string[]): PhishingScoreResult {
  const maxScore = 5;
  const raw = selectedElements.map((s) => String(s).trim()).filter(Boolean);
  const uniqueSelected = [...new Set(raw)];

  const correctHits = uniqueSelected.filter((id) => EXPECTED.has(id)).length;
  const wrongHits = uniqueSelected.filter((id) => !EXPECTED.has(id)).length;

  let score = Math.max(0, Math.min(maxScore, correctHits - wrongHits));
  if (correctHits === 5 && wrongHits === 0) {
    score = 5;
  }

  const passed = score >= 3;

  let feedback: string;
  if (score === 5) {
    feedback =
      "Отлично: вы отметили все пять типичных признаков учебного «фишинга» и не добавили лишнего. Такой разбор помогает не попадаться на реальные письма.";
  } else if (score === 4) {
    feedback =
      "Хорошо: большинство признаков найдено. Сравните свой выбор с подсказками курса и при необходимости повторите тему про срочность и поддельные домены.";
  } else if (score === 3) {
    feedback =
      "Нужно повторить тему: результат на грани. Обратите внимание на адрес отправителя, угрозу блокировки и просьбу ввести пароль в письме — это частые признаки давления.";
  } else {
    feedback =
      "Задание не зачтено: отмечено слишком мало признаков или есть лишние элементы. Перечитайте письмо и используйте help в материалах модуля про фишинг.";
  }

  return {
    score,
    maxScore,
    passed,
    feedback,
    correctHits,
    wrongHits,
  };
}
