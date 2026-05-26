import type { LessonAiAction } from "@/lib/lesson-ai-meta";
import { AiNotConfiguredError, AiProviderError, getOpenAiApiBaseUrl, getOpenAiApiKey } from "@/lib/ai-config";

/** Режимы адаптации (API и ядро генерации). */
export type LessonAdaptMode = "simplify" | "adapt_to_interests" | "example" | "summary";

export type AdaptLessonParams = {
  lessonTitle: string;
  lessonContent: string;
  /** Только интересы (теги/текст), без ФИО и email */
  userInterests: string;
  /** Только специальность из профиля */
  userSpecialty: string;
  mode: LessonAdaptMode;
  /** Опционально: вопрос к ассистенту по материалу лекции */
  userQuestion?: string;
};

export type BuiltLessonPrompt = {
  system: string;
  user: string;
};

const MAX_LESSON_CHARS = 45_000;

/**
 * Системный промпт для адаптации лекции (не заменяет исходник; только дополнительное объяснение).
 * Согласован с требованиями платформы: защитный угол, без вредоносных инструкций и готовых ответов на задания.
 */
export const LESSON_ADAPT_TUTOR_SYSTEM_PROMPT = [
  "Ты учебный AI-наставник по информационной безопасности. Твоя задача — объяснять материал понятнее, но не искажать факты.",
  "Не давай вредоносных инструкций. Не выдавай готовые ответы на тесты и практические задания.",
  "Сохраняй важные термины. Пиши простым человеческим языком.",
  "Ответ на русском языке; допускается Markdown для структуры.",
].join("\n");

/** @deprecated Используйте LESSON_ADAPT_TUTOR_SYSTEM_PROMPT; оставлено для совместимости импортов. */
export const LESSON_AI_SYSTEM_GUARDRAILS = LESSON_ADAPT_TUTOR_SYSTEM_PROMPT;

const FORBIDDEN_SUBSTRINGS = [
  "пошаговый взлом",
  "обход защиты",
  "обойти защиту",
  "эксплойт",
  "payload",
  "reverse shell",
  "sql injection",
  "drop table",
  "ransomware",
  "троян",
  "кейлоггер",
  "готовый ответ на тест",
  "правильный вариант ответа:",
];

export function apiModeToLessonAiAction(mode: LessonAdaptMode): LessonAiAction {
  const map: Record<LessonAdaptMode, LessonAiAction> = {
    simplify: "simpler",
    adapt_to_interests: "adapt_interests",
    example: "example",
    summary: "summary",
  };
  return map[mode];
}

export function truncateLessonContent(content: string, max = MAX_LESSON_CHARS): string {
  if (content.length <= max) return content;
  return `${content.slice(0, max)}\n\n[…текст лекции сокращён для запроса к модели…]`;
}

/**
 * Собирает промпт для адаптации. Не включать ФИО, email, телефон и др. ПДн — только интересы и специальность.
 */
