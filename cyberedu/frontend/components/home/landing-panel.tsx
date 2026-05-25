import * as React from "react";
import { cn } from "@/lib/utils";

export type LandingPanelProps = {
  children: React.ReactNode;
  className?: string;
  /** Мягкое свечение по периметру */
  glow?: boolean;
  /** Компактные отступы */
  compact?: boolean;
};

/** Glass-панель для блоков лендинга. */
export function LandingPanel({ children, className, glow, compact }: LandingPanelProps) {
  return (
    <div
      className={cn(
        "ce-landing-panel ce-glass rounded-3xl border",
        compact ? "p-5 sm:p-6" : "p-6 sm:p-8 lg:p-10",
        glow &&
          "border-primary/25 shadow-[var(--shadow-glow),0_0_80px_-32px_color-mix(in_oklab,var(--primary)_25%,transparent)]",
        className,
      )}
    >
      {children}
    </div>
  );
}
