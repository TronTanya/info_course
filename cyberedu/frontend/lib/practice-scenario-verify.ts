import type { PracticalTaskType, Prisma } from "@prisma/client";
import { scoreCryptoBeginner } from "@/lib/crypto-beginner-score";
import { scoreLogAnalysisMiniSoc } from "@/lib/log-analysis-mini-soc-score";
import { scoreUrlAnalysis, URL_ANALYSIS_ITEMS, type UrlAnalysisRowInput } from "@/lib/url-analysis-score";

export const STRUCTURED_SCENARIO_TASK_TYPES: PracticalTaskType[] = [
  "SITUATION_CHOICE",
  "PASSWORD_ANALYSIS",
  "PHISHING_ANALYSIS",
  "CHECKLIST",
  "URL_ANALYSIS",
  "CRYPTO_TASK",
  "LOG_ANALYSIS",
];

export type ScenarioVerifyOutcome =
  | { decision: "accept"; textAnswer: string }
  | { decision: "submit"; textAnswer: string }
  | { decision: "reject"; error: string };

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function norm(s: string): string {
  return s.trim().replace(/\s+/g, " ").toLowerCase();
}

function sortStrArr(a: string[]): string[] {
  return [...a].map((x) => x.trim()).sort();
}

function setsEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const sa = sortStrArr(a);
  const sb = sortStrArr(b);
  return sa.every((x, i) => x === sb[i]);
}

function testPattern(pattern: string, text: string): boolean {
  if (pattern.length > 400) return false;
  try {
    return new RegExp(pattern, "i").test(text.trim());
  } catch {
    return false;
  }
}

function parsePayloadJson(raw: string): unknown {
  const t = raw.trim();
  if (!t || t.length > 32_000) return null;
  try {
    return JSON.parse(t) as unknown;
  } catch {
    return null;
  }
}

/**
 * Серверная проверка учебных сценариев практики (без исполняемого кода и без внешних вызовов).
 */
