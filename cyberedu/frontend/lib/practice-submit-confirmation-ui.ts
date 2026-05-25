/** Краткое резюме ответа для диалога подтверждения (без содержимого ответа). */
export type PracticeSubmitSummary = {
  textLength?: number;
  filledFields?: string[];
  attachedFiles?: { name: string; sizeLabel?: string }[];
};

export const PRACTICE_SUBMISSION_STATUS_ID = "practice-submission-status";

export function scrollToPracticeSubmissionStatus(): void {
  if (typeof document === "undefined") return;
  document.getElementById(PRACTICE_SUBMISSION_STATUS_ID)?.scrollIntoView({
    behavior: "smooth",
    block: "nearest",
  });
}

export type PracticeSubmitEditPolicy = {
  canEditAfterSubmit: boolean;
  message: string;
};

/** Политика редактирования после отправки на проверку. */
export function resolvePracticeSubmitEditPolicy(allowsResubmitOnRevision: boolean): PracticeSubmitEditPolicy {
  if (allowsResubmitOnRevision) {
    return {
      canEditAfterSubmit: false,
      message:
        "После отправки изменить этот ответ нельзя. Если преподаватель вернёт работу на доработку, можно будет отправить новую версию.",
    };
  }
  return {
    canEditAfterSubmit: false,
    message: "После отправки изменить ответ нельзя — форма будет недоступна до завершения проверки.",
  };
}

export function formatPracticeSubmitSummaryLines(summary: PracticeSubmitSummary): string[] {
  const lines: string[] = [];
  if (summary.textLength != null) {
    lines.push(`Текст ответа: ${summary.textLength} симв.`);
  }
  if (summary.filledFields?.length) {
    lines.push(`Заполнено полей: ${summary.filledFields.length}`);
    for (const label of summary.filledFields.slice(0, 8)) {
      lines.push(`· ${label}`);
    }
    if (summary.filledFields.length > 8) {
      lines.push(`· …ещё ${summary.filledFields.length - 8}`);
    }
  }
  if (summary.attachedFiles?.length) {
    for (const f of summary.attachedFiles) {
      lines.push(f.sizeLabel ? `Файл: ${f.name} (${f.sizeLabel})` : `Файл: ${f.name}`);
    }
  }
  if (!lines.length) {
    lines.push("Ответ готов к отправке.");
  }
  return lines;
}

export function buildTextSubmitSummary(text: string): PracticeSubmitSummary {
  return { textLength: text.trim().length };
}

export function buildChecklistSubmitSummary(
  checkedCount: number,
  totalItems: number,
  reflectionLength: number,
): PracticeSubmitSummary {
  const filled: string[] = [];
  if (totalItems > 0) filled.push(`Чек-лист: ${checkedCount} / ${totalItems}`);
  if (reflectionLength > 0) filled.push(`Объяснение: ${reflectionLength} симв.`);
  return { filledFields: filled, textLength: reflectionLength > 0 ? reflectionLength : undefined };
}

export function buildFileSubmitSummary(file: File | null): PracticeSubmitSummary {
  if (!file) return {};
  const mb = file.size / (1024 * 1024);
  const sizeLabel = mb >= 0.1 ? `${mb.toFixed(mb < 10 ? 1 : 0)} МБ` : `${Math.round(file.size / 1024)} КБ`;
  return { attachedFiles: [{ name: file.name, sizeLabel }] };
}

export function buildCombinedSubmitSummary(text: string, file: File | null): PracticeSubmitSummary {
  return {
    ...buildTextSubmitSummary(text),
    ...buildFileSubmitSummary(file),
  };
}

export function buildUrlAnalysisSubmitSummary(
  report: { suspiciousSigns: string; risk: string; explanation: string; safeActions: string },
  rowsFilled: number,
  rowsTotal: number,
): PracticeSubmitSummary {
  const filled: string[] = [];
  if (report.suspiciousSigns.trim()) filled.push("Подозрительные признаки");
  if (report.risk.trim()) filled.push("Уровень риска");
  if (report.explanation.trim()) filled.push("Объяснение");
  if (report.safeActions.trim()) filled.push("Безопасные действия");
  if (rowsTotal > 0) filled.push(`Таблица ссылок: ${rowsFilled} / ${rowsTotal}`);
  return {
    filledFields: filled,
    textLength: report.explanation.trim().length || undefined,
  };
}

export function buildLogAnalysisSubmitSummary(
  fields: { suspiciousEvents: string; possibleCause: string; recommendation: string },
  conclusionLength: number,
): PracticeSubmitSummary {
  const filled: string[] = [];
  if (fields.suspiciousEvents.trim()) filled.push("Подозрительные события");
  if (fields.possibleCause) filled.push("Возможная причина");
  if (fields.recommendation.trim()) filled.push("Рекомендация");
  return { filledFields: filled, textLength: conclusionLength };
}

export function formatFileSizeLabel(bytes: number): string {
  const mb = bytes / (1024 * 1024);
  if (mb >= 0.1) return `${mb.toFixed(mb < 10 ? 1 : 0)} МБ`;
  return `${Math.round(bytes / 1024)} КБ`;
}

export function buildSituationSubmitSummary(filledCount: number, total: number): PracticeSubmitSummary {
  return { filledFields: [`Ситуации: ${filledCount} / ${total}`] };
}

export function buildPasswordRatingsSummary(ratedCount: number, total: number): PracticeSubmitSummary {
  return { filledFields: [`Пароли оценены: ${ratedCount} / ${total}`] };
}

export function buildLegacyAnswerSummary(answer: string): PracticeSubmitSummary {
  const t = answer.trim();
  return t ? { textLength: t.length, filledFields: ["Ответ по заданию"] } : {};
}

export function buildManualReportSummary(text: string): PracticeSubmitSummary {
  return buildTextSubmitSummary(text);
}
