import type { MentorModeId } from "@/lib/ai/mentor-ui/modes";
import {
  isUnsafeMentorErrorMessage,
  mentorChatErrorMessage,
  resolveMentorChatErrorKind,
  type MentorErrorKind,
} from "@/lib/ai/mentor-ui/chat-state";
import type { MentorContextLabels } from "@/lib/ai/mentor-ui/types";
import type { TutorPipelineMeta } from "@/lib/ai/tutor/types";
import type { AIMentorContextInput } from "@/types/ai-mentor";

export { AI_MENTOR_RATE_LIMIT_MESSAGE } from "@/lib/security/rate-limit-messages";
export {
  isUnsafeMentorErrorMessage,
  mentorChatErrorMessage,
  resolveMentorChatErrorKind,
  type MentorErrorKind,
};

/** Совпадает с лимитом Zod в POST /api/ai/chat */
export const MENTOR_MAX_PROMPT_LENGTH = 8_000;

export const MENTOR_GUARDRAIL_NOTE =
  "AI помогает учиться, но не выполняет задания за вас.";

export type MentorChatRequest = {
  message: string;
  moduleId?: string | null;
  lessonId?: string | null;
  practicalTaskId?: string | null;
  practiceSocraticHints?: boolean;
  mentorModeId?: MentorModeId | null;
  testReviewHint?: string;
  testDebriefTopics?: string;
};

export type MentorChatApiSuccess = {
  ok: true;
  reply: string;
  meta?: TutorPipelineMeta;
};

export type MentorChatApiFailure = {
  ok: false;
  status: number;
  error: string;
  code?: string;
};

export type MentorChatApiResult = MentorChatApiSuccess | MentorChatApiFailure;

export function buildMentorChatBody(
  req: MentorChatRequest,
  labels: MentorContextLabels,
  mentorContext?: AIMentorContextInput | null,
): Record<string, unknown> {
  const body: Record<string, unknown> = {
    message: req.message.slice(0, MENTOR_MAX_PROMPT_LENGTH),
    module_id: req.moduleId ?? null,
    lesson_id: req.lessonId ?? null,
    practical_task_id: req.practicalTaskId ?? null,
    practice_socratic_hints: req.practiceSocraticHints ?? false,
    mentor_mode_id: req.mentorModeId ?? undefined,
    test_review_hint: labels.testSummary?.trim() || undefined,
    test_debrief_topics: req.testDebriefTopics?.trim() || undefined,
  };
  if (mentorContext && Object.keys(mentorContext).length > 0) {
    body.mentor_context = mentorContext;
  }
  return body;
}

/**
 * POST /api/ai/chat — без логирования текста сообщения.
 */
export async function postMentorChat(body: Record<string, unknown>): Promise<MentorChatApiResult> {
  try {
    const res = await fetch("/api/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    let data: {
      reply?: string;
      error?: string;
      code?: string;
      meta?: TutorPipelineMeta;
    } = {};
    try {
      data = (await res.json()) as typeof data;
    } catch {
      data = {};
    }

    if (!res.ok) {
      const code = data.code ?? (res.status === 429 ? "RATE_LIMITED" : undefined);
      return {
        ok: false,
        status: res.status,
        error: data.error ?? `request_failed_${res.status}`,
        code,
      };
    }

    const reply = data.reply?.trim();
    if (!reply) {
      return {
        ok: false,
        status: res.status || 500,
        error: "empty_reply",
        code: data.code,
      };
    }

    return { ok: true, reply, meta: data.meta };
  } catch {
    return {
      ok: false,
      status: 0,
      error: "network",
      code: undefined,
    };
  }
}

/** Безопасный текст ошибки для баннера (без stack / env / provider). */
export function resolveMentorChatFailureMessage(failure: MentorChatApiFailure): {
  kind: MentorErrorKind;
  message: string;
} {
  const kind = resolveMentorChatErrorKind(failure.status || undefined, failure.code);
  const raw = failure.error?.trim();
  const safeRaw =
    raw && raw !== "network" && raw !== "rate_limit" && !isUnsafeMentorErrorMessage(raw)
      ? raw
      : undefined;
  return { kind, message: mentorChatErrorMessage(kind, safeRaw) };
}
