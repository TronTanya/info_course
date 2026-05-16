import type { SubmissionStatus } from "@prisma/client";

const REVIEW_STATUSES = new Set<SubmissionStatus>(["ACCEPTED", "REJECTED", "NEEDS_REVISION"]);

/**
 * Разбор поля «балл» при проверке практики админом.
 * При ACCEPTED балл обязателен и не может превышать maxScore задания.
 */
export function parseReviewSubmissionScore(
  status: SubmissionStatus,
  scoreRaw: string,
  maxScore: number,
): { ok: true; score: number | null } | { ok: false; error: string } {
  if (!REVIEW_STATUSES.has(status)) {
    return { ok: false, error: "Недопустимый статус проверки." };
  }

  let score: number | null = null;
  const trimmed = scoreRaw.trim();

  if (status === "ACCEPTED") {
    if (trimmed === "") {
      return { ok: false, error: "Для статуса «Принято» укажите балл." };
    }
    const s = Number.parseInt(trimmed, 10);
    if (Number.isNaN(s) || s < 0 || s > maxScore) {
      return { ok: false, error: `Балл должен быть числом от 0 до ${maxScore} (максимум задания).` };
    }
    score = s;
  } else if (trimmed !== "") {
    const s = Number.parseInt(trimmed, 10);
    if (!Number.isNaN(s) && s >= 0 && s <= maxScore) score = s;
  }

  return { ok: true, score };
}
