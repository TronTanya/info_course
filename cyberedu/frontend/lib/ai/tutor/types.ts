import type { CheckType, PracticalTaskType } from "@prisma/client";
import type { MentorSurface } from "@/lib/ai/mentor-ui/surfaces";
import type { AIMentorMode } from "@/types/ai-mentor";

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
  /** Краткий итог теста (процент, зачёт) — без правильных ответов. */
  testReviewHint?: string;
  /** Темы для повторения после теста (серверная обратная связь, без ключей). */
  testDebriefTopics?: string;
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
  mentorModeId?: AIMentorMode;
  mentorSurface?: MentorSurface;
};

export type TutorPipelineMeta = {
  topic: TutorTopic;
  difficulty: TutorDifficulty;
  recommendations: string[];
  refused: boolean;
  refusalCode?: TutorRefusalCode;
  /** Категория отказа для UX (choose_option, test_answer, …). */
  refusalKind?: import("@/lib/ai/safety/mentor-refusal-copy").MentorRefusalKind;
  moderationNotes?: string[];
};

export type TutorPipelineResult = {
  reply: string;
  meta: TutorPipelineMeta;
};

export type TutorTaskType = PracticalTaskType;
export type TutorCheckType = CheckType;
