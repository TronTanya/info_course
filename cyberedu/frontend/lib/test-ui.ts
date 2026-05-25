import type { QuestionType } from "@prisma/client";
import { moduleDifficultyByOrder } from "@/lib/course-path-ui";
import type { ClientTestQuestion } from "@/lib/test-grading";

export type TestCardStatus = "not_started" | "failed" | "passed" | "in_progress";

const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  SINGLE_CHOICE: "Один вариант",
  MULTIPLE_CHOICE: "Несколько вариантов",
  TRUE_FALSE: "Верно / неверно",
  TEXT: "Текст",
  SITUATION: "Ситуация",
  MATCHING: "Сопоставление",
};

export function questionTypeLabel(type: QuestionType): string {
  return QUESTION_TYPE_LABELS[type] ?? String(type);
}

/** Сводка типов вопросов для экрана перед тестом. */
export function countQuestionsByType(questions: Pick<ClientTestQuestion, "questionType">[]): {
  type: QuestionType;
  label: string;
  count: number;
}[] {
  const map = new Map<QuestionType, number>();
  for (const q of questions) {
    map.set(q.questionType, (map.get(q.questionType) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([type, count]) => ({ type, label: questionTypeLabel(type), count }))
    .sort((a, b) => b.count - a.count);
}

export function formatRemainingQuestions(answered: number, total: number): string {
  const left = Math.max(0, total - answered);
  if (left === 0) return "Все вопросы заполнены";
  if (left === 1) return "Остался 1 вопрос без ответа";
  if (left < 5) return `Осталось ${left} вопроса без ответа`;
  return `Осталось ${left} вопросов без ответа`;
}

export function estimateTestMinutes(questionCount: number): number {
  if (questionCount <= 0) return 0;
  return Math.max(5, Math.ceil(questionCount * 1.5));
}

export function formatTestDuration(minutes: number): string {
  if (minutes < 60) return `~${minutes} мин`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `~${h} ч ${m} мин` : `~${h} ч`;
}

export function testDifficultyLabel(moduleOrderNumber: number): string {
  return moduleDifficultyByOrder(moduleOrderNumber);
}

export function getTestCardStatus(last: { passed: boolean } | null): TestCardStatus {
  if (!last) return "not_started";
  return last.passed ? "passed" : "failed";
}

/** Сумма баллов по автоматически оцениваемым вопросам. */
export function computeTestMaxScore(
  questions: { points: number; manualTextGrading?: boolean }[],
): number {
  return questions.reduce((sum, q) => sum + (q.manualTextGrading ? 0 : q.points), 0);
}

export function formatPassingScore(minScore: number, maxScore: number): string {
  if (maxScore <= 0) return `${minScore} б.`;
  const pct = Math.round((minScore / maxScore) * 100);
  return `${minScore} из ${maxScore} б. (${pct}%)`;
}

/** Правила на экране перед началом (без спойлеров ответов). */
export const testSessionRules = [
  "Отвечайте на все вопросы — отправка доступна только при полном заполнении.",
  "Варианты ответов перемешиваются при каждом запуске (порядок не подсказывает правильный ответ).",
  "Можно переключаться между вопросами; черновик сохраняется в этом браузере.",
  "Проверка и зачёт выполняются на сервере; пояснения и темы для повторения — только после отправки.",
] as const;

export const testAfterSubmitSteps = [
  "Ответы проверяются на сервере — изменить их после отправки нельзя.",
  "Результат и разбор ошибок появятся сразу на этой странице.",
  "При успешной сдаче откроется практика модуля; прогресс обновится в карте курса.",
] as const;

export const testKeyboardHints = "Стрелки ← → — между вопросами · цифры 1–9 — выбор варианта";

export const testStatusMeta: Record<
  TestCardStatus,
  { label: string; className: string }
> = {
  not_started: { label: "Не начат", className: "border-border text-muted-foreground bg-muted/30" },
  in_progress: { label: "В процессе", className: "border-primary/35 bg-primary/12 text-primary" },
  failed: { label: "Не пройден", className: "border-danger/35 bg-danger/12 text-danger" },
  passed: { label: "Пройден", className: "border-success/35 bg-success/12 text-success" },
};
