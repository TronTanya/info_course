import type { CheckType, PracticalTaskType, SubmissionStatus } from "@prisma/client";
import { moduleDifficultyByOrder } from "@/lib/course-path-ui";
import { COURSE_PROGRESS_USER_MESSAGES } from "@/lib/course-progress-guards";
import type { ProgressGate } from "@/lib/course-progress-guards";
import { buildSafeRubricPreviewItems } from "@/lib/safe-rubric-mapper";
import { estimatePracticeMinutes } from "@/lib/practice-lab-ui";
import type { PracticePageLearningContext } from "@/lib/practice-next-learning-step";
import { buildPracticeNextLearningStep } from "@/lib/practice-next-learning-step";
import {
  buildPracticeNextStepsPanel,
  primaryPracticeNextStepFromPanel,
} from "@/lib/practice-next-step-ui";
import { mapPracticeEvidenceBlocksToItems } from "@/lib/evidence-panel-map";
import { parsePracticeScenario } from "@/lib/practice-scenario-parse";
import { buildSafePracticeHints } from "@/lib/practice-hints";
import { splitPracticeInstructionText } from "@/lib/practice-task-instructions-ui";
import type {
  EvidenceItem,
  PracticeDifficulty,
  PracticeHint,
  PracticeInstruction,
  PracticeNextStep,
  PracticeNextStepType,
  PracticeScenario,
  PracticeSubmissionView,
  PracticeViewModel,
  PracticeViewStatus,
  SafeRubricItem,
} from "@/types/practice-view-model";
import { PRACTICE_VIEW_MODEL_FORBIDDEN_KEYS } from "@/types/practice-view-model";

export type PracticeViewSubmissionSource = {
  id: string;
  status: SubmissionStatus;
  score: number | null;
  adminComment: string | null;
  createdAt: string;
  fileDownloadUrl: string | null;
};

export type BuildPracticeViewModelInput = {
  task: {
    id: string;
    title: string;
    description: string;
    taskType: PracticalTaskType;
    checkType: CheckType;
    maxScore: number;
    minLength: number;
    instruction: string | null;
    consoleScenario: string | null;
    scenarioData: unknown | null;
    hasInteractiveAutoCheck: boolean;
    hasStructuredCommandStep: boolean;
    hasStructuredExplanationStep: boolean;
    fileTypesLabel?: string | null;
    fileMaxMb?: number | null;
  };
  moduleId: string;
  moduleTitle: string;
  moduleOrderNumber: number;
  practiceGate: ProgressGate;
  latestSubmission: PracticeViewSubmissionSource | null;
  practiceCompleted?: boolean;
  hasTextDraft?: boolean;
  learning?: PracticePageLearningContext;
};

function moduleDifficultyBand(orderNumber: number): PracticeDifficulty {
  const band = moduleDifficultyByOrder(orderNumber);
  if (band === "Начальный") return "easy";
  if (band === "Продвинутый" || band === "Экспертный") return "hard";
  return "medium";
}

function skillLabel(taskType: PracticalTaskType, moduleTitle: string): string {
  const byType: Partial<Record<PracticalTaskType, string>> = {
    PHISHING_ANALYSIS: "Распознавание фишинга",
    URL_ANALYSIS: "Анализ URL",
    LOG_ANALYSIS: "Разбор журналов",
    CRYPTO_TASK: "Основы криптографии",
    TRAINING_CONSOLE: "Учебная консоль",
    INTERACTIVE: "Интерактивная лаборатория",
    PASSWORD_ANALYSIS: "Политика паролей",
    SITUATION_CHOICE: "Ситуационный анализ",
    CHECKLIST: "Чек-лист безопасности",
    FILE_UPLOAD: "Документирование",
    COMBINED: "Комплексный отчёт",
    TEXT_ANSWER: "Письменный отчёт",
  };
  return byType[taskType] ?? `Практика · ${moduleTitle}`;
}

export function resolvePracticeViewStatus(input: {
  gateOk: boolean;
  practiceCompleted?: boolean;
  submissionStatus?: SubmissionStatus | null;
  hasTextDraft?: boolean;
}): PracticeViewStatus {
  if (!input.gateOk) return "locked";
  if (input.practiceCompleted) return "approved";
  const s = input.submissionStatus;
  if (!s || s === "DRAFT") {
    return input.hasTextDraft ? "in_progress" : "not_started";
  }
  if (s === "ACCEPTED") return "approved";
  if (s === "SUBMITTED") return "submitted";
  if (s === "CHECKING") return "pending_review";
  if (s === "REJECTED") return "rejected";
  if (s === "NEEDS_REVISION") return "needs_retry";
  return "not_started";
}

