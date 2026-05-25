/**
 * UI-модели практического задания модуля.
 *
 * Намеренно отсутствуют: solution, answerKey, regex/эталоны автопроверки,
 * скрытая рубрика, admin-only notes, внутренние скрипты оценки,
 * приватные пути хранения, сырые секреты пользователя.
 */

import type { PracticeNextStepsPanel as PracticeNextStepsPanelType } from "@/lib/practice-next-step-ui";

export type PracticeViewStatus =
  | "not_started"
  | "in_progress"
  | "submitted"
  | "pending_review"
  | "approved"
  | "needs_retry"
  | "rejected"
  | "locked";

export type PracticeDifficulty = "easy" | "medium" | "hard";

export type PracticeNextStepType = "lesson" | "test" | "practice" | "course" | "certificate";

export type PracticeNextStep = {
  title: string;
  href: string;
  type: PracticeNextStepType;
};

export type {
  PracticeNextStepAction,
  PracticeNextStepActionKind,
  PracticeNextStepsPanel,
} from "@/lib/practice-next-step-ui";

export type PracticeScenario = {
  role?: string;
  context: string;
  goal: string;
};

export type EvidenceItemType =
  | "email"
  | "url"
  | "log"
  | "text"
  | "file"
  | "image"
  | "table"
  | "code";

export type EvidenceAttachmentMeta = {
  name: string;
  size?: string;
  mimeType?: string;
};

export type EvidenceLogEntry = {
  timestamp?: string;
  source?: string;
  event?: string;
  severity?: string;
  raw: string;
};

export type EvidenceTableRow = {
  feature: string;
  note: string;
};

export type EvidenceUrlDisplay = {
  fullUrl: string;
  protocol: string;
  domain: string;
  path: string;
  visibleText?: string;
};

export type EvidenceItem = {
  id: string;
  type: EvidenceItemType;
  title: string;
  content?: string;
  metadata?: Record<string, string>;
  fileName?: string;
  /** Только публичный API-путь скачивания, не путь на диске. */
  fileUrl?: string;
  /** email */
  links?: string[];
  attachments?: EvidenceAttachmentMeta[];
  /** log */
  logEntries?: EvidenceLogEntry[];
  /** url */
  urlDisplay?: EvidenceUrlDisplay;
  /** table */
  tableHeaders?: [string, string];
  tableRows?: EvidenceTableRow[];
};

export type PracticeInstruction = {
  id: string;
  text: string;
};

export type SafeRubricCriterionKind =
  | "analysis"
  | "reasoning"
  | "indicators"
  | "safety"
  | "presentation"
  | "general";

export type SafeRubricItem = {
  id: string;
  title: string;
  description?: string;
  points?: number;
  kind?: SafeRubricCriterionKind;
};

export type PracticeHint = {
  id: string;
  level: 1 | 2 | 3;
  title: string;
  content: string;
};

export type PracticeSubmissionView = {
  id: string;
  status: PracticeViewStatus;
  submittedAt?: string;
  feedback?: string;
  score?: number;
  maxScore?: number;
  canEdit?: boolean;
};

export type PracticeViewModel = {
  id: string;
  title: string;
  description?: string;
  moduleId: string;
  moduleTitle: string;
  difficulty?: PracticeDifficulty;
  estimatedMinutes?: number;
  skill?: string;
  status: PracticeViewStatus;
  lockedReason?: string;
  scenario?: PracticeScenario;
  evidenceItems: EvidenceItem[];
  instructions: PracticeInstruction[];
  safeRubric: SafeRubricItem[];
  hints: PracticeHint[];
  submission?: PracticeSubmissionView;
  canSubmit: boolean;
  canRetry: boolean;
  nextStep?: PracticeNextStep;
  /** Панель CTA по статусу (approved, pending, revision, locked). */
  nextStepsPanel?: PracticeNextStepsPanelType;
  relatedLessons?: PracticeNextStep[];
};

/** Поля, которые нельзя добавлять в UI-модель практики (регрессионный контракт). */
export const PRACTICE_VIEW_MODEL_FORBIDDEN_KEYS = [
  "solution",
  "solutionText",
  "answerKey",
  "correctFlagIds",
  "requiredIds",
  "reflectionPattern",
  "autoKeywords",
  "explanationPattern",
  "expected",
  "expectedCommand",
  "expectedAnswerPattern",
  "interactiveExpectedAnswer",
  "gradingRubric",
  "hiddenRubric",
  "rawScoringRules",
  "scoringRules",
  "adminNotes",
  "internalNotes",
  "graderNotes",
  "privateStoragePath",
  "storagePath",
  "filePath",
  "userSecret",
  "rawUserSecrets",
] as const;
