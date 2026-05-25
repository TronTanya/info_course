/** Контейнер вертикальной прокрутки на странице лекции (см. globals `.ce-lesson-page-active`). */
export const LESSON_SCROLL_ROOT_ID = "main-content";

export function getLessonScrollRoot(): HTMLElement | null {
  if (typeof document === "undefined") return null;
  return document.getElementById(LESSON_SCROLL_ROOT_ID);
}
