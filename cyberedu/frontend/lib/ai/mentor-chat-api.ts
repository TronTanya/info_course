import { NextResponse } from "next/server";
import { z } from "zod";
import { AiNotConfiguredError, AiProviderError, isAiConfigured } from "@/lib/ai-config";
import { normalizeAIMentorMode } from "@/lib/ai/mentor-ui/mode-bridge";
import { stripForbiddenFromUnknown } from "@/lib/ai/mentor-ui/safe-context-mapper";
import type { TutorPipelineMeta } from "@/lib/ai/tutor/types";
import { AI_MENTOR_MODES } from "@/types/ai-mentor";
import { logError } from "@/lib/log/structured";
import { securityAudit } from "@/lib/security/audit";

/** Сообщение для UI, когда ключ AI не задан (ЭТАП 12). */
export const MENTOR_CHAT_UNAVAILABLE_USER_MESSAGE = "AI-наставник сейчас недоступен.";

/** Безопасный ответ, если поставщик AI недоступен (без stack trace в теле). */
export const MENTOR_CHAT_PROVIDER_FALLBACK_REPLY =
  "Сейчас не удаётся получить ответ от AI. Попробуйте через минуту или продолжите с материалами курса — наставник снова будет доступен позже.";

export const MENTOR_CHAT_GENERIC_ERROR_MESSAGE =
  "Не удалось получить ответ наставника. Попробуйте позже.";

const STACK_TRACE_PATTERN =
  /^\s*at\s+|node_modules\//i;

/** Убирает stack trace и технические детали из текста ошибки для клиента. */
export function toSafeClientErrorMessage(raw: string | undefined, fallback: string): string {
  const t = raw?.trim();
  if (!t || STACK_TRACE_PATTERN.test(t) || t.length > 500) return fallback;
  if (/Error:\s/.test(t) && t.length > 180) return fallback;
  return t;
}

export function normalizeMentorChatBodyJson(raw: unknown): unknown {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return raw;
  const o = raw as Record<string, unknown>;

  const rawContext = o.mentorContext ?? o.mentor_context ?? o.safeContext ?? o.safe_context;
  let mentorContext: Record<string, unknown> | undefined;
  if (rawContext && typeof rawContext === "object" && !Array.isArray(rawContext)) {
    mentorContext = stripForbiddenFromUnknown(rawContext).safe;
  }

  return {
    ...o,
    moduleId: o.moduleId ?? o.module_id,
    lessonId: o.lessonId ?? o.lesson_id,
    practicalTaskId: o.practicalTaskId ?? o.practical_task_id,
    practiceSocraticHints: o.practiceSocraticHints ?? o.practice_socratic_hints,
    mentorModeId: o.mentorModeId ?? o.mentor_mode_id ?? o.mode,
    testReviewHint: o.testReviewHint ?? o.test_review_hint,
    testDebriefTopics: o.testDebriefTopics ?? o.test_debrief_topics,
    mentorContext,
  };
}

const idOrNull = z
  .union([z.string().min(1), z.null()])
  .optional()
  .transform((v) => (v == null ? undefined : v));

export const mentorChatBodySchema = z.preprocess(
  normalizeMentorChatBodyJson,
  z.object({
    message: z.string().min(1).max(8000),
    moduleId: idOrNull,
    lessonId: idOrNull,
    practicalTaskId: idOrNull,
    practiceSocraticHints: z.boolean().optional(),
    mentorModeId: z
      .string()
      .optional()
      .transform((v) => normalizeAIMentorMode(v))
      .refine((v) => v === undefined || (AI_MENTOR_MODES as readonly string[]).includes(v), {
        message: "Unknown mentor mode",
      }),
    /** Канонический safeContext с клиента — сервер пересобирает из БД и снова фильтрует. */
    mentorContext: z.record(z.string(), z.unknown()).optional(),
    testReviewHint: z.string().max(400).optional(),
    testDebriefTopics: z.string().max(2_500).optional(),
    /** Игнорируется для LLM; история только на сервере. */
    history: z.array(z.unknown()).max(8).optional().default([]),
  }),
);

export type MentorChatBody = z.infer<typeof mentorChatBodySchema>;

export function mentorChatNotConfiguredResponse(): NextResponse {
  return NextResponse.json(
    { error: MENTOR_CHAT_UNAVAILABLE_USER_MESSAGE, code: "AI_NOT_CONFIGURED" },
    { status: 503 },
  );
}

export function mentorChatProviderFallbackResponse(meta?: {
  topic?: string;
  difficulty?: "beginner" | "intermediate" | "advanced";
}): NextResponse {
  return NextResponse.json({
    reply: MENTOR_CHAT_PROVIDER_FALLBACK_REPLY,
    meta: {
      topic: meta?.topic ?? "general",
      difficulty: meta?.difficulty ?? "beginner",
      recommendations: [],
      refused: false,
      providerUnavailable: true,
    },
  });
}

export type MentorChatRouteErrorContext = {
  userId: string;
  ip: string;
  path?: string;
};

/**
 * Безопасный JSON-ответ для /api/ai/chat — без stack trace, без логирования текста сообщения.
 */
export function handleMentorChatRouteError(
  e: unknown,
  ctx: MentorChatRouteErrorContext,
): NextResponse {
  if (e instanceof AiNotConfiguredError) {
    return mentorChatNotConfiguredResponse();
  }

  if (e instanceof AiProviderError) {
    securityAudit({
      event: "ai.tutor.provider_fallback",
      severity: "warn",
      actorId: ctx.userId,
      ip: ctx.ip,
      path: ctx.path ?? "/api/ai/chat",
    });
    return mentorChatProviderFallbackResponse();
  }

  logError("ai_chat_route_error", {
    path: ctx.path ?? "/api/ai/chat",
    actorId: ctx.userId,
    errorType: e instanceof Error ? e.name : "unknown",
    errorMessage: e instanceof Error ? e.message.slice(0, 120) : undefined,
  });

  securityAudit({
    event: "ai.tutor.unhandled_error",
    severity: "high",
    actorId: ctx.userId,
    ip: ctx.ip,
    path: ctx.path ?? "/api/ai/chat",
    meta: { errorType: e instanceof Error ? e.name : "unknown" },
  });

  return NextResponse.json({ error: MENTOR_CHAT_GENERIC_ERROR_MESSAGE, code: "INTERNAL_ERROR" }, { status: 500 });
}

export function auditMentorContextStripped(
  userId: string,
  strippedKeys: string[],
  ip?: string,
): void {
  if (strippedKeys.length === 0) return;
  const forbidden = strippedKeys.filter((k) =>
    /answer|solution|correct|rubric|scoring|key/i.test(k),
  );
  securityAudit({
    event: "ai.mentor.context_stripped",
    severity: forbidden.length > 0 ? "warn" : "info",
    actorId: userId,
    ip,
    path: "/api/ai/chat",
    meta: { keys: strippedKeys.slice(0, 16) },
  });
}

/** Проверка до тяжёлой работы с БД. */
export function assertMentorChatConfigured(): NextResponse | null {
  if (!isAiConfigured()) {
    return mentorChatNotConfiguredResponse();
  }
  return null;
}

/** Meta для клиента — без внутренних moderationNotes и служебных флагов. */
export function sanitizeTutorMetaForClient(meta: TutorPipelineMeta): TutorPipelineMeta {
  const publicMeta = { ...meta } as TutorPipelineMeta & {
    moderationNotes?: string;
    providerUnavailable?: boolean;
  };
  delete publicMeta.moderationNotes;
  return publicMeta;
}
