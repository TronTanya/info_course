"use client";

import * as React from "react";
import { useState } from "react";
import { PanelRightOpen } from "lucide-react";
import { MobileDrawer } from "@/components/layout/mobile-drawer";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type PracticeLabLayoutProps = {
  breadcrumb?: React.ReactNode;
  /** Заголовок лаборатории (название задания, статусы) */
  header: React.ReactNode;
  main: React.ReactNode;
  aside: React.ReactNode;
  /** На mobile/tablet (<lg): блок после main (например AI-наставник под формой). */
  mobileAfterMain?: React.ReactNode;
  className?: string;
};

/**
 * Двухколоночная лаборатория: на lg+ — сетка; на мобиле боковая панель в drawer.
 */
export function PracticeLabLayout({
  breadcrumb,
  header,
  main,
  aside,
  mobileAfterMain,
  className,
}: PracticeLabLayoutProps) {
  const [asideOpen, setAsideOpen] = useState(false);

  return (
    <div
      className={cn(
        "lab-shell hero-glow ce-learn-lab ce-practice-cyber-lab ce-animate-in ce-immersive-mobile-pad min-w-0 overflow-x-clip pb-28 lg:pb-0",
        className,
      )}
    >
      <header className="lab-shell-header relative px-4 py-5 sm:px-6 sm:py-6">
        <div className="ce-learn-grid pointer-events-none absolute inset-0 opacity-[0.12]" aria-hidden />
        <div className="relative mb-3 hidden h-0.5 w-24 rounded-full bg-linear-to-r from-primary via-accent to-transparent sm:block" aria-hidden />
        {breadcrumb ? <div className="min-w-0">{breadcrumb}</div> : null}
        <div className={breadcrumb ? "mt-4" : ""}>{header}</div>
      </header>
      <div className="lab-main-surface min-w-0 p-4 sm:p-6">
        <div className="mb-4 lg:hidden">
          <Button
            type="button"
            variant="outline"
            className="ce-touch-target min-h-12 w-full touch-manipulation text-base"
            onClick={() => setAsideOpen(true)}
          >
            <PanelRightOpen className="size-4" aria-hidden />
            Чеклист и навигация
          </Button>
        </div>
        <div className="practice-layout min-w-0">
          <main
            id="practice-lab-main"
            className="practice-layout-main min-w-0 space-y-6"
            aria-label="Содержание задания"
          >
            {main}
            {mobileAfterMain ? (
              <div className="practice-layout-mobile-footer min-w-0 lg:hidden">{mobileAfterMain}</div>
            ) : null}
          </main>
          <aside
            className="practice-layout-aside hidden min-w-0 space-y-5 lg:block lg:sticky lg:top-20 lg:max-h-[calc(100dvh-6rem)] lg:overflow-y-auto lg:overscroll-contain lg:self-start"
            aria-label="Чеклист и навигация"
          >
            {aside}
          </aside>
        </div>
      </div>
      <MobileDrawer open={asideOpen} onOpenChange={setAsideOpen} title="Лаборатория">
        {aside}
      </MobileDrawer>
    </div>
  );
}
