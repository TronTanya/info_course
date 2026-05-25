"use client";

import type { ReactNode } from "react";
import { LessonContentLegend } from "@/components/lesson/lesson-content-legend";
import { LessonSectionNav } from "@/components/lesson/lesson-section-nav";
import type { LessonContentLegendItem } from "@/lib/lesson-content-legend";
import type { LessonSectionNavItem } from "@/lib/lesson-section-nav";
import { LessonStickyTabs } from "@/components/lesson/lesson-sticky-tabs";
import { cn } from "@/lib/utils";

export type LessonMainContentProps = {
  contentTab: "lesson" | "ai" | "summary";
  onContentTabChange: (tab: "lesson" | "ai" | "summary") => void;
  allowAiTabs: boolean;
  aiBusy: boolean;
  original: ReactNode;
  ai: ReactNode;
  summary: ReactNode;
  sectionNavItems: LessonSectionNavItem[];
  showSectionNav: boolean;
  contentLegendItems?: LessonContentLegendItem[];
  containerRef: React.RefObject<HTMLElement | null>;
  /** Заголовок «Материал урока» (на premium-странице обычно скрыт — есть оглавление). */
  showIntro?: boolean;
  className?: string;
};

export function LessonMainContent({
  contentTab,
  onContentTabChange,
  allowAiTabs,
  aiBusy,
  original,
  ai,
  summary,
  sectionNavItems,
  showSectionNav,
  contentLegendItems = [],
  containerRef,
  showIntro = true,
  className,
}: LessonMainContentProps) {
  const stickyTabValue = contentTab === "lesson" ? "original" : contentTab;

  return (
    <section
      className={cn(
        "ce-lesson-main-content lesson-prose scroll-mt-28 min-w-0 w-full max-w-none overflow-x-clip",
        showIntro ? "space-y-4 sm:space-y-5" : "space-y-3",
        className,
      )}
      aria-labelledby={showIntro ? "lesson-main-heading" : undefined}
    >
      {showIntro ? (
        <div className="space-y-1">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-primary">Материал урока</p>
          <h2 id="lesson-main-heading" className="font-display text-lg font-semibold text-foreground sm:text-xl">
            Содержание лекции
          </h2>
          <p className="text-sm text-pretty text-muted-foreground">
            Текст разбит на смысловые блоки: важное, примеры, предупреждения и чеклисты.
          </p>
        </div>
      ) : (
        <h2 id="lesson-main-heading" className="sr-only">
          Содержание лекции
        </h2>
      )}

      {contentTab === "lesson" && showSectionNav && sectionNavItems.length >= 2 ? (
        <LessonSectionNav items={sectionNavItems} containerRef={containerRef} />
      ) : null}

      {contentTab === "lesson" && contentLegendItems.length > 0 ? (
        <LessonContentLegend items={contentLegendItems} />
      ) : null}

      <LessonStickyTabs
        value={stickyTabValue}
        onValueChange={(v) => {
          const mapped = v === "original" ? "lesson" : v;
          onContentTabChange(mapped);
        }}
        showAiTabs={allowAiTabs}
        busy={aiBusy}
        original={original}
        ai={ai}
        summary={summary}
      />

      {aiBusy ? (
        <p className="sr-only" aria-live="polite">
          AI обрабатывает запрос
        </p>
      ) : null}
    </section>
  );
}
