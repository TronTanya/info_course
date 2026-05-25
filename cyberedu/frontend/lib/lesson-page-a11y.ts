/** id единственного h1 на странице урока (`LessonHeader`). */
export const LESSON_PAGE_TITLE_ID = "lesson-page-title";

/** Основной landmark материала урока. */
export const LESSON_PAGE_MAIN_ID = "lesson-page-main";

/** Блок причины блокировки урока в шапке (для `aria-describedby`). */
export const LESSON_LOCKED_REASON_ID = "lesson-locked-reason";

/** id подписи прогресса чтения (`LessonReadingProgressBar`). */
export const LESSON_READING_PROGRESS_LABEL_ID = "lesson-reading-progress-label";

export function lessonNavLockReasonId(kind: string): string {
  return `lesson-nav-lock-${kind}`;
}

export function lessonCompletionLockedHintId(): string {
  return "lesson-completion-locked-hint";
}

export const LESSON_COMPLETION_TEST_HINT_ID = "lesson-completion-test-hint";

/** Текстовая метка тона ответа (не только цвет). */
export function checkpointReactionStatusLabel(tone: "positive" | "reflect"): string {
  return tone === "positive" ? "Верно" : "Почти";
}