export function verifyStructuredPractice(
  taskType: PracticalTaskType,
  scenarioData: Prisma.JsonValue | null,
  payloadRaw: string,
  minLengthFallback: number,
): ScenarioVerifyOutcome {
  if (!scenarioData || !isRecord(scenarioData)) {
    return { decision: "reject", error: "Задание настроено некорректно (нет сценария). Обратитесь к администратору." };
  }
  const sd = scenarioData;
  const payload = parsePayloadJson(payloadRaw);
  if (!isRecord(payload)) {
    return { decision: "reject", error: "Некорректный формат ответа. Обновите страницу и попробуйте снова." };
  }

  const store = (obj: unknown): string => JSON.stringify(obj).slice(0, 12_000);

  if (taskType === "SITUATION_CHOICE") {
    const situations = sd.situations;
    if (!Array.isArray(situations) || situations.length === 0) {
      return { decision: "reject", error: "Сценарий повреждён." };
    }
    const answers = payload.answers;
    if (!isRecord(answers)) {
      return { decision: "reject", error: "Укажите ответы по всем ситуациям." };
    }
    for (const sit of situations) {
      if (!isRecord(sit) || typeof sit.id !== "string") continue;
      const id = sit.id;
      const exp = sit.expected;
      if (!isRecord(exp)) continue;
      const got = answers[id];
      if (!isRecord(got)) {
        return { decision: "reject", error: `Не заполнена ситуация «${id}».` };
      }
      const keys = ["personalData", "risk", "safeAction"] as const;
      for (const k of keys) {
        const ev = exp[k];
        const gv = got[k];
        if (typeof ev !== "string" || typeof gv !== "string" || gv !== ev) {
          return { decision: "reject", error: "Не все выборы верны. Перечитайте ситуации и подсказки." };
        }
      }
    }
    return { decision: "accept", textAnswer: store({ taskType, answers }) };
  }

  if (taskType === "PASSWORD_ANALYSIS") {
    const items = sd.items;
    if (!Array.isArray(items) || items.length === 0) {
      return { decision: "reject", error: "Сценарий повреждён." };
    }
    const ratings = payload.ratings;
    if (!isRecord(ratings)) {
      return { decision: "reject", error: "Оцените каждый пароль." };
    }
    for (const it of items) {
      if (!isRecord(it) || typeof it.id !== "string" || typeof it.expectedStrength !== "string") continue;
      const r = ratings[it.id];
      if (typeof r !== "string" || norm(r) !== norm(it.expectedStrength)) {
        return { decision: "reject", error: "Есть неверная оценка силы пароля. См. подсказки по длине и набору символов." };
      }
    }
    return { decision: "accept", textAnswer: store({ taskType, ratings }) };
  }

  if (taskType === "PHISHING_ANALYSIS") {
    const correct = sd.correctFlagIds;
    if (!Array.isArray(correct) || !correct.every((x) => typeof x === "string")) {
      return { decision: "reject", error: "Сценарий повреждён." };
    }
    const flags = payload.flags;
    if (!Array.isArray(flags) || !flags.every((x) => typeof x === "string")) {
      return { decision: "reject", error: "Отметьте подозрительные элементы письма." };
    }
    if (!setsEqual(flags as string[], correct as string[])) {
      return { decision: "reject", error: "Набор отмеченных признаков не совпадает с учебным эталоном. Перепроверьте письмо." };
    }
    return { decision: "accept", textAnswer: store({ taskType, flags }) };
  }

  if (taskType === "CHECKLIST") {
    const requiredIds = sd.requiredIds;
    if (!Array.isArray(requiredIds) || !requiredIds.every((x) => typeof x === "string")) {
      return { decision: "reject", error: "Сценарий повреждён." };
    }
    const checked = payload.checked;
    if (!Array.isArray(checked) || !checked.every((x) => typeof x === "string")) {
      return { decision: "reject", error: "Отметьте пункты чек-листа." };
    }
    const cset = new Set(checked as string[]);
    for (const rid of requiredIds as string[]) {
      if (!cset.has(rid)) {
        return { decision: "reject", error: "Отметьте все обязательные пункты чек-листа." };
      }
    }
    const reflection = typeof payload.reflection === "string" ? payload.reflection.trim() : "";
    const minR = Math.max(20, Math.min(2000, Number(sd.reflectionMinLength) || 40));
    if (reflection.length < minR) {
      return { decision: "reject", error: `Короткий рефлексивный ответ: нужно не менее ${minR} символов.` };
    }
    const pat = typeof sd.reflectionPattern === "string" ? sd.reflectionPattern : "";
    if (pat && !testPattern(pat, reflection)) {
      return { decision: "reject", error: "В текстовом ответе не хватает ключевых слов по теме (см. формулировку задания)." };
    }
    return { decision: "accept", textAnswer: store({ taskType, checked, reflection }) };
  }

  if (taskType === "URL_ANALYSIS") {
    const urls = sd.urls;
    const rowsRaw = payload.rows;
    if (Array.isArray(rowsRaw)) {
      const rows: UrlAnalysisRowInput[] = [];
      for (const x of rowsRaw) {
        if (!isRecord(x)) continue;
        const id = typeof x.id === "string" ? x.id.trim() : "";
        const verdict = typeof x.verdict === "string" ? x.verdict : "";
        const reason = x.reason == null ? null : typeof x.reason === "string" ? x.reason : null;
        if (id) rows.push({ id, verdict, reason });
      }
      const need = URL_ANALYSIS_ITEMS.map((i) => i.id);
      const ids = new Set(rows.map((r) => r.id));
      if (need.some((id) => !ids.has(id)) || rows.length !== need.length || ids.size !== need.length) {
        return { decision: "reject", error: "Нужно заполнить все учебные ссылки." };
      }
      const explanation = typeof payload.explanation === "string" ? payload.explanation : "";
      const scored = scoreUrlAnalysis(rows, explanation);
      if (!scored.explanationOk || scored.score < 9) {
        return {
          decision: "reject",
          error:
            "Проверьте классификацию, причины для подозрительных ссылок и объяснение (домен, протокол, признаки риска).",
        };
      }
      return {
        decision: "accept",
        textAnswer: store({ taskType, rows, explanation, score: scored.score, maxScore: scored.maxScore }),
      };
    }

    if (!Array.isArray(urls) || urls.length === 0) {
      return { decision: "reject", error: "Сценарий повреждён." };
    }
    const verdicts = payload.verdicts;
    if (!isRecord(verdicts)) {
      return { decision: "reject", error: "Укажите вердикт по каждой ссылке." };
    }
    for (const u of urls) {
      if (!isRecord(u) || typeof u.id !== "string" || typeof u.expected !== "string") continue;
      const v = verdicts[u.id];
      if (typeof v !== "string" || norm(v) !== norm(u.expected)) {
        return { decision: "reject", error: "Есть ошибка в классификации ссылок. Проверьте домен и протокол." };
      }
    }
    const explanation = typeof payload.explanation === "string" ? payload.explanation.trim() : "";
    const minE = Math.max(30, Math.min(5000, Number(sd.explanationMinLength) || 50));
    if (explanation.length < minE) {
      return { decision: "reject", error: `Объяснение слишком короткое (минимум ${minE} символов).` };
    }
    const ep = typeof sd.explanationPattern === "string" ? sd.explanationPattern : "";
    if (ep && !testPattern(ep, explanation)) {
      return { decision: "reject", error: "В объяснении укажите домен, протокол или признак подделки/опасности." };
    }
    return { decision: "accept", textAnswer: store({ taskType, verdicts, explanation }) };
  }

  if (taskType === "CRYPTO_TASK") {
    const caesar = typeof payload.caesar === "string" ? payload.caesar : "";
    const b64 = typeof payload.b64 === "string" ? payload.b64 : "";
    const sm = payload.sameHash ?? payload.hashSame;
    const hashSame = sm === true ? true : sm === false ? false : null;
    const hashMeaning = typeof payload.hashMeaning === "string" ? payload.hashMeaning : "";
    const scored = scoreCryptoBeginner({ caesar, b64, hashSame, hashMeaning });
    if (scored.score < scored.maxScore) {
      return {
        decision: "reject",
        error:
          "Не все ответы верны или не хватает пояснения к хешам. Проверьте расшифровку, Base64 и выбор «совпадают / не совпадают» с кратким объяснением.",
      };
    }
    return {
      decision: "accept",
      textAnswer: store({
        taskType,
        caesar: caesar.trim(),
        b64: b64.trim(),
        hashSame: hashSame === true,
        hashMeaning: hashMeaning.trim(),
        score: scored.score,
        maxScore: scored.maxScore,
      }),
    };
  }

  if (taskType === "LOG_ANALYSIS") {
    const incidentType = typeof payload.incidentType === "string" ? payload.incidentType.trim() : "";
    if (incidentType) {
      const conclusion = typeof payload.conclusion === "string" ? payload.conclusion : "";
      const scored = scoreLogAnalysisMiniSoc({ incidentType, conclusion });
      if (!scored.passed) {
        return { decision: "reject", error: scored.feedback };
      }
      return {
        decision: "accept",
        textAnswer: store({
          taskType,
          incidentType,
          conclusion: conclusion.trim(),
          score: scored.score,
          maxScore: scored.maxScore,
        }),
      };
    }

    const conclusion = typeof payload.conclusion === "string" ? payload.conclusion.trim() : "";
    const minC = Math.max(40, Math.min(8000, Number(sd.conclusionMinLength) || Math.max(40, minLengthFallback)));
    if (conclusion.length < minC) {
      return { decision: "reject", error: `Вывод слишком короткий (минимум ${minC} символов).` };
    }
    const kws = sd.autoKeywords;
    if (!Array.isArray(kws) || !kws.every((x) => typeof x === "string")) {
      return { decision: "reject", error: "Сценарий повреждён." };
    }
    const lower = conclusion.toLowerCase();
    const missing: string[] = [];
    for (const kw of kws as string[]) {
      if (!lower.includes(kw.toLowerCase())) missing.push(kw);
    }
    if (missing.length > 0) {
      return {
        decision: "submit",
        textAnswer: store({ taskType, conclusion, note: "auto_keywords_partial", missing }),
      };
    }
    return { decision: "accept", textAnswer: store({ taskType, conclusion }) };
  }

  return { decision: "reject", error: "Этот тип задания не поддерживается в автоматической отправке." };
}