function lockedReasonFromGate(gate: ProgressGate): string | undefined {
  if (gate.ok) return undefined;
  return gate.message?.trim() || COURSE_PROGRESS_USER_MESSAGES.TEST_FIRST;
}

function scenarioContext(description: string, inputData: string | null): string {
  const fromInput = inputData?.trim();
  if (fromInput) return fromInput.slice(0, 1200);
  const para = description
    .split(/\n\n+/)
    .map((s) => s.trim())
    .find(Boolean);
  return (para ?? description.trim()).slice(0, 1200) || "Учебный сценарий модуля.";
}

function buildScenario(
  description: string,
  instruction: string | null,
  consoleScenario: string | null,
  scenarioData: unknown,
  taskType: PracticalTaskType,
): PracticeScenario | undefined {
  const parsed = parsePracticeScenario(description, instruction, consoleScenario, scenarioData, taskType);
  const goal = parsed.taskBrief?.trim();
  if (!goal) return undefined;
  return {
    role: parsed.studentRole?.trim() || undefined,
    context: scenarioContext(description, parsed.inputData),
    goal,
  };
}

function buildEvidenceItems(
  description: string,
  instruction: string | null,
  consoleScenario: string | null,
  scenarioData: unknown,
  taskType: PracticalTaskType,
): EvidenceItem[] {
  const parsed = parsePracticeScenario(description, instruction, consoleScenario, scenarioData, taskType);
  return mapPracticeEvidenceBlocksToItems(parsed.evidence);
}

function buildInstructions(instruction: string | null): PracticeInstruction[] {
  const extra = instruction?.trim();
  if (!extra) return [];
  const parts = splitPracticeInstructionText(extra);
  return parts.map((text, i) => ({ id: `instr-${i + 1}`, text }));
}

function buildSafeRubric(
  scenarioData: unknown | null,
  taskType: PracticalTaskType,
  maxScore: number,
): SafeRubricItem[] {
  return buildSafeRubricPreviewItems({ scenarioData, taskType, maxScore });
}

function buildHints(scenarioData: unknown): PracticeHint[] {
  return buildSafePracticeHints(scenarioData);
}

function submissionFeedbackAllowed(status: SubmissionStatus): boolean {
  return status === "ACCEPTED" || status === "REJECTED" || status === "NEEDS_REVISION";
}

function mapSubmission(
  sub: PracticeViewSubmissionSource,
  viewStatus: PracticeViewStatus,
  maxScore: number,
  canRetry: boolean,
): PracticeSubmissionView {
  const showFeedback = submissionFeedbackAllowed(sub.status) && Boolean(sub.adminComment?.trim());
  const canEdit =
    canRetry && (viewStatus === "needs_retry" || viewStatus === "rejected");
  return {
    id: sub.id,
    status: viewStatus,
    submittedAt: sub.createdAt,
    feedback: showFeedback ? sub.adminComment!.trim() : undefined,
    score: sub.score ?? undefined,
    maxScore: maxScore > 0 ? maxScore : undefined,
    canEdit,
  };
}

function nextStepTypeFromHref(href: string): PracticeNextStepType {
  if (href.includes("/certificate")) return "certificate";
  if (href.includes("/practice")) return "practice";
  if (href.includes("/test")) return "test";
  if (href.includes("/lesson")) return "lesson";
  return "course";
}

function panelCtaToNextStep(cta: { label: string; href: string }): PracticeNextStep {
  return {
    title: cta.label,
    href: cta.href,
    type: nextStepTypeFromHref(cta.href),
  };
}

function buildNextStep(
  learning: PracticePageLearningContext | undefined,
  practiceAccepted: boolean,
  stepsPanel: ReturnType<typeof buildPracticeNextStepsPanel>,
): PracticeNextStep | undefined {
  const fromPanel = primaryPracticeNextStepFromPanel(stepsPanel);
  if (fromPanel) {
    return { title: fromPanel.title, href: fromPanel.href, type: fromPanel.type };
  }
  if (!learning || !practiceAccepted) return undefined;
  const panel = buildPracticeNextLearningStep(learning, true);
  if (!panel) return undefined;
  return panelCtaToNextStep(panel.primaryCta);
}

