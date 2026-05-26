"use client";

import type { ReactNode } from "react";
import type { LearningNavModuleItem, LearningNavStepItem, LearningStepNeighbors } from "@/lib/learning-nav";
import { LearnPageShell } from "@/components/learn/learn-chrome";
import { LearningProgressStrip } from "@/components/learn/learning-progress-strip";
import { LearningSidebar, LearningSidebarPanel } from "@/components/learn/learning-sidebar";
import { LearningAsideMobile } from "@/components/learn/learning-aside-mobile";
import { LearningStepNav } from "@/components/learn/learning-step-nav";
import { cn } from "@/lib/utils";

export type LearningLayoutProps = {
  courseTitle: string;
  courseProgressPercent: number;
  moduleTitle: string;
  moduleProgressPercent: number;
  moduleStepsLabel: string;
  modules: LearningNavModuleItem[];
  steps: LearningNavStepItem[];
  neighbors: LearningStepNeighbors;
  header: ReactNode;
  children: ReactNode;
  asideRight?: ReactNode;
  footer?: ReactNode;
  className?: string;
};

export function LearningLayout({
  courseTitle,
  courseProgressPercent,
  moduleTitle,
  moduleProgressPercent,
  moduleStepsLabel,
  modules,
  steps,
  neighbors,
  header,
  children,
  asideRight,
  footer,
  className,
}: LearningLayoutProps) {
  return (
    <LearnPageShell className={cn("overflow-x-hidden", className)}>
      <div className="space-y-5">
        {header}
        <LearningProgressStrip
          courseTitle={courseTitle}
          courseProgressPercent={courseProgressPercent}
          moduleTitle={moduleTitle}
          moduleProgressPercent={moduleProgressPercent}
          moduleStepsLabel={moduleStepsLabel}
        />
        <LearningSidebar modules={modules} steps={steps} />

        <div
          className={cn(
            "grid gap-6",
            asideRight
              ? "lg:grid-cols-[minmax(13rem,16rem)_minmax(0,1fr)] xl:grid-cols-[minmax(13rem,16rem)_minmax(0,1fr)_minmax(15rem,18rem)]"
              : "lg:grid-cols-[minmax(13rem,16rem)_minmax(0,1fr)]",
          )}
        >
          <aside className="hidden lg:block">
            <div className="ce-learn-os-sidebar sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto p-4">
              <LearningSidebarPanel modules={modules} steps={steps} />
            </div>
          </aside>

          <div className="ce-learn-reader-column min-w-0 space-y-6">
            <div className="ce-learn-reader ce-learn-reader-surface lesson-prose w-full">{children}</div>
            {asideRight ? <LearningAsideMobile title="Справка и материалы">{asideRight}</LearningAsideMobile> : null}
            <LearningStepNav neighbors={neighbors} />
            {footer}
          </div>

          {asideRight ? (
            <aside className="hidden min-w-0 space-y-4 xl:block xl:sticky xl:top-24 xl:self-start xl:max-h-[calc(100vh-7rem)] xl:overflow-y-auto">
              {asideRight}
            </aside>
          ) : null}
        </div>
      </div>
    </LearnPageShell>
  );
}
