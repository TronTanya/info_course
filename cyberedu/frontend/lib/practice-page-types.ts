import type { CheckType, PracticalTaskType, SubmissionStatus } from "@prisma/client";
import type { PracticeViewModel } from "@/types/practice-view-model";

export type {
  EvidenceItem,
  EvidenceItemType,
  PracticeDifficulty,
  PracticeHint,
  PracticeInstruction,
  PracticeNextStep,
  PracticeNextStepAction,
  PracticeNextStepType,
  PracticeNextStepsPanel,
  PracticeScenario,
  PracticeSubmissionView,
  PracticeViewModel,
  PracticeViewStatus,
  SafeRubricItem,
} from "@/types/practice-view-model";

export { PRACTICE_VIEW_MODEL_FORBIDDEN_KEYS } from "@/types/practice-view-model";

export type ClientSubmission = {
  id: string;
  status: SubmissionStatus;
  textAnswer: string | null;
  fileDownloadUrl: string | null;
  score: number | null;
  adminComment: string | null;
  createdAt: string;
} | null;

/** Поля сессии отправки (не входят в PracticeViewModel). */
export type PracticeTaskRuntime = {
  id: string;
  title: string;
  description: string;
  taskType: PracticalTaskType;
  checkType: CheckType;
  maxScore: number;
  minLength: number;
  instruction: string | null;
  consoleScenario: string | null;
  fileAccept: string | null;
  fileTypesLabel: string | null;
  fileMaxMb: number | null;
  hasInteractiveAutoCheck: boolean;
  hasStructuredCommandStep: boolean;
  hasStructuredExplanationStep: boolean;
  interactiveMode: "structured" | "legacy" | "manual";
  scenarioData: unknown | null;
  latestSubmission: ClientSubmission;
  attemptCount: number;
};

/** @deprecated Используйте PracticePageTask (view + runtime). */
export type ClientPracticalTask = PracticeTaskRuntime;

export type PracticePageTask = {
  view: PracticeViewModel;
  runtime: PracticeTaskRuntime;
};

export type PracticeLabModuleContext = {
  courseTitle: string;
  moduleOrderNumber: number;
  moduleTitle: string;
  moduleProgress: { percent: number; completed: number; total: number };
};
