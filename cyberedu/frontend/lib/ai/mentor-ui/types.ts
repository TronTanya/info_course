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
};

export type MentorContextKind = "lesson" | "practice" | "module" | "general";
