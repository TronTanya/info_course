/**
 * Учебная проверка заданий по криптографии для новичков.
 * Без задач на взлом, перебор или «кракинг» — только разбор сдвига, Base64 и свойств хешей.
 */

export const CRYPTO_CAESAR_CIPHER = "LQIRUPDWLRQ";
export const CRYPTO_CAESAR_SHIFT = 3;
export const CRYPTO_CAESAR_EXPECTED = "information";

export const CRYPTO_B64_STRING = "Y3liZXJzZWN1cml0eQ==";
export const CRYPTO_B64_EXPECTED = "cybersecurity";

/** Два разных учебных SHA-256 (от разных коротких строк); только для сравнения «совпадают / нет». */
export const CRYPTO_HASH_A =
  "e601fa447199bb85efefcf6c844f6b519cbefe84a8d9e11002707d5440b5e4e8";
export const CRYPTO_HASH_B =
  "71f49464b2f5972767e410ab5623a9e3a3e70aeff38b34a00c72a51629be3559";

export const CRYPTO_HASH_EXPECTED_SAME = false;

export const CRYPTO_HASH_MEANING_MIN = 20;
const MEANING_MIN = CRYPTO_HASH_MEANING_MIN;
const MEANING_PATTERN =
  /(разн|отлич|не\s*совпад|совпада|одинаков|коллиз|односторон|хеш|функц|контрол|сумм|ввод|строк|байт|бит|different|same|hash|input)/i;

export function normCryptoAnswer(s: string): string {
  return String(s)
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

export type CryptoBeginnerInput = {
  caesar: string;
  b64: string;
  /** null — пользователь ещё не выбрал «совпадают / нет». */
  hashSame: boolean | null;
  hashMeaning: string;
};

export type CryptoBeginnerScoreResult = {
  score: number;
  maxScore: number;
  passed: boolean;
  feedback: string;
  /** Краткие учебные пояснения по каждому блоку (для UI после проверки). */
  explanations: {
    caesar: string;
    base64: string;
    hash: string;
  };
  detail: { caesarOk: boolean; b64Ok: boolean; hashOk: boolean };
};

export function scoreCryptoBeginner(input: CryptoBeginnerInput): CryptoBeginnerScoreResult {
  const maxScore = 3;
  const caesarOk = normCryptoAnswer(input.caesar) === normCryptoAnswer(CRYPTO_CAESAR_EXPECTED);
  const b64Ok = normCryptoAnswer(input.b64) === normCryptoAnswer(CRYPTO_B64_EXPECTED);
  const meaning = normCryptoAnswer(input.hashMeaning);
  const meaningOk = meaning.length >= MEANING_MIN && MEANING_PATTERN.test(meaning);
  const hashChoiceOk = input.hashSame !== null && input.hashSame === CRYPTO_HASH_EXPECTED_SAME;
  const hashOk = hashChoiceOk && meaningOk;

  let score = 0;
  if (caesarOk) score += 1;
  if (b64Ok) score += 1;
  if (hashOk) score += 1;

  const passed = score >= 2;

  const explanations = {
    caesar:
      "Шифр Цезаря со сдвигом 3: каждая буква алфавита сдвинута вперёд при шифровании, поэтому при расшифровке сдвигаем назад на 3 позиции (только латиница A–Z). В реальных системах так не защищают данные — это вводная тема.",
    base64:
      "Base64 — это кодирование для передачи байтов текстом, а не шифрование: любой может декодировать строку без ключа. Полезно узнавать такие фрагменты в логах и конфигурациях.",
    hash:
      "Криптографическая хеш-функция (например SHA-256) даёт «отпечаток» данных фиксированной длины. Разные отпечатки почти наверняка означают разный ввод; совпадение двух хешей при разном вводе на практике крайне маловероятно (учебно говорят о стойкости к коллизиям для знакомых алгоритмов).",
  };

  let feedback: string;
  if (score === 3) {
    feedback =
      "Отлично: верно расшифрован сдвиг, декодирован Base64 и верно интерпретированы два учебных хеша с пояснением.";
  } else if (score === 2) {
    feedback =
      "Хорошо: два из трёх блоков верны. Просмотрите подсказку к ошибочному разделу и при необходимости попробуйте снова.";
  } else if (score === 1) {
    feedback = "Пока только один верный ответ. Перечитайте условия: сдвиг Цезаря, смысл Base64 и сравнение длинных шестнадцатеричных строк.";
  } else {
    feedback =
      "Пока неверно. Напоминание: для Цезаря сдвигайте каждую букву A–Z назад на 3; Base64 декодируется без пароля; два разных хеша SHA-256 указывают на разные исходные данные в учебном примере.";
  }

  if (!hashChoiceOk && (caesarOk || b64Ok)) {
    feedback += " Проверьте выбор «совпадают / не совпадают» для двух хешей.";
  } else if (hashChoiceOk && !meaningOk) {
    feedback += " Добавьте пару предложений: чем отличаются хеши разной длины/значения и зачем они в контроле целостности.";
  }

  return {
    score,
    maxScore,
    passed,
    feedback,
    explanations,
    detail: { caesarOk, b64Ok, hashOk },
  };
}
