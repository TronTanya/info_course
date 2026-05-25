"use client";

import type { ReactNode } from "react";
import { LessonPageScrollUnlock } from "@/components/lesson/premium/lesson-page-scroll-unlock";
import { LearningSidebar } from "@/components/learn/learning-sidebar";
import type { LearningNavModuleItem, LearningNavStepItem } from "@/lib/learning-nav";
import { LESSON_PAGE_MAIN_ID, LESSON_PAGE_TITLE_ID } from "@/lib/lesson-page-a11y";
import { cn } from "@/lib/utils";

export type LessonPremiumLayoutProps = {
  /** Хлебные крошки + шапка урока */
  top: ReactNode;
  children: ReactNode;
  /** Desktop: оглавление + AI-наставник (+ опционально прогресс) */
  rightSidebar: ReactNode;
  mobileCta?: ReactNode;
  modules: LearningNavModuleItem[];
  steps: LearningNavStepItem[];
  className?: string;
};

/**
 * Этап 2: на desktop — центральная колонка материала и sticky-правая панель
 * (оглавление + наставник). На mobile — одна колонка, CTA снизу.
 */
export function LessonPremiumLayout({
  top,
  children,
  rightSidebar,
  mobileCta,
  modules,
  steps,
  className,
}: LessonPremiumLayoutProps) {
  return (
    <div
      data-ce-page="lesson"
      className={cn(
        "ce-lesson-premium-layout ce-lesson-scroll-root overflow-x-clip overflow-y-visible ce-immersive-mobile-pad lg:pb-0",
        className,
      )}
    >
      <LessonPageScrollUnlock />
      <div className="mb-3 flex flex-wrap items-center gap-2 lg:hidden">
        <LearningSidebar modules={modules} steps={steps} />
      </div>

      <div className="min-w-0 space-y-2.5 sm:space-y-3">{top}</div>

      <div
        className={cn(
          "ce-lesson-page-grid mt-3 grid min-w-0 w-full max-w-none grid-cols-1 gap-4 sm:mt-4",
          "lg:grid-cols-[minmax(0,1fr)_min(18rem,22vw)] lg:items-start lg:gap-6",
        )}
      >
        <main
          id={LESSON_PAGE_MAIN_ID}
          aria-labelledby={LESSON_PAGE_TITLE_ID}
          className="ce-lesson-premium-main min-w-0 w-full"
        >
          {children}
        </main>

        <aside
          className="ce-lesson-page-sidebar hidden min-w-0 lg:block"
          aria-label="Оглавление и AI-наставник"
        >
          <div className="sticky top-[calc(var(--header-height,4rem)+0.75rem)] flex max-h-[calc(100dvh-var(--header-height,4rem)-1.5rem)] flex-col gap-2.5 overflow-y-auto overscroll-contain pr-0.5">
            {rightSidebar}
          </div>
        </aside>
      </div>

      {mobileCta ? (
        <div className="ce-lesson-mobile-cta pointer-events-none fixed inset-x-0 bottom-0 z-[45] lg:hidden">
          <div className="pointer-events-auto border-t border-border/80 bg-background/95 px-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-8px_32px_-8px_rgba(0,0,0,0.35)] backdrop-blur-md supports-backdrop-filter:bg-background/80">
            {mobileCta}
          </div>
        </div>
      ) : null}
    </div>
  );
}
