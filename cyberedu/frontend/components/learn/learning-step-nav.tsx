"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { LearningStepNeighbors } from "@/lib/learning-nav";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function LearningStepNav({
  neighbors,
  className,
}: {
  neighbors: LearningStepNeighbors;
  className?: string;
}) {
  const { previous, next } = neighbors;

  return (
    <nav
      className={cn(
        "ce-learn-os-panel flex flex-col gap-3 p-4 sm:flex-row sm:items-stretch sm:justify-between",
        className,
      )}
      aria-label="Навигация по шагам"
    >
      {previous ? (
        <Button
          asChild={!previous.disabled}
          variant="outline"
          className="h-auto min-h-11 flex-1 justify-start gap-2 py-3 text-left"
          disabled={previous.disabled}
          aria-disabled={previous.disabled || undefined}
          title={previous.hint}
        >
          {previous.disabled ? (
            <span className="flex items-center gap-2 opacity-60">
              <ChevronLeft className="size-4 shrink-0" aria-hidden />
              <span>
                <span className="block text-2.5 font-semibold uppercase tracking-wide text-muted-foreground">
                  Назад
                </span>
                <span className="block text-sm font-medium">{previous.label}</span>
              </span>
            </span>
          ) : (
            <Link href={previous.href} className="flex items-center gap-2">
              <ChevronLeft className="size-4 shrink-0" aria-hidden />
              <span>
                <span className="block text-2.5 font-semibold uppercase tracking-wide text-muted-foreground">
                  Назад
                </span>
                <span className="block text-sm font-medium">{previous.label}</span>
              </span>
            </Link>
          )}
        </Button>
      ) : (
        <div className="hidden flex-1 sm:block" aria-hidden />
      )}

      {next ? (
        <div className="flex min-w-0 flex-1 flex-col gap-1.5 sm:max-w-[50%] sm:items-end">
          <Button
            asChild={!next.disabled}
            variant={next.disabled ? "outline" : "primary"}
            className="h-auto min-h-11 w-full justify-end gap-2 py-3 text-right"
            disabled={next.disabled}
            aria-disabled={next.disabled || undefined}
            title={next.hint}
            aria-describedby={next.disabled && next.hint ? "learn-step-next-hint" : undefined}
          >
            {next.disabled ? (
              <span className="ml-auto flex items-center gap-2 opacity-60">
                <span>
                  <span className="block text-2.5 font-semibold uppercase tracking-wide text-muted-foreground">
                    Далее
                  </span>
                  <span className="block text-sm font-medium">{next.label}</span>
                </span>
                <ChevronRight className="size-4 shrink-0" aria-hidden />
              </span>
            ) : (
              <Link href={next.href} className="ml-auto flex items-center gap-2">
                <span>
                  <span className="block text-2.5 font-semibold uppercase tracking-wide text-muted-foreground/90">
                    Далее
                  </span>
                  <span className="block text-sm font-medium">{next.label}</span>
                </span>
                <ChevronRight className="size-4 shrink-0" aria-hidden />
              </Link>
            )}
          </Button>
          {next.disabled && next.hint ? (
            <p id="learn-step-next-hint" className="text-right text-xs text-muted-foreground sm:max-w-full">
              {next.hint}
            </p>
          ) : null}
        </div>
      ) : null}
    </nav>
  );
}
