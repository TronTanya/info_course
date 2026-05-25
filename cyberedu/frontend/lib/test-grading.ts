import type { Answer, Question, QuestionType } from "@prisma/client";

export type ClientTestAnswerOption = { id: string; answerText: string };

export type ClientTestQuestion = {
  id: string;
  questionText: string;
  questionType: QuestionType;
  points: number;
  orderNumber: number;
  answers: ClientTestAnswerOption[];
  /** Только подпись в UI; правильный ответ не передаётся. */
  manualTextGrading?: boolean;
};

export type SubmittedAnswerPayload =
  | { questionId: string; kind: "single"; answerId: string | null }
  | { questionId: string; kind: "multi"; answerIds: string[] }
  | { questionId: string; kind: "text"; text: string };

export type GradedAnswerRow = {
  questionId: string;
  answerId: string | null;
  textAnswer: string | null;
  isCorrect: boolean | null;
  pointsEarned: number;
};

function normalizeText(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

function setsEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const sa = [...a].sort();
  const sb = [...b].sort();
  return sa.every((v, i) => v === sb[i]);
}

/** Учитывается в сумме баллов попытки (ручные TEXT исключаются до внедрения проверки). */
export function questionCountsTowardAutoScore(q: {
  questionType: QuestionType;
  textManualGrading: boolean;
}): boolean {
  if (q.questionType === "TEXT" && q.textManualGrading) return false;
  return true;
}

export function gradeQuestion(
  q: Question & { answers: Answer[] },
  submission: SubmittedAnswerPayload | undefined,
): { pointsEarned: number; rows: GradedAnswerRow[] } {
  const max = q.points;
  const answers = q.answers;
  const correctIds = answers.filter((a) => a.isCorrect).map((a) => a.id);

  if (!submission || submission.questionId !== q.id) {
    return {
      pointsEarned: 0,
      rows: [{ questionId: q.id, answerId: null, textAnswer: null, isCorrect: false, pointsEarned: 0 }],
    };
  }

  switch (q.questionType) {
    case "SINGLE_CHOICE":
    case "TRUE_FALSE":
    case "SITUATION": {
      const aid = submission.kind === "single" ? submission.answerId : null;
      if (!aid) {
        return {
          pointsEarned: 0,
          rows: [{ questionId: q.id, answerId: null, textAnswer: null, isCorrect: false, pointsEarned: 0 }],
        };
      }
      const picked = answers.find((a) => a.id === aid);
      const ok = Boolean(picked?.isCorrect);
      const pts = ok ? max : 0;
      return {
        pointsEarned: pts,
        rows: [{ questionId: q.id, answerId: aid, textAnswer: null, isCorrect: ok, pointsEarned: pts }],
      };
    }
    case "MULTIPLE_CHOICE":
    case "MATCHING": {
      const ids = submission.kind === "multi" ? submission.answerIds : [];
      const uniq = [...new Set(ids)].filter((id) => answers.some((a) => a.id === id));
      const ok = setsEqual(uniq, correctIds);
      const pts = ok ? max : 0;
      const stored = JSON.stringify({ v: 1 as const, multi: uniq });
      return {
        pointsEarned: pts,
        rows: [
          {
            questionId: q.id,
            answerId: uniq[0] ?? null,
            textAnswer: stored,
            isCorrect: ok,
            pointsEarned: pts,
          },
        ],
      };
    }
    case "TEXT": {
      const text = submission.kind === "text" ? submission.text.trim() : "";
      if (!text) {
        return {
          pointsEarned: 0,
          rows: [{ questionId: q.id, answerId: null, textAnswer: null, isCorrect: false, pointsEarned: 0 }],
        };
      }
      if (q.textManualGrading) {
        return {
          pointsEarned: 0,
          rows: [
            {
              questionId: q.id,
              answerId: null,
              textAnswer: text.slice(0, 8000),
              isCorrect: null,
              pointsEarned: 0,
            },
          ],
        };
      }
      const expected = q.textExpectedAnswer?.trim();
      if (expected) {
        const ok = normalizeText(text) === normalizeText(expected);
        const pts = ok ? max : 0;
        return {
          pointsEarned: pts,
          rows: [
            {
              questionId: q.id,
              answerId: null,
              textAnswer: text.slice(0, 8000),
              isCorrect: ok,
              pointsEarned: pts,
            },
          ],
        };
      }
      const correctTexts = answers.filter((a) => a.isCorrect).map((a) => normalizeText(a.answerText));
      const ok = correctTexts.some((t) => t.length > 0 && normalizeText(text) === t);
      const pts = ok ? max : 0;
      return {
        pointsEarned: pts,
        rows: [
          {
            questionId: q.id,
            answerId: null,
            textAnswer: text.slice(0, 8000),
            isCorrect: ok,
            pointsEarned: pts,
          },
        ],
      };
    }
    default:
      return {
        pointsEarned: 0,
        rows: [{ questionId: q.id, answerId: null, textAnswer: null, isCorrect: false, pointsEarned: 0 }],
      };
  }
}

