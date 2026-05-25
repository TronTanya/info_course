import type { BreadcrumbItem } from "@/components/ui/breadcrumbs";
import { buildTestIntroDescription, formatTestAttemptHistory } from "@/lib/test-flow";
import { isTestAttemptsExhausted } from "@/lib/test-retry";
import { formatPassingScore, formatTestDuration } from "@/lib/test-ui";

export { isTestAttemptsExhausted } from "@/lib/test-retry";
export { TEST_ATTEMPTS_EXHAUSTED_MESSAGE, resolveTestCanRetry } from "@/lib/test-retry";

export type TestIntroScreenState =
  | "loading"
  | "error"
  | "locked"
  | "attempts_exhausted"
  | "already_passed"
  | "ready";

/** Хлебные крошки: Курс → Модуль → Тест */
export function testIntroBreadcrumbs(
  moduleId: string,
  moduleTitle: string,
  testTitle: string,
): BreadcrumbItem[] {
  return [
    { href: "/dashboard/course", label: "Курс" },
    { href: `/dashboard/course/${moduleId}`, label: moduleTitle },
    { label: testTitle },
  ];
}

export type TestIntroRulesInput = {
  /** Жёсткий лимит времени (мин). null — только ориентир по числу вопросов. */
  timeLimitMinutes: number | null;
  estimatedMinutes: number;
  /** Можно ли менять ответы после отправки на проверку (обычно false). */
  allowEditAfterSubmit: boolean;
};

/** Правила intro без спойлеров ответов. */
export function buildTestIntroRules(input: TestIntroRulesInput): string[] {
  const rules: string[] = [
    "Отвечайте самостоятельно — списывание и подсказки третьих лиц нарушают учебные правила.",
    "AI-наставник не выдаёт готовые ответы на тест и не подменяет проверку преподавателя.",
    "После отправки ответы проверяются на сервере; итог зачёта определяется только сервером.",
  ];

  if (input.timeLimitMinutes != null && input.timeLimitMinutes > 0) {
    rules.push(
      `На прохождение отведено ${formatTestDuration(input.timeLimitMinutes)} — по истечении времени отправка может быть недоступна.`,
    );
  } else if (input.estimatedMinutes > 0) {
    rules.push(
      `Ориентир по времени: ${formatTestDuration(input.estimatedMinutes)} (жёсткого лимита нет).`,
    );
  } else {
    rules.push("Жёсткого ограничения по времени нет — ориентируйтесь на внимательность, а не на скорость.");
  }

  if (input.allowEditAfterSubmit) {
    rules.push("После отправки можно вернуться к вопросам и изменить ответы до закрытия попытки.");
  } else {
    rules.push(
      "После отправки вернуться к вопросам и изменить ответы нельзя — проверьте все пункты перед подтверждением.",
    );
  }

  rules.push("Варианты ответов перемешиваются при каждом запуске; черновик сохраняется в этом браузере.");

  return rules;
}

export function formatTestAttemptsLine(attemptCount: number, maxAttempts: number | null | undefined): string | null {
  if (attemptCount <= 0 && (maxAttempts == null || maxAttempts <= 0)) return null;
  if (maxAttempts != null && maxAttempts > 0) {
    const left = Math.max(0, maxAttempts - attemptCount);
    if (left === 0) return `Попытки исчерпаны (${attemptCount} из ${maxAttempts})`;
    return `Попыток использовано: ${attemptCount} из ${maxAttempts} · осталось ${left}`;
  }
  return formatTestAttemptHistory(attemptCount);
}

export function resolveTestIntroState(args: {
  state?: TestIntroScreenState;
  locked?: boolean;
  lockReason?: string;
  attemptCount: number;
  maxAttempts?: number | null;
  lastPassed: boolean;
}): TestIntroScreenState {
  if (args.state && args.state !== "ready") return args.state;
  if (args.locked) return "locked";
  if (isTestAttemptsExhausted(args.attemptCount, args.maxAttempts)) return "attempts_exhausted";
  if (args.lastPassed) return "already_passed";
  return "ready";
}

export function buildTestIntroDescriptionText(input: {
  moduleTitle: string;
  moduleDescription?: string | null;
  questionCount: number;
  testDescription?: string | null;
}): string {
  const fromTest = input.testDescription?.trim();
  if (fromTest) {
    const one = fromTest.replace(/\s+/g, " ").trim();
    return one.length <= 320 ? one : `${one.slice(0, 317).trim()}…`;
  }
  return buildTestIntroDescription({
    moduleTitle: input.moduleTitle,
    moduleDescription: input.moduleDescription,
    questionCount: input.questionCount,
  });
}

export { formatPassingScore, formatTestDuration };
