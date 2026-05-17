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
        "ce-glass flex flex-col gap-3 rounded-2xl border border-border/60 p-4 sm:flex-row sm:items-stretch sm:justify-between",
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
                <span className="block text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Назад
                </span>
                <span className="block text-sm font-medium">{previous.label}</span>
              </span>
            </span>
          ) : (
            <Link href={previous.href} className="flex items-center gap-2">
              <ChevronLeft className="size-4 shrink-0" aria-hidden />
              <span>
                <span className="block text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
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
        <Button
          asChild={!next.disabled}
          variant={next.disabled ? "outline" : "primary"}
          className="h-auto min-h-11 flex-1 justify-end gap-2 py-3 text-right sm:max-w-[50%]"
          disabled={next.disabled}
          aria-disabled={next.disabled || undefined}
          title={next.hint}
        >
          {next.disabled ? (
            <span className="ml-auto flex items-center gap-2 opacity-60">
              <span>
                <span className="block text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Далее
                </span>
                <span className="block text-sm font-medium">{next.label}</span>
              </span>
              <ChevronRight className="size-4 shrink-0" aria-hidden />
            </span>
          ) : (
            <Link href={next.href} className="ml-auto flex items-center gap-2">
              <span>
                <span className="block text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/90">
                  Далее
                </span>
                <span className="block text-sm font-medium">{next.label}</span>
              </span>
              <ChevronRight className="size-4 shrink-0" aria-hidden />
            </Link>
          )}
        </Button>
      ) : null}
    </nav>
  );
}
