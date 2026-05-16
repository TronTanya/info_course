import type { CheckType, PracticalTaskType } from "@prisma/client";
import { callOpenAiChatCompletions, truncateLessonContent, type OpenAiChatMessage } from "@/lib/ai";
import { AiNotConfiguredError, AiProviderError, getOpenAiApiKey } from "@/lib/ai-config";
import { assertSafeTutorUserMessage } from "@/lib/ai-content-policy";

const MAX_LESSON_EXCERPT = 14_000;
const MAX_TASK_DESC = 6_000;

/** Системный промпт наставника: помощник, не решатель; только защитная сторона ИБ. */
export const TUTOR_CHAT_SYSTEM_PROMPT = [
  "Ты AI-наставник по информационной безопасности. Ты помогаешь студенту учиться, но не выполняешь задания за него.",
  "Если студент просит готовый ответ, не давай его. Вместо этого задай наводящий вопрос, объясни подход или предложи шаг для размышления.",
  "В темах кибербезопасности объясняй только безопасную и защитную сторону.",
  "Не генерируй вредоносный код и не давай инструкции по взлому.",
  "Отвечай на русском языке; допускается Markdown для структуры.",
  "",
  "Пример: на вопрос «Как выполнить это задание?» отвечай в духе: «Давай разберём по шагам. Что в задании нужно определить: угрозу, ошибку пользователя или безопасное действие? Какие элементы кажутся тебе подозрительными?»",
].join("\n");

export type TutorPracticalContext = {
  title: string;
  description: string;
  taskTypeLabel: string;
  checkTypeLabel: string;
};

export type TutorPageContext = {
  moduleTitle: string;
  lessonTitle?: string;
  /** Усечённый текст лекции; без данных тестов */
  lessonExcerpt?: string;
  practicalTask?: TutorPracticalContext;
  interestsLine: string;
  specialtyLine: string;
};

export function practicalTaskTypeLabel(t: PracticalTaskType): string {
  const map: Record<PracticalTaskType, string> = {
    INTERACTIVE: "интерактивное задание",
    FILE_UPLOAD: "загрузка файла",
    TEXT_ANSWER: "текстовый ответ",
    COMBINED: "комбинированное задание",
    SITUATION_CHOICE: "ситуации и выбор",
    PASSWORD_ANALYSIS: "анализ паролей",
    PHISHING_ANALYSIS: "разбор фишинга",
    CHECKLIST: "чек-лист",
    URL_ANALYSIS: "анализ ссылок",
    TRAINING_CONSOLE: "учебная консоль",
    CRYPTO_TASK: "криптография (учебно)",
    LOG_ANALYSIS: "анализ журнала",
  };
  return map[t] ?? String(t);
}

export function checkTypeLabel(c: CheckType): string {
  const map: Record<CheckType, string> = {
    AUTO: "автоматическая проверка",
    MANUAL: "ручная проверка",
    MIXED: "смешанная проверка",
  };
  return map[c] ?? String(c);
}

export function buildTutorContextUserBlock(ctx: TutorPageContext): string {
  const parts: string[] = [
    "### Контекст страницы (только учебные материалы, без персональных данных)",
    `Модуль: ${ctx.moduleTitle.trim() || "не указан"}`,
  ];

  if (ctx.lessonTitle?.trim()) {
    parts.push(`Лекция: ${ctx.lessonTitle.trim()}`);
    if (ctx.lessonExcerpt?.trim()) {
      parts.push("", "Фрагмент лекции:", "```", truncateLessonContent(ctx.lessonExcerpt.trim(), MAX_LESSON_EXCERPT), "```");
    }
  }

  if (ctx.practicalTask) {
    const pt = ctx.practicalTask;
    parts.push(
      "",
      "### Практическое задание",
      `Название: ${pt.title}`,
      `Тип задания: ${pt.taskTypeLabel}`,
      `Тип проверки: ${pt.checkTypeLabel}`,
      "",
      "Формулировка задания (без «правильного ответа» из тестов — его здесь нет):",
      "```",
      truncateLessonContent(pt.description.trim(), MAX_TASK_DESC),
      "```",
    );
  }

  parts.push(
    "",
    "Важно: в контексте нет правильных ответов на тесты, эталонов практики и административных данных — только учебные формулировки.",
    `Интересы ученика (для стиля и аналогий): ${ctx.interestsLine}`,
    `Специальность (контекст): ${ctx.specialtyLine}`,
  );

  return parts.join("\n");
}

