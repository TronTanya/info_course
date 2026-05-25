export type QuestionNavigatorItemStatus = "not_opened" | "opened" | "answered" | "current";

export type QuestionNavigatorCounts = {
  answered: number;
  skipped: number;
  opened: number;
  notOpened: number;
};

const STATUS_LABEL: Record<QuestionNavigatorItemStatus, string> = {
  not_opened: "не открыт",
  opened: "открыт",
  answered: "отвечен",
  current: "текущий",
};

export function questionNavigatorStatusLabel(status: QuestionNavigatorItemStatus): string {
  return STATUS_LABEL[status];
}

/** Приоритет: текущий → отвечен → открыт → не открыт. */
export function resolveQuestionNavigatorStatus(
  index: number,
  currentIndex: number,
  answeredFlags: boolean[],
  openedFlags: boolean[],
): QuestionNavigatorItemStatus {
  if (index === currentIndex) return "current";
  if (answeredFlags[index]) return "answered";
  if (openedFlags[index]) return "opened";
  return "not_opened";
}

export function buildQuestionNavigatorCounts(
  answeredFlags: boolean[],
  openedFlags: boolean[],
): QuestionNavigatorCounts {
  const total = answeredFlags.length;
  let answered = 0;
  let opened = 0;
  let notOpened = 0;

  for (let i = 0; i < total; i++) {
    if (answeredFlags[i]) {
      answered += 1;
      continue;
    }
    if (openedFlags[i]) opened += 1;
    else notOpened += 1;
  }

  const skipped = Math.max(0, total - answered);

  return { answered, skipped, opened, notOpened };
}

export function buildQuestionNavigatorAriaLabel(
  questionNumber: number,
  status: QuestionNavigatorItemStatus,
): string {
  const base = `Вопрос ${questionNumber}, ${questionNavigatorStatusLabel(status)}`;
  if (status === "current") return `${base}, на экране сейчас`;
  if (status === "answered") return `${base}, ответ дан`;
  if (status === "opened") return `${base}, без ответа`;
  return `${base}`;
}

/** Флаги «открыт» по множеству посещённых индексов (включая текущий). */
export function buildOpenedFlagsFromVisited(
  total: number,
  currentIndex: number,
  visitedIndices: Iterable<number>,
): boolean[] {
  const flags = Array.from({ length: total }, () => false);
  for (const i of visitedIndices) {
    if (i >= 0 && i < total) flags[i] = true;
  }
  if (currentIndex >= 0 && currentIndex < total) flags[currentIndex] = true;
  return flags;
}
