import type { TutorPipelineMeta } from "@/lib/ai/tutor/types";
import type {
  AIMentorContext,
  AIMentorMessage,
  AIMentorMode,
  AIMentorResponse,
  AIMentorSourceType,
} from "@/types/ai-mentor";

export type {
  AIMentorContext,
  AIMentorMessage,
  AIMentorMode,
  AIMentorResponse,
  AIMentorSourceType,
};

/** @deprecated Используйте AIMentorMessage */
export type MentorChatTurn = {
  id: string;
  role: "user" | "assistant";
  content: string;
  meta?: TutorPipelineMeta;
  createdAt?: string;
  mode?: AIMentorMode;
};

/** UI-подписи контекста (без excerpt и draft). */
export type MentorContextLabels = {
  moduleTitle?: string;
  lessonTitle?: string;
  taskTitle?: string;
  topic?: string;
  testSummary?: string;
};

/** @deprecated Используйте AIMentorSourceType через sourceTypeToMentorContextKind */
export type MentorContextKind = "lesson" | "practice" | "test" | "module" | "general";
