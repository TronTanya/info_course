import type { TutorPipelineMeta } from "@/lib/ai/tutor/types";

export type MentorChatTurn = {
  id: string;
  role: "user" | "assistant";
  content: string;
  meta?: TutorPipelineMeta;
};

export type MentorContextLabels = {
  moduleTitle?: string;
  lessonTitle?: string;
  taskTitle?: string;
  /** Тема / фокус (например название модуля или урока). */
  topic?: string;
  /** Краткий итог теста для контекста (без правильных ответов). */
  testSummary?: string;
};

export type MentorContextKind = "lesson" | "practice" | "module" | "general";
