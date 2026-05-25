/** Максимальная ширина колонки учебного текста (читаемость). */
export const LESSON_READING_MAX_WIDTH = "42rem";

export type LessonContentWidth = "reading" | "wide";

/** Корневая колонка статьи в `LessonStructuredText`. */
export const lessonContentArticleClass =
  "lesson-reading ce-lesson-content__article mx-auto w-full max-w-[42rem] space-y-8 text-pretty sm:space-y-9";

/** AI-материал: на всю ширину панели (без узкой колонки 42rem). */
export const lessonContentArticleWideClass =
  "lesson-reading ce-lesson-content__article ce-lesson-content__article--wide w-full max-w-none mx-0 space-y-6 text-pretty sm:space-y-7";

/** Базовая типографика тела статьи. */
export const lessonContentBodyClass =
  "text-[1.0625rem] leading-[1.75] tracking-normal text-foreground/92 sm:text-[1.125rem] sm:leading-[1.8]";

export const lessonContentH2Class =
  "mt-10 border-b border-border/50 pb-2.5 font-display text-[1.5rem] font-semibold leading-tight tracking-tight text-foreground first:mt-0 sm:text-[1.65rem]";

export const lessonContentH3Class =
  "mt-8 font-display text-xl font-semibold leading-snug tracking-tight text-foreground first:mt-0";

export const lessonContentParagraphClass =
  "whitespace-pre-wrap text-pretty leading-[1.75] text-foreground/90";

export const lessonContentListClass =
  "space-y-2.5 pl-6 leading-[1.7] text-foreground/90 marker:text-primary/75";

export const lessonContentUlClass = `list-disc ${lessonContentListClass}`;

export const lessonContentOlClass = `list-decimal ${lessonContentListClass} marker:font-semibold`;

export const lessonContentBlockquoteClass =
  "my-2 border-l-4 border-primary/35 bg-muted/25 py-1 pl-5 pr-2 text-[15px] leading-relaxed text-muted-foreground";

export const lessonContentTableWrapClass =
  "lesson-table-wrap mx-0 w-full min-w-0 max-w-full overflow-x-auto overscroll-x-contain rounded-xl border border-border/80 bg-card/40 px-2 py-1 shadow-sm [-webkit-overflow-scrolling:touch]";

export const lessonContentCodeWrapClass =
  "ce-lesson-code min-w-0 w-full max-w-full overflow-hidden";

export const lessonContentInlineCodeClass =
  "rounded-md border border-primary/15 bg-primary/8 px-1.5 py-0.5 font-mono text-[0.88em] text-primary";
