import { isSafeExternalHttpsUrl } from "@/lib/security/sanitize";

/** Единая точка: ключи AI и понятные ошибки без «фейковых» ответов модели. */

export const AI_KEY_NOT_CONFIGURED_MESSAGE =
  "AI-ключ не настроен. На сервере задайте OPENAI_API_KEY или AI_API_KEY (при необходимости OPENAI_API_BASE_URL и OPENAI_MODEL).";

/** OpenAI-совместимый ключ: поддерживаются оба имени переменной. */
export function getOpenAiApiKey(): string | undefined {
  const k = process.env.OPENAI_API_KEY?.trim() || process.env.AI_API_KEY?.trim();
  return k || undefined;
}

export function isAiConfigured(): boolean {
  return Boolean(getOpenAiApiKey());
}

const DEFAULT_OPENAI_BASE = "https://api.openai.com/v1";

/** OpenAI-compatible API base URL; блокирует private/metadata hosts (SSRF). */
export function getOpenAiApiBaseUrl(): string {
  const raw = (process.env.OPENAI_API_BASE_URL?.trim() || DEFAULT_OPENAI_BASE).replace(/\/$/, "");
  const probe = raw.includes("://") ? raw : `https://${raw}`;
  if (!isSafeExternalHttpsUrl(probe)) {
    throw new Error(
      "OPENAI_API_BASE_URL must be a public HTTPS endpoint (no localhost, private IP, or metadata hosts).",
    );
  }
  return raw;
}

export class AiNotConfiguredError extends Error {
  readonly code = "AI_NOT_CONFIGURED" as const;
  constructor(message: string = AI_KEY_NOT_CONFIGURED_MESSAGE) {
    super(message);
    this.name = "AiNotConfiguredError";
  }
}

export class AiProviderError extends Error {
  readonly code = "AI_PROVIDER_ERROR" as const;
  constructor(message = "Не удалось получить ответ от поставщика AI. Проверьте ключ, лимиты и адрес API.") {
    super(message);
    this.name = "AiProviderError";
  }
}
