import { MENTOR_CHAT_UNAVAILABLE_USER_MESSAGE } from "@/lib/ai/mentor-chat-api";
import { AI_MENTOR_RATE_LIMIT_MESSAGE } from "@/lib/security/rate-limit-messages";
import type { TutorPipelineMeta } from "@/lib/ai/tutor/types";
import {
  MENTOR_DISABLED_CONTENT_LOCKED,
  MENTOR_DISABLED_ENV_OFF,
  MENTOR_DISABLED_NO_API_KEY,
  MENTOR_DISABLED_UNAUTHORIZED,
  MENTOR_ERROR_MODERATION,
  MENTOR_ERROR_NETWORK,
  MENTOR_ERROR_PROVIDER,
  MENTOR_ERROR_SERVER,
  MENTOR_ERROR_UNAUTHORIZED,
} from "@/lib/ai/mentor-ui/constants";
import { isMentorRefusalMessage } from "@/lib/ai/mentor-ui/refusal-ui";

/** Фазы панели чата (ЭТАП 16). */
export type MentorPanelPhase = "loading" | "empty" | "error" | "disabled" | "active";

export type MentorDisabledReason = "env_off" | "no_api_key" | "unauthorized" | "content_locked";

export type MentorErrorKind =
  | "network"
  | "server"
  | "rate_limit"
  | "config"
  | "unauthorized"
  | "moderation"
  | "provider"
  | "generic";

export type MentorDisabledCopy = {
  title: string;
  description: string;
};

const DISABLED_COPY: Record<MentorDisabledReason, MentorDisabledCopy> = {
  env_off: {
    title: "AI-наставник отключён",
    description: MENTOR_DISABLED_ENV_OFF,
  },
  no_api_key: {
    title: "AI-наставник недоступен",
    description: MENTOR_DISABLED_NO_API_KEY,
  },
  unauthorized: {
    title: "Нужен вход в аккаунт",
    description: MENTOR_DISABLED_UNAUTHORIZED,
  },
  content_locked: {
    title: "Раздел ещё закрыт",
    description: MENTOR_DISABLED_CONTENT_LOCKED,
  },
};

export function getMentorDisabledCopy(
  reason: MentorDisabledReason,
  hint?: string | null,
): MentorDisabledCopy {
  const base = DISABLED_COPY[reason];
  const extra = hint?.trim();
  if (!extra || extra === base.description) return base;
  return { title: base.title, description: extra };
}

export function resolveMentorChatErrorKind(status?: number, code?: string): MentorErrorKind {
  if (code === "AI_NOT_CONFIGURED" || status === 503) return "config";
  if (status === 401 || code === "UNAUTHORIZED") return "unauthorized";
  if (status === 429 || code === "RATE_LIMITED") return "rate_limit";
  if (code === "AI_PROVIDER_ERROR" || code === "PROVIDER_UNAVAILABLE") return "provider";
  if (code === "OUTPUT_BLOCKED" || code === "MODERATION_BLOCKED") return "moderation";
  if (status === 502 || status === 500) return "server";
  if (status === 0 || status === undefined) return "network";
  return "generic";
}

const UNSAFE_ERROR_PATTERNS: RegExp[] = [
  /^\s*at\s+/m,
  /node_modules\//i,
  /process\.env/i,
  /\bOPENAI_/i,
  /\bAI_API_KEY\b/i,
  /ECONNREFUSED/i,
  /ETIMEDOUT/i,
  /fetch failed/i,
  /AiProviderError/i,
  /AiNotConfiguredError/i,
  /Error:\s[\s\S]+/,
];

/** Скрывает stack trace, env и тексты провайдера из UI. */
export function isUnsafeMentorErrorMessage(text: string): boolean {
  const t = text.trim();
  if (!t) return true;
  if (t.length > 280) return true;
  return UNSAFE_ERROR_PATTERNS.some((re) => re.test(t));
}

export function mentorChatErrorMessage(kind: MentorErrorKind, serverMessage?: string): string {
  if (kind === "rate_limit") return AI_MENTOR_RATE_LIMIT_MESSAGE;
  if (kind === "config") return MENTOR_CHAT_UNAVAILABLE_USER_MESSAGE;
  if (kind === "unauthorized") return MENTOR_ERROR_UNAUTHORIZED;
  if (kind === "network") return MENTOR_ERROR_NETWORK;
  if (kind === "provider") return MENTOR_ERROR_PROVIDER;
  if (kind === "moderation") return MENTOR_ERROR_MODERATION;
  if (kind === "server") return MENTOR_ERROR_SERVER;
  const m = serverMessage?.trim();
  if (m && !isUnsafeMentorErrorMessage(m)) return m;
  return "Не удалось отправить сообщение. Попробуйте ещё раз.";
}

export type ResolveMentorPanelPhaseInput = {
  chatEnabled: boolean;
  disabledReason?: MentorDisabledReason | null;
  loading: boolean;
  error: string | null;
  messageCount: number;
};

export function resolveMentorPanelPhase(input: ResolveMentorPanelPhaseInput): MentorPanelPhase {
  if (input.disabledReason || !input.chatEnabled) return "disabled";
  if (input.loading) return "loading";
  if (input.error) return "error";
  if (input.messageCount === 0) return "empty";
  return "active";
}

export function shouldShowMentorEmptyState(phase: MentorPanelPhase): boolean {
  return phase === "empty";
}

export function shouldShowMentorErrorBanner(phase: MentorPanelPhase): boolean {
  return phase === "error";
}

export function shouldShowMentorDisabledState(phase: MentorPanelPhase): boolean {
  return phase === "disabled";
}

export function isMentorSafetyRefusalTurn(meta?: TutorPipelineMeta): boolean {
  return isMentorRefusalMessage(meta);
}
