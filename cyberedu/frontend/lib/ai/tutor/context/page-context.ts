import { truncateLessonContent } from "@/lib/ai";
import type { CheckType, PracticalTaskType } from "@prisma/client";
import type { TutorPageContext, TutorPracticalContext } from "@/lib/ai/tutor/types";

const MAX_LESSON_EXCERPT = 14_000;
const MAX_TASK_DESC = 6_000;

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

export function buildPageContextBlock(ctx: TutorPageContext): string {
  const parts: string[] = [
    "### Контекст страницы (учебные материалы, без ПДн и без ответов тестов)",
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
      `Тип: ${pt.taskTypeLabel}`,
      `Проверка: ${pt.checkTypeLabel}`,
      "",
      "Формулировка (без эталона):",
      "```",
      truncateLessonContent(pt.description.trim(), MAX_TASK_DESC),
      "```",
    );
  }

  parts.push(
    "",
    `Интересы (для аналогий): ${ctx.interestsLine}`,
    `Специальность: ${ctx.specialtyLine}`,
  );

  return parts.join("\n");
}

export function buildDialogBlock(history: { role: "user" | "assistant"; content: string }[]): string {
  const lines: string[] = [];
  for (const h of history) {
    const c = h.content.trim();
    if (!c) continue;
    lines.push(h.role === "user" ? `Ученик: ${c}` : `Наставник: ${c}`);
  }
  if (!lines.length) return "";
  return ["### Диалог ранее", "", ...lines].join("\n");
}

export function toPracticalContext(row: {
  title: string;
  description: string;
  taskType: PracticalTaskType;
  checkType: CheckType;
}): TutorPracticalContext {
  return {
    title: row.title,
    description: row.description,
    taskTypeLabel: practicalTaskTypeLabel(row.taskType),
    checkTypeLabel: checkTypeLabel(row.checkType),
  };
}