export function buildLessonAdaptationPrompt(params: AdaptLessonParams): BuiltLessonPrompt {
  const interests = params.userInterests.trim() || "не указаны";
  const specialty = params.userSpecialty.trim() || "не указана";
  const body = truncateLessonContent(params.lessonContent);

  const q = params.userQuestion?.trim();
  if (q) {
    return {
      system: LESSON_ADAPT_TUTOR_SYSTEM_PROMPT,
      user: [
        `Заголовок лекции: ${params.lessonTitle}`,
        `Специальность ученика (контекст): ${specialty}`,
        `Интересы ученика (контекст): ${interests}`,
        "",
        "Текст лекции (источник):",
        "```",
        body,
        "```",
        "",
        "Ответь на вопрос ученика по сути, опираясь только на лекцию и безопасные обобщения. Не решай за него тесты и практику.",
        "",
        `Вопрос: ${q}`,
      ].join("\n"),
    };
  }

  let task = "";
  switch (params.mode) {
    case "simplify":
      task = [
        "Объясни материал проще. Сохрани смысл. Разбей сложные предложения. Добавь короткие пояснения к терминам.",
        "Исходный текст лекции ниже — он главный; твой ответ дополняет его, а не подменяет.",
      ].join("\n");
      break;
    case "adapt_to_interests":
      task = [
        "Перепиши объяснение темы так, чтобы студенту было легче понять материал через его интересы.",
        `Используй интересы: ${interests}.`,
        "Не меняй смысл. Не удаляй ключевые определения. Добавь 1–2 аналогии, но не превращай текст в шутку. Стиль — понятный, спокойный, преподавательский.",
      ].join("\n");
      break;
    case "example":
      task = "Приведи 2–3 безопасных жизненных примера по теме. Без инструкций для атак и обхода защит.";
      break;
    case "summary":
      task = [
        "Сделай краткий конспект:",
        "- главная мысль",
        "- ключевые термины",
        "- что важно запомнить",
        "- типичная ошибка",
      ].join("\n");
      break;
    default:
      task = "Кратко перескажи материал лекции простым языком, сохраняя смысл.";
  }

  return {
    system: LESSON_ADAPT_TUTOR_SYSTEM_PROMPT,
    user: [
      `Заголовок лекции: ${params.lessonTitle}`,
      `Специальность ученика (контекст): ${specialty}`,
      `Интересы ученика (контекст): ${interests}`,
      "",
      task,
      "",
      "Текст лекции:",
      "```",
      body,
      "```",
    ].join("\n"),
  };
}

export type ValidateAiResponseResult =
  | { ok: true; text: string }
  | { ok: false; reason: string };

/**
 * Базовая проверка ответа модели: длина и запрет вредоносных/экзаменационных паттернов.
 */
export function validateAiResponse(response: string): ValidateAiResponseResult {
  const text = response.trim();
  if (text.length < 20) {
    return { ok: false, reason: "Ответ слишком короткий." };
  }
  if (text.length > 80_000) {
    return { ok: false, reason: "Ответ слишком длинный." };
  }
  const lower = text.toLowerCase();
  for (const p of FORBIDDEN_SUBSTRINGS) {
    if (lower.includes(p.toLowerCase())) {
      return { ok: false, reason: `Недопустимый фрагмент в ответе: «${p}».` };
    }
  }
  return { ok: true, text };
}

export type OpenAiChatMessage = { role: "system" | "user" | "assistant"; content: string };

/**
 * Вызов OpenAI-compatible Chat Completions. Первое сообщение с role system — по соглашению системный промпт.
 */
export async function callOpenAiChatCompletions(
  messages: OpenAiChatMessage[],
  opts?: { temperature?: number },
): Promise<string | null> {
  const key = getOpenAiApiKey();
  if (!key) return null;

  const base = getOpenAiApiBaseUrl();
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  const temperature = opts?.temperature ?? 0.5;

  try {
    const res = await fetch(`${base}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model,
        temperature,
        messages,
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.error("OpenAI error", res.status, errText.slice(0, 500));
      return null;
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const text = data.choices?.[0]?.message?.content;
    return typeof text === "string" && text.trim() ? text.trim() : null;
  } catch (e) {
    console.error("OpenAI fetch failed", e);
    return null;
  }
}

async function callOpenAiChat(built: BuiltLessonPrompt): Promise<string | null> {
  return callOpenAiChatCompletions(
    [
      { role: "system", content: built.system },
      { role: "user", content: built.user },
    ],
    { temperature: 0.5 },
  );
}

/**
 * Генерация адаптированного текста лекции: промпт → OpenAI-compatible API → валидация.
 * Без ключа — {@link AiNotConfiguredError}; при сбое API или отклонённом ответе — {@link AiProviderError}.
 */
export async function adaptLessonToInterests(params: AdaptLessonParams): Promise<string> {
  if (!getOpenAiApiKey()) {
    throw new AiNotConfiguredError();
  }

  const built = buildLessonAdaptationPrompt(params);
  const raw = await callOpenAiChat(built);
  if (!raw) {
    throw new AiProviderError("Модель не вернула текст. Проверьте OPENAI_API_BASE_URL, модель и лимиты.");
  }

  const validated = validateAiResponse(raw);
  if (!validated.ok) {
    throw new AiProviderError(`Ответ модели отклонён проверкой: ${validated.reason}`);
  }

  return validated.text;
}
