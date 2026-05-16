import type { CheckType, PracticalTaskType } from "@prisma/client";

/** Тематическая метка запроса (эвристика, без отдельного вызова LLM). */
export type TutorTopic =
  | "general"
  | "phishing_social"
  | "passwords_auth"
  | "malware_awareness"
  | "network_web"
  | "crypto_basics"
  | "logging_soc"
  | "practice_help"
  | "academic_integrity"
  | "offensive_request"
  | "prompt_injection";

export type TutorDifficulty = "beginner" | "intermediate" | "advanced";

export type TutorModerationStage = "input" | "injection" | "topic" | "output" | "fallback";

export type TutorRefusalCode =
  | "policy_blocked"
  | "offensive_attack"
  | "exam_spoiler"
  | "prompt_injection"
  | "provider_error"
  | "output_blocked";

export type TutorChatTurn = { role: "user" | "assistant"; content: string };

export type TutorPracticalContext = {
  title: string;
  description: string;
  taskTypeLabel: string;
  checkTypeLabel: string;
};

export type TutorPageContext = {
  moduleId?: string;
  moduleTitle: string;
  moduleOrder?: number;
  lessonTitle?: string;
  lessonExcerpt?: string;
  practicalTask?: TutorPracticalContext;
  interestsLine: string;
  specialtyLine: string;
};

/** Снимок прогресса ученика для адаптации и рекомендаций (без ПДн). */
export type LearnerMemorySnapshot = {
  completedModules: number;
  totalActiveModules: number;
  currentModuleProgress?: {
    lessonDone: boolean;
    videoDone: boolean;
    testDone: boolean;
    practiceDone: boolean;
  };
  recentTopics: TutorTopic[];
  difficulty: TutorDifficulty;
  /** Краткое резюме диалога (последние реплики). */
  conversationSummary: string;
};

export type TutorPipelineInput = {
  userId: string;
  userMessage: string;
  pageContext: TutorPageContext;
  history: TutorChatTurn[];
  practiceSocraticHints?: boolean;
  lessonId?: string;
  practicalTaskId?: string;
};

export type TutorPipelineMeta = {
  topic: TutorTopic;
  difficulty: TutorDifficulty;
  recommendations: string[];
  refused: boolean;
  refusalCode?: TutorRefusalCode;
  moderationNotes?: string[];
};

export type TutorPipelineResult = {
  reply: string;
  meta: TutorPipelineMeta;
};

export type TutorTaskType = PracticalTaskType;
export type TutorCheckType = CheckType;
