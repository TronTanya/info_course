import type { ClientTestQuestion } from "@/lib/test-grading";

export type TestLocalAnswers = {
  single: Record<string, string | null>;
  multi: Record<string, string[]>;
  text: Record<string, string>;
};

export function emptyTestLocalAnswers(questions: ClientTestQuestion[]): TestLocalAnswers {
  const single: Record<string, string | null> = {};
  const multi: Record<string, string[]> = {};
  const text: Record<string, string> = {};
  for (const q of questions) {
    if (q.questionType === "MULTIPLE_CHOICE" || q.questionType === "MATCHING") multi[q.id] = [];
    else if (q.questionType === "TEXT") text[q.id] = "";
    else single[q.id] = null;
  }
  return { single, multi, text };
}

export function isTestQuestionFilled(q: ClientTestQuestion, local: TestLocalAnswers): boolean {
  if (q.questionType === "MULTIPLE_CHOICE" || q.questionType === "MATCHING") {
    return (local.multi[q.id]?.length ?? 0) > 0;
  }
  if (q.questionType === "TEXT") return Boolean(local.text[q.id]?.trim());
  return Boolean(local.single[q.id]);
}

export function buildTestAnsweredFlags(
  questions: ClientTestQuestion[],
  local: TestLocalAnswers,
): boolean[] {
  return questions.map((q) => isTestQuestionFilled(q, local));
}

export function countTestAnswered(
  questions: ClientTestQuestion[],
  local: TestLocalAnswers,
): number {
  return buildTestAnsweredFlags(questions, local).filter(Boolean).length;
}

/** Ключ черновика: только sessionStorage, привязан к сессии вкладки. */
export function testDraftStorageKey(moduleId: string, testId: string): string {
  return `ce-test-draft:${moduleId}:${testId}`;
}

export function formatTestTimerDisplay(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
}

export function testTimeLimitSeconds(timeLimitMinutes: number | null | undefined): number | null {
  if (timeLimitMinutes == null || timeLimitMinutes <= 0) return null;
  return timeLimitMinutes * 60;
}
