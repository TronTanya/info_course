import type { PracticalTaskType } from "@prisma/client";
import { MINI_SOC_LOG_LINES } from "@/lib/log-analysis-mini-soc-score";
import { PHISHING_EMAIL_ELEMENT_IDS } from "@/lib/phishing-email-score";
import { URL_ANALYSIS_ITEMS, URL_ANALYSIS_REASON_LABELS } from "@/lib/url-analysis-score";

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function str(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

export type PracticeEvidenceBlock =
  | { kind: "email"; from: string; subject: string; body: string }
  | { kind: "url_list"; title: string; urls: { label: string; href: string }[] }
  | { kind: "log"; title: string; lines: string }
  | { kind: "hash"; label: string; value: string; algorithm?: string }
  | { kind: "text"; title: string; content: string }
  | {
      kind: "indicator_table";
      title: string;
      headers: [string, string];
      rows: { feature: string; note: string }[];
    };

function firstParagraph(text: string): string | null {
  const p = text.split(/\n\n+/).map((s) => s.trim()).find(Boolean);
  return p ?? null;
}

export type ParsedPracticeScenario = {
  studentRole: string | null;
  taskBrief: string | null;
  /** Контекст для сценария, если нет отдельной панели артефактов. */
  inputData: string | null;
  expectedOutcome: string | null;
  hintLevels: string[];
  evidence: PracticeEvidenceBlock[];
};

function extractEvidenceFromJson(sd: Record<string, unknown>): PracticeEvidenceBlock[] {
  const blocks: PracticeEvidenceBlock[] = [];

  const email = sd.email;
  if (isRecord(email)) {
    const from = str(email.from) || str(email.sender);
    const subject = str(email.subject);
    const body = str(email.body) || str(email.text);
    if (from || subject || body) {
      blocks.push({ kind: "email", from: from || "—", subject: subject || "—", body: body || "—" });
    }
  }

  if (Array.isArray(sd.urls)) {
    const urls = sd.urls
      .map((u, i) => {
        if (typeof u === "string") return { label: `URL ${i + 1}`, href: u };
        if (isRecord(u)) {
          const href = str(u.url) || str(u.href);
          if (!href) return null;
          return { label: str(u.label) || `URL ${i + 1}`, href };
        }
        return null;
      })
      .filter((x): x is { label: string; href: string } => x != null);
    if (urls.length > 0) {
      blocks.push({ kind: "url_list", title: "Ссылки для анализа", urls });
    }
  }

  const logText = str(sd.log) || str(sd.logLines);
  if (logText) {
    blocks.push({ kind: "log", title: "Журнал событий", lines: logText });
  }

  const hashVal = str(sd.hash) || str(sd.fileHash) || str(sd.sha256);
  if (hashVal) {
    blocks.push({
      kind: "hash",
      label: str(sd.hashLabel) || "Хэш артефакта",
      value: hashVal,
      algorithm: str(sd.hashAlgorithm) || undefined,
    });
  }

  if (Array.isArray(sd.situations)) {
    for (const raw of sd.situations) {
      if (!isRecord(raw)) continue;
      const text = str(raw.text);
      if (text) blocks.push({ kind: "text", title: "Ситуация", content: text });
    }
  }

  if (Array.isArray(sd.items)) {
    for (const raw of sd.items) {
      if (!isRecord(raw)) continue;
      const sample = str(raw.sample);
      const note = str(raw.note);
      if (sample) {
        blocks.push({
          kind: "text",
          title: note || "Образец данных",
          content: sample,
        });
      }
    }
  }

  if (Array.isArray(sd.indicators)) {
    const rows: { feature: string; note: string }[] = [];
    for (const raw of sd.indicators) {
      if (typeof raw === "string") {
        rows.push({ feature: raw, note: "—" });
      } else if (isRecord(raw)) {
        const feature = str(raw.feature) || str(raw.sign) || str(raw.name);
        const note = str(raw.note) || str(raw.description) || "—";
        if (feature) rows.push({ feature, note });
      }
    }
    if (rows.length > 0) {
      blocks.push({
        kind: "indicator_table",
        title: str(sd.indicatorsTitle) || "Признаки для проверки",
        headers: ["Признак", "Пояснение"],
        rows,
      });
    }
  }

  return blocks;
}

function evidenceForTaskType(taskType: PracticalTaskType): PracticeEvidenceBlock[] {
  switch (taskType) {
    case "URL_ANALYSIS":
      return [
        {
          kind: "url_list",
          title: "Набор ссылок (учебный)",
          urls: URL_ANALYSIS_ITEMS.map((u, i) => ({ label: `Ссылка ${i + 1}`, href: u.url })),
        },
        {
          kind: "indicator_table",
          title: "Справочник причин подозрения",
          headers: ["Код", "Описание"],
          rows: Object.entries(URL_ANALYSIS_REASON_LABELS).map(([code, label]) => ({
            feature: code,
            note: label,
          })),
        },
      ];
    case "LOG_ANALYSIS":
      return [
        {
          kind: "log",
          title: "Фрагмент журнала mini-SOC",
          lines: MINI_SOC_LOG_LINES.join("\n"),
        },
      ];
    case "PHISHING_ANALYSIS":
      return [
        {
          kind: "indicator_table",
          title: "Что можно отметить в письме",
          headers: ["Признак", "Описание"],
          rows: [
            { feature: "sender", note: "Подозрительный адрес отправителя" },
            { feature: "urgency", note: "Срочность в теме" },
            { feature: "suspicious_link", note: "Подозрительная ссылка" },
            { feature: "password_request", note: "Просьба ввести пароль" },
            { feature: "threat_block", note: "Угроза блокировки" },
          ].filter((r) => PHISHING_EMAIL_ELEMENT_IDS.includes(r.feature as (typeof PHISHING_EMAIL_ELEMENT_IDS)[number])),
        },
      ];
    default:
      return [];
  }
}

/**
 * Разбор учебного сценария без раскрытия эталонных ответов (только публичные поля JSON).
 */
export function parsePracticeScenario(
  description: string,
  instruction: string | null,
  consoleScenario: string | null,
  scenarioData: unknown,
  taskType?: PracticalTaskType,
): ParsedPracticeScenario {
  const sd = isRecord(scenarioData) ? scenarioData : null;

  const hintLevels =
    sd && Array.isArray(sd.hints)
      ? sd.hints.filter((x): x is string => typeof x === "string" && x.trim().length > 0)
      : [];

  const studentRole =
    (typeof sd?.studentRole === "string" && sd.studentRole.trim()) ||
    extractRoleLine(description) ||
    "Специалист по информационной безопасности (учебная роль)";

  const taskBrief =
    instruction?.trim() ||
    (typeof sd?.task === "string" ? sd.task.trim() : null) ||
    firstParagraph(description);

  const evidenceFromJson = sd ? extractEvidenceFromJson(sd) : [];
  const evidenceFromType = taskType ? evidenceForTaskType(taskType) : [];
  const evidence = evidenceFromJson.length > 0 ? [...evidenceFromJson] : [...evidenceFromType];

  const consoleText = consoleScenario?.trim();
  if (consoleText && !evidence.some((e) => e.kind === "log")) {
    evidence.push({ kind: "log", title: "Контекст лаборатории", lines: consoleText });
  }

  const inputData =
    evidence.length > 0
      ? null
      : consoleScenario?.trim() ||
        (typeof sd?.artifacts === "string" ? sd.artifacts.trim() : null) ||
        (typeof sd?.inputData === "string" ? sd.inputData.trim() : null) ||
        null;

  const expectedOutcome =
    (typeof sd?.expectedResult === "string" && sd.expectedResult.trim()) ||
    (typeof sd?.expectedOutcome === "string" && sd.expectedOutcome.trim()) ||
    (typeof sd?.criteria === "string" && sd.criteria.trim()) ||
    "Корректный отчёт или выбор по критериям задания — без нарушения политики безопасности.";

  return {
    studentRole,
    taskBrief,
    inputData,
    expectedOutcome,
    hintLevels,
    evidence,
  };
}

function extractRoleLine(description: string): string | null {
  for (const line of description.split("\n")) {
    const t = line.trim();
    if (/^(роль|ваша роль|вы —|вы -)/i.test(t)) return t.replace(/^роль:\s*/i, "").trim() || t;
  }
  return null;
}
