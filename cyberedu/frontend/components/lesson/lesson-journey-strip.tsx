"use client";

import { Check } from "lucide-react";
import type { LessonJourneyStep } from "@/lib/lesson-journey-ui";
import { cn } from "@/lib/utils";

export type LessonJourneyStripProps = {
  steps: LessonJourneyStep[];
  className?: string;
};

function stepTone(status: LessonJourneyStep["status"]) {
  switch (status) {
    case "completed":
      return "border-success/35 bg-success/10 text-success";
    case "current":
      return "border-primary/40 bg-primary/12 text-primary ring-1 ring-primary/25";
    default:
      return "border-border/70 bg-muted/20 text-muted-foreground";
  }
}

export function LessonJourneyStrip({ steps, className }: LessonJourneyStripProps) {
  if (steps.length === 0) return null;

  return (
    <nav
      className={cn("ce-lesson-journey-strip", className)}
      aria-label="Маршрут урока"
    >
      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
        Ваш маршрут
      </p>
      <ol className="mt-2 flex flex-wrap gap-2" role="list">
        {steps.map((step, index) => (
          <li key={step.id} role="listitem" className="flex min-w-0 items-center gap-2">
            <a
              href={step.href}
              className={cn(
                "inline-flex min-h-9 max-w-full items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                stepTone(step.status),
              )}
              aria-current={step.status === "current" ? "step" : undefined}
            >
              {step.status === "completed" ? (
                <Check className="size-3.5 shrink-0" aria-hidden />
              ) : (
                <span
                  className={cn(
                    "size-2 shrink-0 rounded-full",
                    step.status === "current" ? "bg-primary" : "bg-muted-foreground/40",
                  )}
                  aria-hidden
                />
              )}
              <span className="truncate">{step.label}</span>
            </a>
            {index < steps.length - 1 ? (
              <span className="hidden text-muted-foreground/50 sm:inline" aria-hidden>
                →
              </span>
            ) : null}
          </li>
        ))}
      </ol>
    </nav>
  );
}
