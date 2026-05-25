import type { PracticalTaskType } from "@prisma/client";
import { practiceSubmissionBlockedMessage as revisionBlockedMessage } from "@/lib/practice-feedback-revision-ui";
import type { PracticeViewStatus } from "@/types/practice-view-model";

export type PracticeSubmissionAnswerKind =
  | "text"
  | "checklist"
  | "url_analysis"
  | "log_analysis"
  | "file_upload"
  | "combined"
  | "interactive"
  | "scenario";

const SCENARIO_DELEGATE_TYPES = new Set<PracticalTaskType>([
  "SITUATION_CHOICE",
  "PASSWORD_ANALYSIS",
  "PHISHING_ANALYSIS",
  "CRYPTO_TASK",
  "TRAINING_CONSOLE",
]);

export function resolvePracticeSubmissionAnswerKind(taskType: PracticalTaskType): PracticeSubmissionAnswerKind {
  switch (taskType) {
    case "TEXT_ANSWER":
      return "text";
    case "CHECKLIST":
      return "checklist";
    case "URL_ANALYSIS":
      return "url_analysis";
    case "LOG_ANALYSIS":
      return "log_analysis";
    case "FILE_UPLOAD":
      return "file_upload";
    case "COMBINED":
      return "combined";
    case "INTERACTIVE":
      return "interactive";
    default:
      return SCENARIO_DELEGATE_TYPES.has(taskType) ? "scenario" : "text";
  }
}

export function isPracticeSubmissionDisabled(
  status: PracticeViewStatus,
  canSubmit: boolean,
): boolean {
  return !canSubmit;
}

export function practiceSubmissionBlockedMessage(
  status: PracticeViewStatus,
  canRetry = false,
): string {
  return revisionBlockedMessage(status, canRetry);
}

export function validateTextAnswer(text: string, minLength: number): string | null {
  const t = text.trim();
  if (!t) return "Введите ответ.";
  if (t.length < minLength) return `Ответ должен быть не короче ${minLength} символов (сейчас ${t.length}).`;
  if (t.length > 8000) return "Ответ слишком длинный (максимум 8000 символов).";
  return null;
}

export function validateChecklistAnswer(
  checkedIds: string[],
  reflection: string,
  minReflection: number,
  totalItems: number,
): string | null {
  if (totalItems > 0 && checkedIds.length < totalItems) {
    return "Отметьте все пункты чек-листа.";
  }
  const r = reflection.trim();
  if (!r) return "Добавьте краткое объяснение.";
  if (r.length < minReflection) {
    return `Объяснение должно быть не короче ${minReflection} символов (сейчас ${r.length}).`;
  }
  return null;
}

export type UrlAnalysisReportFields = {
  suspiciousSigns: string;
  risk: string;
  explanation: string;
  safeActions: string;
};

export function validateUrlAnalysisReport(
  report: UrlAnalysisReportFields,
  minExplanation = 35,
): string | null {
  if (!report.suspiciousSigns.trim()) return "Укажите подозрительные признаки.";
  if (!report.risk.trim()) return "Опишите уровень риска.";
  if (report.explanation.trim().length < minExplanation) {
    return `Добавьте объяснение (не менее ${minExplanation} символов).`;
  }
  if (!report.safeActions.trim()) return "Опишите безопасные действия.";
  return null;
}

export function buildUrlAnalysisExplanation(report: UrlAnalysisReportFields): string {
  const parts = [
    `Подозрительные признаки: ${report.suspiciousSigns.trim()}`,
    `Риск: ${report.risk.trim()}`,
    `Безопасные действия: ${report.safeActions.trim()}`,
    report.explanation.trim(),
  ].filter(Boolean);
  return parts.join("\n\n").slice(0, 8000);
}

export type LogAnalysisReportFields = {
  suspiciousEvents: string;
  possibleCause: string;
  recommendation: string;
};

export function validateLogAnalysisReport(
  report: LogAnalysisReportFields,
  minConclusion = 50,
): string | null {
  if (!report.suspiciousEvents.trim()) return "Опишите подозрительные события.";
  if (!report.possibleCause.trim()) return "Укажите возможную причину.";
  if (!report.recommendation.trim()) return "Добавьте рекомендацию.";
  const combined = buildLogAnalysisConclusion(report);
  if (combined.length < minConclusion) {
    return `Совокупный ответ должен быть не короче ${minConclusion} символов (сейчас ${combined.length}).`;
  }
  return null;
}

export function buildLogAnalysisConclusion(report: LogAnalysisReportFields): string {
  return [
    `Подозрительные события: ${report.suspiciousEvents.trim()}`,
    `Возможная причина: ${report.possibleCause.trim()}`,
    `Рекомендация: ${report.recommendation.trim()}`,
  ]
    .join("\n\n")
    .slice(0, 8000);
}

export function validatePracticeFile(
  file: File | null,
  accept: string,
  maxMb: number,
): string | null {
  if (!file) return "Прикрепите файл.";
  const maxBytes = maxMb * 1024 * 1024;
  if (file.size > maxBytes) return `Файл больше ${maxMb} МБ.`;
  if (file.size === 0) return "Пустой файл не принимается.";
  if (accept) {
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    const allowed = accept
      .split(",")
      .map((s) => s.trim().replace(/^\./, "").toLowerCase())
      .filter(Boolean);
    if (allowed.length > 0 && ext && !allowed.some((a) => ext === a || ext === "jpeg" && a === "jpg")) {
      return `Разрешены форматы: ${allowed.join(", ")}.`;
    }
  }
  return null;
}
