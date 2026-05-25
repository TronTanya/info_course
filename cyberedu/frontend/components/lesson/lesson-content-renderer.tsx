import { LessonStructuredText, type LessonSegment } from "@/components/lesson/lesson-structured-text";
import {
  LESSON_READING_MAX_WIDTH,
  type LessonContentWidth,
} from "@/lib/lesson-content-typography";
import { cn } from "@/lib/utils";

export type { LessonSegment, GlossaryEntry } from "@/components/lesson/lesson-structured-text";
export { parseLessonStructure, extractLessonGlossary } from "@/components/lesson/lesson-structured-text";

export type LessonContentRendererProps = {
  source: string;
  className?: string;
  /** `wide` — AI-объяснение / конспект на всю ширину вкладки */
  width?: LessonContentWidth;
  /** Не рендерить блоки (например mini_case — отдельная карточка) */
  skipTypes?: LessonSegment["type"][];
};

/**
 * Основной материал урока (этап 7).
 *
 * - Парсинг: `::: fences` + markdown-подобные блоки в `LessonStructuredText` (не MDX).
 * - Без `dangerouslySetInnerHTML`: текст и инлайн-разметка через `formatInlineMarkdown`,
 *   ссылки и изображения через `safeLessonHref` / `safeLessonImageSrc`.
 * - Типографика: ограниченная ширина, h2/h3, списки, код, таблицы со скроллом, callouts.
 */
export function LessonContentRenderer({
  source,
  className,
  width = "reading",
  skipTypes,
}: LessonContentRendererProps) {
  const hasContent = source.trim().length > 0;

  return (
    <div
      className={cn(
        "ce-lesson-content lesson-prose min-w-0 w-full max-w-full overflow-x-clip",
        width === "wide" && "ce-lesson-content--wide",
        className,
      )}
      style={{ ["--lesson-reading-max" as string]: LESSON_READING_MAX_WIDTH }}
    >
      {hasContent ? (
        <LessonStructuredText source={source} skipTypes={skipTypes} width={width} />
      ) : (
        <p
          className="mx-auto max-w-[42rem] rounded-xl border border-dashed border-border/70 bg-muted/15 px-4 py-6 text-center text-sm text-muted-foreground"
          role="status"
        >
          Материал урока пока не добавлен.
        </p>
      )}
    </div>
  );
}

/** @deprecated Используйте `LessonContentRenderer`. */
export const LessonStructuredTextRenderer = LessonContentRenderer;
