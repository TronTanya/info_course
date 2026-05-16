/**
 * Учебная оценка анализа URL (вымышленные домены, без внешних запросов).
 */

export const URL_ANALYSIS_REASON_IDS = [
  "no_https",
  "similar_domain",
  "char_substitution",
  "extra_words_domain",
  "unknown_domain",
] as const;

export type UrlAnalysisReasonId = (typeof URL_ANALYSIS_REASON_IDS)[number];

export const URL_ANALYSIS_REASON_LABELS: Record<UrlAnalysisReasonId, string> = {
  no_https: "Нет HTTPS",
  similar_domain: "Похожий домен",
  char_substitution: "Подмена символов",
  extra_words_domain: "Лишние слова в домене",
  unknown_domain: "Неизвестный домен",
};

export type UrlAnalysisVerdict = "safe" | "unsafe";

export type UrlAnalysisItem = {
  id: string;
  url: string;
  expectedVerdict: UrlAnalysisVerdict;
  /** Для подозрительных — любая из перечисленных причин считается верной. */
  acceptableReasons: readonly UrlAnalysisReasonId[];
};

/** Фиксированный учебный набор (порядок как в задании). */
export const URL_ANALYSIS_ITEMS: readonly UrlAnalysisItem[] = [
  {
    id: "u1",
    url: "https://college.ru/login",
    expectedVerdict: "safe",
    acceptableReasons: [],
  },
  {
    id: "u2",
    url: "http://college-security-login.ru",
    expectedVerdict: "unsafe",
    acceptableReasons: ["no_https", "similar_domain", "extra_words_domain"],
  },
  {
    id: "u3",
    url: "https://coIIege.ru/login",
    expectedVerdict: "unsafe",
    acceptableReasons: ["char_substitution", "similar_domain"],
  },
  {
    id: "u4",
    url: "https://college.ru.security-check.example.com",
    expectedVerdict: "unsafe",
    acceptableReasons: ["extra_words_domain", "similar_domain", "unknown_domain"],
  },
  {
    id: "u5",
    url: "https://portal.college.ru",
    expectedVerdict: "safe",
    acceptableReasons: [],
  },
] as const;

const EXPL_MIN = 35;
const EXPL_PATTERN = /(домен|https|http|ссылк|подозрит|поддел|опечат|протокол|поддомен)/i;

function normVerdict(v: string): UrlAnalysisVerdict | null {
  const s = String(v).trim().toUpperCase();
  if (s === "SAFE" || s === "БЕЗОПАСНО") return "safe";
  if (s === "UNSAFE" || s === "ПОДОЗРИТЕЛЬНО" || s === "SUSPICIOUS") return "unsafe";
  const lower = String(v).trim().toLowerCase();
  if (lower === "safe") return "safe";
  if (lower === "unsafe") return "unsafe";
  return null;
}

function isReasonId(s: string): s is UrlAnalysisReasonId {
  return (URL_ANALYSIS_REASON_IDS as readonly string[]).includes(s);
}

export type UrlAnalysisRowInput = {
  id: string;
  verdict: string;
  reason?: string | null;
};

export type UrlAnalysisScoreResult = {
  score: number;
  maxScore: number;
  passed: boolean;
  feedback: string;
  explanationOk: boolean;
};

function rowScore(
  item: UrlAnalysisItem,
  verdict: UrlAnalysisVerdict | null,
  reasonRaw: string | null,
): number {
  if (!verdict) return 0;
  const reason = reasonRaw && isReasonId(reasonRaw.trim()) ? (reasonRaw.trim() as UrlAnalysisReasonId) : null;

  if (item.expectedVerdict === "safe") {
    if (verdict !== "safe") return 0;
    return 2;
  }

  if (verdict !== "unsafe") return 0;
  if (item.acceptableReasons.length === 0) return 0;
  if (!reason || !item.acceptableReasons.includes(reason)) return 1;
  return 2;
}

/**
 * Баллы: до 10 по строкам (по 2 за ссылку) + объяснение не входит в число,
 * но влияет на `passed` и текст обратной связи.
 */
export function scoreUrlAnalysis(rows: UrlAnalysisRowInput[], explanation: string): UrlAnalysisScoreResult {
  const maxScore = 10;
  const byId = new Map(rows.map((r) => [String(r.id).trim(), r]));

  let urlPart = 0;
  const missed: string[] = [];

  for (const item of URL_ANALYSIS_ITEMS) {
    const r = byId.get(item.id);
    const v = r ? normVerdict(String(r.verdict)) : null;
    const reason = r && typeof r.reason === "string" ? r.reason : null;
    const pts = rowScore(item, v, reason);
    urlPart += pts;
    if (pts < 2) missed.push(item.id);
  }

  const expl = explanation.trim();
  const explanationOk = expl.length >= EXPL_MIN && EXPL_PATTERN.test(expl);

  const score = urlPart;
  const passed = urlPart >= 7 && explanationOk;

  let feedback: string;
  if (!explanationOk) {
    feedback =
      expl.length < EXPL_MIN
        ? `Добавьте развёрнутое объяснение (не менее ${EXPL_MIN} символов): на что вы смотрели при разборе ссылок.`
        : "В объяснении упомяните хотя бы одно из: домен, протокол http/https, подозрительность ссылки, опечатку или поддомен.";
  } else if (urlPart === maxScore) {
    feedback =
      "Отлично: все ссылки классифицированы верно, для подозрительных выбраны уместные причины. В учебных материалах такой разбор снижает риск перейти по поддельной странице.";
  } else if (urlPart >= 8) {
    feedback =
      "Хорошо: почти всё верно. Сверьтесь с подсказками: обратите внимание на протокол без шифрования, похожее имя сайта, подмену букв и лишние сегменты в домене.";
  } else if (urlPart >= 7) {
    feedback =
      "Результат на грани: повторите тему про чтение домена справа налево и сравнение с ожидаемым адресом организации.";
  } else {
    feedback =
      "Нужно доработать: проверьте каждую строку — официальный вход обычно на https и знакомом домене; подозрительны «лишние» слова в имени, http без s и опечатки в бренде.";
  }

  if (missed.length > 0 && explanationOk) {
    feedback += ` Рекомендуем пересмотреть ссылки с номерами: ${missed.join(", ")}.`;
  }

  return {
    score,
    maxScore,
    passed,
    feedback,
    explanationOk,
  };
}
