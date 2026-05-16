/**
 * Центральная серверная логика практики и прогресса модуля.
 * Завершение модуля и practice_completed выставляются только через {@link recalculateModuleProgress}.
 *
 * Имена в ТЗ (snake_case) → реализации:
 * - submit_practice → {@link persistPracticeSubmission}, вызывается из server actions / route handlers
 * - check_auto_practice → {@link checkAutoPracticeTextAnswer}, {@link resolveStructuredSubmission}
 * - update_practice_status → {@link updatePracticeStatusAfterAdminReview}
 * - recalculate_module_progress → {@link recalculateModuleProgress} (re-export)
 * - unlock_next_module → {@link unlockNextModule} (re-export)
 * - can_generate_certificate → {@link canGenerateCertificate} (re-export)
 */
import type { CheckType, SubmissionStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { canGenerateCertificate } from "@/lib/certificate";
import { recalculateModuleProgress, unlockNextModule } from "@/lib/progress";
import type { ScenarioVerifyOutcome } from "@/lib/practice-scenario-verify";
import { securityLog } from "@/lib/security-log";

export { recalculateModuleProgress, unlockNextModule, canGenerateCertificate };

export type AutoTextCheckResult = { ok: true; score: number } | { ok: false; error: string };

/** Автопроверка текстового ответа по regex (учебный шаблон). */
export function checkAutoPracticeTextAnswer(
  pattern: string | null | undefined,
  body: string,
  maxScore: number,
): AutoTextCheckResult {
  const p = pattern?.trim();
  if (!p) {
    return { ok: false, error: "Автопроверка не настроена (нет шаблона в задании). Обратитесь к администратору." };
  }
  if (p.length > 400) {
    return { ok: false, error: "Некорректная конфигурация проверки." };
  }
  try {
    if (!new RegExp(p, "i").test(body.trim())) {
      return { ok: false, error: "Ответ не проходит автоматическую проверку по критериям задания." };
    }
  } catch {
    return { ok: false, error: "Ошибка конфигурации проверки (шаблон)." };
  }
  return { ok: true, score: maxScore };
}

export type StructuredSavePlan =
  | { kind: "reject"; error: string }
  | {
      kind: "save";
      status: SubmissionStatus;
      score: number | null;
      /** true — авто-часть прошла, но итог только после администратора */
      pendingReview: boolean;
    };

/**
 * Как сохранить результат сценарной практики с учётом {@link CheckType}.
 * - AUTO: полный автозачёт только при decision "accept"; "submit" → на ручную доработку (частичная авто-проверка).
 * - MIXED: после успешной авто-части отправка на администратора (SUBMITTED).
 * - MANUAL: только SUBMITTED (проверка сценария всё равно отсекает явный мусор).
 */
export function resolveStructuredSubmission(checkType: CheckType, outcome: ScenarioVerifyOutcome, maxScore: number): StructuredSavePlan {
  if (outcome.decision === "reject") {
    return { kind: "reject", error: outcome.error };
  }

  switch (checkType) {
    case "AUTO":
      if (outcome.decision === "accept") {
        return { kind: "save", status: "ACCEPTED", score: maxScore, pendingReview: false };
      }
      return { kind: "save", status: "SUBMITTED", score: null, pendingReview: true };
    case "MIXED":
      return { kind: "save", status: "SUBMITTED", score: null, pendingReview: true };
    case "MANUAL":
    default:
      return { kind: "save", status: "SUBMITTED", score: null, pendingReview: false };
  }
}

export type TextAnswerSavePlan =
  | { kind: "reject"; error: string }
  | { kind: "save"; status: SubmissionStatus; score: number | null; pendingReview: boolean };

export function resolveTextAnswerSubmission(
  checkType: CheckType,
  body: string,
  maxScore: number,
  expectedAnswerPattern: string | null | undefined,
): TextAnswerSavePlan {
  switch (checkType) {
    case "MANUAL":
      return { kind: "save", status: "SUBMITTED", score: null, pendingReview: false };
    case "MIXED": {
      const r = checkAutoPracticeTextAnswer(expectedAnswerPattern, body, maxScore);
      if (!r.ok) return { kind: "reject", error: r.error };
      return { kind: "save", status: "SUBMITTED", score: null, pendingReview: true };
    }
    case "AUTO":
    default: {
      const r = checkAutoPracticeTextAnswer(expectedAnswerPattern, body, maxScore);
      if (!r.ok) return { kind: "reject", error: r.error };
      return { kind: "save", status: "ACCEPTED", score: r.score, pendingReview: false };
    }
  }
}

export type CombinedSavePlan =
  | { kind: "reject"; error: string }
  | { kind: "save"; status: SubmissionStatus; score: number | null; pendingReview: boolean };

/** Комбинированное задание: файл всегда на ручной осмотр, текст может фильтроваться автоматически. */
export function resolveCombinedSubmission(
  checkType: CheckType,
  textBody: string,
  maxScore: number,
  expectedAnswerPattern: string | null | undefined,
): CombinedSavePlan {
  switch (checkType) {
    case "MANUAL":
      return { kind: "save", status: "SUBMITTED", score: null, pendingReview: false };
    case "MIXED": {
      const r = checkAutoPracticeTextAnswer(expectedAnswerPattern, textBody, maxScore);
      if (!r.ok) return { kind: "reject", error: r.error };
      return { kind: "save", status: "SUBMITTED", score: null, pendingReview: true };
    }
    case "AUTO":
    default: {
      const r = checkAutoPracticeTextAnswer(expectedAnswerPattern, textBody, maxScore);
      if (!r.ok) return { kind: "reject", error: r.error };
      return { kind: "save", status: "ACCEPTED", score: r.score, pendingReview: false };
    }
  }
}

export type InteractiveAutoSave = { status: SubmissionStatus; score: number | null };

/** Учебная консоль: авто совпало — при MIXED всё равно на администратора. */
export function resolveInteractiveAutoResult(checkType: CheckType, maxScore: number): InteractiveAutoSave {
  switch (checkType) {
    case "AUTO":
      return { status: "ACCEPTED", score: maxScore };
    case "MIXED":
      return { status: "SUBMITTED", score: null };
    case "MANUAL":
    default:
      return { status: "SUBMITTED", score: null };
  }
}

export function resolveInlineApiPracticeSave(
  checkType: CheckType,
  autoGatePassed: boolean,
  awardedPoints: number,
): { save: false } | { save: true; status: SubmissionStatus; score: number } {
  if (!autoGatePassed) return { save: false };
  if (checkType === "AUTO") return { save: true, status: "ACCEPTED", score: awardedPoints };
  if (checkType === "MIXED") return { save: true, status: "SUBMITTED", score: awardedPoints };
  return { save: true, status: "SUBMITTED", score: awardedPoints };
}

/**
 * Сохраняет отправку и пересчитывает прогресс модуля (practice_completed, module_completed — только здесь/cascade).
 */
export async function persistPracticeSubmission(input: {
  userId: string;
  moduleId: string;
  practicalTaskId: string;
  textAnswer?: string | null;
  fileUrl?: string | null;
  status: SubmissionStatus;
  score?: number | null;
}): Promise<void> {
  await prisma.submission.create({
    data: {
      userId: input.userId,
      practicalTaskId: input.practicalTaskId,
      textAnswer: input.textAnswer ?? null,
      fileUrl: input.fileUrl ?? null,
      status: input.status,
      score: input.score ?? null,
      checkedAt: input.status === "ACCEPTED" ? new Date() : null,
    },
  });
  await recalculateModuleProgress(input.userId, input.moduleId);
}

/**
 * Обновление статуса после проверки администратором + пересчёт прогресса модуля.
 */
export async function updatePracticeStatusAfterAdminReview(input: {
  submissionId: string;
  reviewerUserId: string;
  studentUserId: string;
  moduleId: string;
  status: SubmissionStatus;
  score: number | null;
  adminComment: string | null;
}): Promise<void> {
  await prisma.submission.update({
    where: { id: input.submissionId },
    data: {
      status: input.status,
      score: input.score,
      adminComment: input.adminComment,
      checkedAt: new Date(),
    },
  });

  securityLog("admin.submission_review", {
    submissionId: input.submissionId,
    reviewerUserId: input.reviewerUserId,
    studentUserId: input.studentUserId,
    status: input.status,
  });

  await recalculateModuleProgress(input.studentUserId, input.moduleId);
}

/**
 * Явная карта имён из ТЗ → функции (все вызовы только с сервера).
 */
export const PracticeBackend = {
  submit_practice: persistPracticeSubmission,
  check_auto_practice_text: checkAutoPracticeTextAnswer,
  update_practice_status: updatePracticeStatusAfterAdminReview,
  recalculate_module_progress: recalculateModuleProgress,
  unlock_next_module: unlockNextModule,
  can_generate_certificate: canGenerateCertificate,
} as const;
