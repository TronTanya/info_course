import type { CheckType, PracticalTaskType } from "@prisma/client";

export type PracticeGradingUiInput = {
  taskType: PracticalTaskType;
  checkType: CheckType;
  maxScore: number;
  minLength: number;
  hasInteractiveAutoCheck: boolean;
  hasStructuredCommandStep: boolean;
  hasStructuredExplanationStep: boolean;
  fileTypesLabel?: string | null;
  fileMaxMb?: number | null;
};

function checkTypeRu(c: CheckType): string {
  const m: Record<CheckType, string> = {
    AUTO: "Автопроверка",
    MANUAL: "Ручная проверка преподавателем",
    MIXED: "Смешанная проверка",
  };
  return m[c] ?? c;
}

function taskTypeRu(t: PracticalTaskType): string {
  const m: Partial<Record<PracticalTaskType, string>> = {
    TEXT_ANSWER: "Текстовый отчёт",
    FILE_UPLOAD: "Загрузка файла",
    INTERACTIVE: "Интерактивная консоль",
    COMBINED: "Текст и файл",
    SITUATION_CHOICE: "Выбор по ситуациям",
    PASSWORD_ANALYSIS: "Анализ паролей",
    PHISHING_ANALYSIS: "Разбор письма",
    CHECKLIST: "Чек-лист",
    URL_ANALYSIS: "Анализ ссылок",
    TRAINING_CONSOLE: "Учебная консоль",
    CRYPTO_TASK: "Криптография (учебно)",
    LOG_ANALYSIS: "Анализ журнала",
  };
  return m[t] ?? "Практическое задание";
}

/** Как оценивается работа — без эталонов и regex. */
export function buildPracticeGradingSummary(input: PracticeGradingUiInput): {
  headline: string;
  bullets: string[];
  scoreLine: string;
} {
  const bullets: string[] = [];
  bullets.push(`Формат: ${taskTypeRu(input.taskType)}.`);
  bullets.push(`Проверка: ${checkTypeRu(input.checkType)}.`);

  if (input.taskType === "TEXT_ANSWER" || input.taskType === "COMBINED") {
    bullets.push(`Текст отчёта: не короче ${input.minLength} символов.`);
  }
  if (input.taskType === "FILE_UPLOAD" || input.taskType === "COMBINED") {
    bullets.push(
      `Файл: ${input.fileTypesLabel ?? "разрешённые форматы"}, до ${input.fileMaxMb ?? 10} МБ.`,
    );
  }
  if (input.taskType === "INTERACTIVE" || input.taskType === "TRAINING_CONSOLE") {
    if (input.hasStructuredCommandStep) {
      bullets.push("В консоли нужно выполнить учебную команду — эталонная команда не показывается.");
    }
    if (input.hasStructuredExplanationStep) {
      bullets.push("После команды требуется краткое объяснение результата — проверка на сервере.");
    }
    if (!input.hasStructuredCommandStep && !input.hasStructuredExplanationStep) {
      bullets.push(
        input.hasInteractiveAutoCheck
          ? "Ответ проверяется автоматически на сервере по заданию."
          : "Ответ проверяется вручную по вашему описанию.",
      );
    }
  }
  if (
    input.taskType === "SITUATION_CHOICE" ||
    input.taskType === "PASSWORD_ANALYSIS" ||
    input.taskType === "PHISHING_ANALYSIS" ||
    input.taskType === "CHECKLIST" ||
    input.taskType === "URL_ANALYSIS" ||
    input.taskType === "CRYPTO_TASK" ||
    input.taskType === "LOG_ANALYSIS"
  ) {
    bullets.push("Ответы по сценарию проверяются на сервере; правильные варианты в интерфейсе не отображаются.");
  }

  bullets.push("Учебные демо-данные: без реальных атак и без доступа к продакшен-системам.");

  const scoreLine =
    input.maxScore > 0
      ? input.checkType === "MANUAL"
        ? `До ${input.maxScore} баллов — итог выставляет проверяющий.`
        : `До ${input.maxScore} баллов — итог после проверки на сервере.`
      : "Баллы для задания не настроены.";

  return {
    headline: "Как оценивается ответ",
    bullets,
    scoreLine,
  };
}