export function buildSubmittedMap(list: SubmittedAnswerPayload[]): Map<string, SubmittedAnswerPayload> {
  const m = new Map<string, SubmittedAnswerPayload>();
  for (const s of list) m.set(s.questionId, s);
  return m;
}

/** Проверка формата и принадлежности выбранных id к вопросу (не оценка правильности). */
export function validateSubmissionForQuestion(
  q: Question & { answers: Answer[] },
  submission: SubmittedAnswerPayload | undefined,
): { ok: true } | { ok: false; error: string } {
  if (!submission || submission.questionId !== q.id) {
    return { ok: false, error: "Некорректный формат ответов." };
  }

  const validAnswerIds = new Set(q.answers.map((a) => a.id));

  switch (q.questionType) {
    case "SINGLE_CHOICE":
    case "TRUE_FALSE":
    case "SITUATION": {
      if (submission.kind !== "single") return { ok: false, error: "Некорректный формат ответов." };
      if (!submission.answerId || !validAnswerIds.has(submission.answerId)) {
        return { ok: false, error: "Некорректный выбор варианта ответа." };
      }
      return { ok: true };
    }
    case "MULTIPLE_CHOICE":
    case "MATCHING": {
      if (submission.kind !== "multi") return { ok: false, error: "Некорректный формат ответов." };
      const uniq = [...new Set(submission.answerIds)];
      if (uniq.length === 0) return { ok: false, error: "Ответьте на все вопросы." };
      if (uniq.some((id) => !validAnswerIds.has(id))) {
        return { ok: false, error: "Некорректный выбор варианта ответа." };
      }
      return { ok: true };
    }
    case "TEXT": {
      if (submission.kind !== "text") return { ok: false, error: "Некорректный формат ответов." };
      const text = submission.text.trim();
      if (!text) return { ok: false, error: "Ответьте на все вопросы." };
      if (text.length > 8000) return { ok: false, error: "Слишком длинный текстовый ответ." };
      return { ok: true };
    }
    default:
      return { ok: false, error: "Некорректный формат ответов." };
  }
}

/** Расчёт итога попытки (без записи в БД). Используется в server action и в тестах. */
export function calculateTestScore(args: {
  questions: (Question & { answers: Answer[] })[];
  answers: SubmittedAnswerPayload[];
  minScore: number;
}): { score: number; maxScore: number; passed: boolean; percent: number } {
  const byId = buildSubmittedMap(args.answers);
  let score = 0;
  for (const q of args.questions) {
    const sub = byId.get(q.id);
    const g = gradeQuestion(q, sub);
    if (questionCountsTowardAutoScore(q)) {
      score += g.pointsEarned;
    }
  }
  const maxScore = args.questions.filter(questionCountsTowardAutoScore).reduce((s, q) => s + q.points, 0);
  const passed = maxScore > 0 ? score >= args.minScore : false;
  const percent = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  return { score, maxScore, passed, percent };
}
