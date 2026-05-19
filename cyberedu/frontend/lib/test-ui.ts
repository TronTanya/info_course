import { moduleDifficultyByOrder } from "@/lib/course-path-ui";

export type TestCardStatus = "not_started" | "failed" | "passed" | "in_progress";

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

export const testAfterSubmitSteps = [
  "Ответы проверяются на сервере — изменить их после отправки нельзя.",
  "Результат и разбор ошибок появятся сразу на этой странице.",
  "При успешной сдаче откроется практика модуля; прогресс обновится в карте курса.",
] as const;

export const testStatusMeta: Record<
  TestCardStatus,
  { label: string; className: string }
> = {
  not_started: { label: "Не начат", className: "border-border text-muted-foreground bg-muted/30" },
  in_progress: { label: "В процессе", className: "border-primary/35 bg-primary/12 text-primary" },
  failed: { label: "Не пройден", className: "border-danger/35 bg-danger/12 text-danger" },
  passed: { label: "Пройден", className: "border-success/35 bg-success/12 text-success" },
};
