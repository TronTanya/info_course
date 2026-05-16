/**
 * Учебная оценка мини-SOC: разбор журнала (защитный взгляд, без инструкций по атаке).
 */

export const MINI_SOC_LOG_LINES = [
  "2026-05-13 10:12:04 LOGIN_FAILED user=admin ip=192.168.1.44",
  "2026-05-13 10:12:08 LOGIN_FAILED user=admin ip=192.168.1.44",
  "2026-05-13 10:12:13 LOGIN_FAILED user=admin ip=192.168.1.44",
  "2026-05-13 10:12:20 LOGIN_SUCCESS user=admin ip=192.168.1.44",
  "2026-05-13 10:14:02 PASSWORD_RESET_REQUEST user=admin ip=192.168.1.44",
] as const;

/** Ожидаемый тип инцидента для учебного лога (несколько неудачных входов, затем успех и сброс пароля). */
export const MINI_SOC_EXPECTED_INCIDENT = "brute_force" as const;

export type MiniSocIncidentId =
  | typeof MINI_SOC_EXPECTED_INCIDENT
  | "normal_login"
  | "system_update"
  | "network_error";

export const MINI_SOC_INCIDENT_OPTIONS: { id: MiniSocIncidentId; label: string }[] = [
  { id: "brute_force", label: "Подбор пароля" },
  { id: "normal_login", label: "Обычный вход" },
  { id: "system_update", label: "Обновление системы" },
  { id: "network_error", label: "Ошибка сети" },
];

export const MINI_SOC_CONCLUSION_MIN = 50;

function norm(s: string): string {
  return s.trim().replace(/\s+/g, " ").toLowerCase();
}

/** Проверка наличия смысловых опорных фраз в выводе (без учёта регистра). */
export function miniSocKeywordHits(text: string): { id: string; ok: boolean }[] {
  const t = norm(text);
  return [
    {
      id: "failed_attempts",
      ok: /нескольк\w*[^\n]{0,48}неудачн|нескольк\w*[^\n]{0,24}попыток|ряд\s+неудачн|сери\w*\s+неудачн/i.test(
        t,
      ),
    },
    { id: "success_login", ok: /успешн\w*[^\n]{0,12}вход|успешный\s+вход|вход\s+успеш/i.test(t) },
    { id: "suspicious", ok: /подозрит/i.test(t) },
    { id: "admin", ok: /\badmin\b|админ|учётн\w*\s*admin/i.test(t) },
    {
      id: "password_reset",
      ok: /password\s*reset|password_reset|сброс\w*[^\n]{0,16}парол|запрос\s+сброс/i.test(t),
    },
  ];
}

export type LogAnalysisMiniSocInput = {
  incidentType: string;
  conclusion: string;
};

export type LogAnalysisMiniSocScoreResult = {
  score: number;
  maxScore: number;
  passed: boolean;
  feedback: string;
  incidentCorrect: boolean;
  keywordHits: { id: string; ok: boolean }[];
};

export function scoreLogAnalysisMiniSoc(input: LogAnalysisMiniSocInput): LogAnalysisMiniSocScoreResult {
  const maxScore = 6;
  const incident = String(input.incidentType).trim();
  const incidentCorrect = incident === MINI_SOC_EXPECTED_INCIDENT;
  const conclusion = String(input.conclusion).trim();
  const keywordHits = miniSocKeywordHits(conclusion);
  const kwScore = keywordHits.filter((k) => k.ok).length;
  let score = (incidentCorrect ? 1 : 0) + kwScore;
  if (score > maxScore) score = maxScore;

  const allKw = keywordHits.every((k) => k.ok);
  const lengthOk = conclusion.length >= MINI_SOC_CONCLUSION_MIN;
  const passed = incidentCorrect && allKw && lengthOk;

  const missingKw = keywordHits.filter((k) => !k.ok).map((k) => k.id);
  let feedback: string;
  if (passed) {
    feedback =
      "Верно: для учебной записи видна цепочка неудачных попыток входа, затем успешный вход и запрос сброса пароля — типичный повод зафиксировать инцидент и проверить учётную запись с позиции защиты.";
  } else if (!incidentCorrect) {
    feedback =
      "Тип инцидента выбран неверно. Сопоставьте события LOGIN_FAILED, затем LOGIN_SUCCESS и PASSWORD_RESET_REQUEST во времени: с точки зрения SOC это ближе к компрометации учётной записи или подбору/перебору на стороне защиты, а не к «обычному входу» или сетевой ошибке.";
  } else if (!lengthOk) {
    feedback = `Вывод слишком короткий: добавьте не менее ${MINI_SOC_CONCLUSION_MIN} символов с перечислением наблюдений.`;
  } else {
    const kwLabels: Record<string, string> = {
      failed_attempts: "несколько неудачных попыток",
      success_login: "успешный вход",
      suspicious: "подозрительно",
      admin: "admin",
      password_reset: "password reset / сброс пароля",
    };
    const missingHuman = missingKw.map((id) => kwLabels[id] ?? id).join(", ");
    feedback = `В тексте не хватает опорных формулировок (по смыслу): ${missingHuman}. Сформулируйте вывод своими словами, опираясь на строки журнала и задачу мониторинга.`;
  }

  return {
    score,
    maxScore,
    passed,
    feedback,
    incidentCorrect,
    keywordHits,
  };
}
