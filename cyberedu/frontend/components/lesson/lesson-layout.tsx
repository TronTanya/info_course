"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { PanelRightOpen } from "lucide-react";
import type { LearningNavModuleItem, LearningNavStepItem } from "@/lib/learning-nav";
import { LearnPageShell } from "@/components/learn/learn-chrome";
import { LearningSidebar, LearningSidebarPanel } from "@/components/learn/learning-sidebar";
import { MobileDrawer } from "@/components/layout/mobile-drawer";
import { Button } from "@/components/ui/button";
import { cyber } from "@/lib/design-system/cyber";
import { cn } from "@/lib/utils";

export type LessonLayoutProps = {
  header: ReactNode;
  children: ReactNode;
  aside: ReactNode;
  mobileCta: ReactNode;
  modules: LearningNavModuleItem[];
  steps: LearningNavStepItem[];
  className?: string;
};

export function LessonLayout({
  header,
  children,
  aside,
  mobileCta,
  modules,
  steps,
  className,
}: LessonLayoutProps) {
  const [asideOpen, setAsideOpen] = useState(false);

  return (
    <LearnPageShell className={cn("overflow-x-hidden ce-immersive-mobile-pad pb-28 lg:pb-0", className)}>
      <div className="space-y-5">
        {header}

        <div className="flex flex-wrap items-center gap-2 lg:hidden">
          <LearningSidebar modules={modules} steps={steps} />
          <Button type="button" variant="outline" className="min-h-11 flex-1" onClick={() => setAsideOpen(true)}>
            <PanelRightOpen className="size-4" aria-hidden />
            Прогресс и действия
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(12rem,14rem)_minmax(0,1fr)_minmax(15rem,18rem)] lg:gap-8 xl:grid-cols-[14rem_minmax(0,42rem)_18rem] xl:justify-center">
          <aside className="hidden lg:block">
            <div
              className={cn(
                cyber.panelStatic,
                "sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto p-3",
              )}
            >
              <LearningSidebarPanel modules={modules} steps={steps} />
            </div>
          </aside>

          <div className="lesson-prose min-w-0">{children}</div>

          <aside className="hidden lg:block">
            <div className="sticky top-24 max-h-[calc(100vh-7rem)] space-y-4 overflow-y-auto">{aside}</div>
          </aside>
        </div>
      </div>

      <MobileDrawer open={asideOpen} onOpenChange={setAsideOpen} title="Прогресс и действия">
        {aside}
      </MobileDrawer>

      <div
        className="fixed inset-x-0 bottom-0 z-30 border-t border-border/80 bg-background/95 p-3 backdrop-blur-md lg:hidden"
        style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom, 0px))" }}
      >
        {mobileCta}
      </div>
    </LearnPageShell>
  );
}