export type TutorChatHistoryItem = { role: "user" | "assistant"; content: string };

/** Дополнительные инструкции к системному промпту (например, режим сократических подсказок к практике). */
export const TUTOR_PRACTICE_SOCRATIC_EXTRA = [
  "### Режим «подсказка к практике»",
  "Ученик явно запросил наводку по практическому заданию.",
  "Не выдавай готовое решение, не перечисляй правильный ответ и не раскрывай эталон построчно.",
  "Ответь только наводящими вопросами (обычно 1–3 коротких вопроса), которые помогают самому дойти до вывода.",
  "Можно предложить безопасный учебный шаг («что проверить в первую очередь», «какой признак сравнить»), но без спойлеров.",
].join("\n");

export type RunTutorChatParams = {
  userMessage: string;
  pageContext: TutorPageContext;
  /** Последние реплики диалога (без текущего сообщения) */
  history: TutorChatHistoryItem[];
  /** Добавляется к системному промпту (например, TUTOR_PRACTICE_SOCRATIC_EXTRA). */
  systemPromptExtra?: string;
};

/**
 * Собирает сообщения для Chat Completions: системный промпт и один user с контекстом, встроенной историей и новым вопросом.
 */
export function buildTutorChatMessages(params: RunTutorChatParams): OpenAiChatMessage[] {
  const contextBlock = buildTutorContextUserBlock(params.pageContext);
  const trimmed = params.userMessage.trim();

  const dialogLines: string[] = [];
  for (const h of params.history) {
    const c = h.content.trim();
    if (!c) continue;
    dialogLines.push(h.role === "user" ? `Ученик: ${c}` : `Наставник: ${c}`);
  }
  const dialogSection =
    dialogLines.length > 0 ? ["### Диалог ранее", "", ...dialogLines].join("\n") : "";

  const userPayload = [contextBlock, "", dialogSection, "", "### Новое сообщение ученика", trimmed]
    .filter((s) => s.length > 0)
    .join("\n");

  const systemContent = [TUTOR_CHAT_SYSTEM_PROMPT, params.systemPromptExtra?.trim()].filter(Boolean).join("\n\n");

  return [
    { role: "system", content: systemContent },
    { role: "user", content: userPayload },
  ];
}

export type ValidateTutorChatResponseResult = { ok: true; text: string } | { ok: false; reason: string };

/** Мягкая проверка ответа наставника: длина (без жёсткого списка «запрещённых» слов учебной лексики). */
export function validateTutorChatResponse(response: string): ValidateTutorChatResponseResult {
  const text = response.trim();
  if (text.length < 8) {
    return { ok: false, reason: "Ответ слишком короткий." };
  }
  if (text.length > 80_000) {
    return { ok: false, reason: "Ответ слишком длинный." };
  }
  return { ok: true, text };
}

export async function runTutorChat(params: RunTutorChatParams): Promise<string> {
  const gate = assertSafeTutorUserMessage(params.userMessage);
  if (!gate.ok) {
    return "Этот запрос я не могу обсуждать в учебном чате. Сформулируйте вопрос по материалам курса или по защите информации в легальном контексте.";
  }

  if (!getOpenAiApiKey()) {
    throw new AiNotConfiguredError();
  }

  const messages = buildTutorChatMessages(params);
  const raw = await callOpenAiChatCompletions(messages, { temperature: 0.55 });
  if (!raw) {
    throw new AiProviderError();
  }

  const validated = validateTutorChatResponse(raw);
  if (!validated.ok) {
    throw new AiProviderError(`Ответ модели отклонён проверкой: ${validated.reason}`);
  }

  return validated.text;
}