function buildRelatedLessons(learning?: PracticePageLearningContext): PracticeNextStep[] | undefined {
  if (!learning?.lessonHref) return undefined;
  return [
    {
      title: `Материал модуля · ${learning.moduleTitle}`,
      href: learning.lessonHref,
      type: "lesson",
    },
    {
      title: "Контрольный тест",
      href: learning.testHref,
      type: "test",
    },
  ];
}

export function buildPracticeViewModel(input: BuildPracticeViewModelInput): PracticeViewModel {
  const gateOk = input.practiceGate.ok;
  const sub = input.latestSubmission;
  const status = resolvePracticeViewStatus({
    gateOk,
    practiceCompleted: input.practiceCompleted,
    submissionStatus: sub?.status,
    hasTextDraft: input.hasTextDraft,
  });

  const scenario = gateOk
    ? buildScenario(
        input.task.description,
        input.task.instruction,
        input.task.consoleScenario,
        input.task.scenarioData,
        input.task.taskType,
      )
    : undefined;

  const pending =
    status === "submitted" || status === "pending_review";
  const canRetry =
    gateOk && (status === "needs_retry" || status === "rejected");
  const canSubmit =
    gateOk &&
    !pending &&
    status !== "approved" &&
    status !== "locked" &&
    (status === "not_started" ||
      status === "in_progress" ||
      ((status === "needs_retry" || status === "rejected") && canRetry));

  const practiceAccepted = status === "approved" || Boolean(input.practiceCompleted);

  const nextStepsPanel = buildPracticeNextStepsPanel({
    status,
    learning: input.learning,
    practiceGate: input.practiceGate,
    canRetry,
  });

  const description = input.task.description.trim() || undefined;

  return {
    id: input.task.id,
    title: input.task.title,
    description,
    moduleId: input.moduleId,
    moduleTitle: input.moduleTitle,
    difficulty: moduleDifficultyBand(input.moduleOrderNumber),
    estimatedMinutes: estimatePracticeMinutes(input.task.taskType, input.task.maxScore),
    skill: skillLabel(input.task.taskType, input.moduleTitle),
    status,
    lockedReason: gateOk ? undefined : lockedReasonFromGate(input.practiceGate),
    scenario,
    evidenceItems: gateOk
      ? buildEvidenceItems(
          input.task.description,
          input.task.instruction,
          input.task.consoleScenario,
          input.task.scenarioData,
          input.task.taskType,
        )
      : [],
    instructions: gateOk ? buildInstructions(input.task.instruction) : [],
    safeRubric: gateOk
      ? buildSafeRubric(input.task.scenarioData, input.task.taskType, input.task.maxScore)
      : [],
    hints: gateOk ? buildHints(input.task.scenarioData) : [],
    submission:
      sub && status !== "not_started" && status !== "locked"
        ? mapSubmission(sub, status, input.task.maxScore, canRetry)
        : undefined,
    canSubmit,
    canRetry,
    nextStep: buildNextStep(input.learning, practiceAccepted, nextStepsPanel),
    nextStepsPanel: nextStepsPanel ?? undefined,
    relatedLessons: buildRelatedLessons(input.learning),
  };
}

/** Рекурсивно проверяет отсутствие запрещённых ключей (для тестов). */
export function collectForbiddenPracticeKeys(value: unknown, found = new Set<string>()): Set<string> {
  if (value == null || typeof value !== "object") return found;
  if (Array.isArray(value)) {
    for (const item of value) collectForbiddenPracticeKeys(item, found);
    return found;
  }
  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    if ((PRACTICE_VIEW_MODEL_FORBIDDEN_KEYS as readonly string[]).includes(key)) {
      found.add(key);
    }
    collectForbiddenPracticeKeys(child, found);
  }
  return found;
}

export function assertCleanPracticeViewPayload(value: unknown): void {
  const bad = [...collectForbiddenPracticeKeys(value)];
  if (bad.length > 0) {
    throw new Error(`Forbidden practice view model keys: ${bad.join(", ")}`);
  }
}
