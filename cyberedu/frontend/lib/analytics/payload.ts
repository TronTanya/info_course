import type { AnalyticsEventName } from "@/lib/analytics/events";

/** Разрешённые поля: только opaque id и контекст поверхности, без PII и контента ответов. */
export type SafeAnalyticsProps = {
  moduleId?: string;
  lessonId?: string;
  testId?: string;
  practiceId?: string;
  /** Уровень подсказки практики (1–3), без текста подсказки. */
  hintLevel?: number;
  /** Откуда инициировано действие (карточка, хаб модуля, дашборд и т.д.). */
  source?: string;
};

const ID_RE = /^[a-z0-9_-]{8,64}$/i;
const SOURCE_RE = /^[a-z0-9_-]{1,48}$/i;

const ALLOWED_KEYS = new Set<keyof SafeAnalyticsProps>([
  "moduleId",
  "lessonId",
  "testId",
  "practiceId",
  "hintLevel",
  "source",
]);

export function isSafeEntityId(value: string): boolean {
  return ID_RE.test(value);
}

export function sanitizeAnalyticsProps(
  props?: SafeAnalyticsProps | null,
): SafeAnalyticsProps | undefined {
  if (!props) return undefined;
  const out: SafeAnalyticsProps = {};
  for (const key of ALLOWED_KEYS) {
    const raw = props[key];
    if (raw == null) continue;

    if (key === "hintLevel") {
      const n = typeof raw === "number" ? raw : Number(raw);
      if (n === 1 || n === 2 || n === 3) out.hintLevel = n;
      continue;
    }

    if (typeof raw !== "string" || !raw.trim()) continue;
    const value = raw.trim();

    if (key === "source") {
      if (SOURCE_RE.test(value)) out.source = value;
      continue;
    }
    if (isSafeEntityId(value)) out[key] = value;
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

/** Извлекает opaque id из учебных URL без query/hash. */
export function parseLearnHrefIds(href: string): SafeAnalyticsProps {
  const path = href.split("?")[0]?.split("#")[0] ?? "";
  const parts = path.split("/").filter(Boolean);
  const courseIdx = parts.indexOf("course");
  if (courseIdx === -1) return {};
  const moduleId = parts[courseIdx + 1];
  if (!moduleId || !isSafeEntityId(moduleId)) return {};
  const step = parts[courseIdx + 2];
  const out: SafeAnalyticsProps = { moduleId };
  if (step === "lesson") return out;
  if (step === "test") return out;
  if (step === "practice") {
    const practiceId = parts[courseIdx + 3];
    if (practiceId && isSafeEntityId(practiceId)) out.practiceId = practiceId;
    return out;
  }
  return out;
}

export type AnalyticsDispatchDetail = {
  event: AnalyticsEventName;
} & SafeAnalyticsProps;
