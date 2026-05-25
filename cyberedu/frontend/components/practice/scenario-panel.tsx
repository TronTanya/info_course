"use client";

import type { ReactNode } from "react";
import { ScrollText } from "lucide-react";
import {
  isPracticeScenarioReady,
  PRACTICE_SCENARIO_EMPTY_MESSAGE,
  PRACTICE_SCENARIO_FIELD_LABELS,
} from "@/lib/practice-scenario-panel-ui";
import type { PracticeScenario } from "@/types/practice-view-model";
import { cn } from "@/lib/utils";

function ScenarioQuote({ children }: { children: string }) {
  return (
    <p className="min-w-0 break-words text-pretty whitespace-pre-wrap text-sm leading-relaxed text-foreground/95 sm:text-[0.9375rem]">
      {children}
    </p>
  );
}

function ScenarioFieldBlock({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-primary/90">{label}</p>
      <div className="min-w-0 overflow-x-clip rounded-xl border border-border/50 bg-background/30 px-3 py-3.5 ring-1 ring-primary/5 sm:px-4">
        {children}
      </div>
    </div>
  );
}

export type ScenarioPanelProps = {
  scenario?: PracticeScenario | null;
  className?: string;
};

export function ScenarioPanel({ scenario, className }: ScenarioPanelProps) {
  if (!isPracticeScenarioReady(scenario)) {
    return (
      <section
        className={cn(
          "ce-scenario-panel ce-glass relative overflow-hidden rounded-2xl",
          "border border-border/60 bg-linear-to-br from-card/80 via-card/65 to-muted/20",
          "min-w-0 p-4 sm:p-6",
          className,
        )}
        aria-label="Сценарий лаборатории"
      >
        <div className="ce-tech-grid pointer-events-none absolute inset-0 opacity-[0.08]" aria-hidden />
        <div className="relative flex flex-col items-center gap-3 py-6 text-center sm:py-8">
          <div className="flex size-12 items-center justify-center rounded-xl border border-border/60 bg-muted/25 text-muted-foreground">
            <ScrollText className="size-6" aria-hidden />
          </div>
          <p className="font-display text-base font-semibold text-foreground">Сценарий</p>
          <p className="max-w-md text-sm text-muted-foreground">{PRACTICE_SCENARIO_EMPTY_MESSAGE}</p>
        </div>
      </section>
    );
  }

  const { role, context, goal } = scenario;

  return (
    <section
      className={cn(
        "ce-scenario-panel ce-glass relative overflow-hidden rounded-2xl",
        "border border-primary/20 bg-linear-to-br from-card/85 via-card/70 to-cyan/[0.04]",
        "shadow-[0_0_32px_-14px_hsl(var(--primary)/0.35)] ring-1 ring-primary/10",
        "min-w-0 p-4 sm:p-6",
        className,
      )}
      aria-label="Сценарий лаборатории"
    >
      <div className="ce-tech-grid pointer-events-none absolute inset-0 opacity-[0.1]" aria-hidden />
      <div
        className="pointer-events-none absolute -right-10 top-0 h-32 w-32 rounded-full bg-primary/10 blur-2xl"
        aria-hidden
      />

      <div className="relative space-y-5">
        <div className="space-y-1">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Сценарий</p>
          <h2 className="font-display text-lg font-semibold text-foreground sm:text-xl">Контекст расследования</h2>
        </div>

        {role?.trim() ? (
          <ScenarioFieldBlock label={PRACTICE_SCENARIO_FIELD_LABELS.role}>
            <ScenarioQuote>{role.trim()}</ScenarioQuote>
          </ScenarioFieldBlock>
        ) : null}

        {context.trim() ? (
          <ScenarioFieldBlock label={PRACTICE_SCENARIO_FIELD_LABELS.context}>
            <ScenarioQuote>{context.trim()}</ScenarioQuote>
          </ScenarioFieldBlock>
        ) : null}

        <ScenarioFieldBlock label={PRACTICE_SCENARIO_FIELD_LABELS.goal}>
          <ScenarioQuote>{goal.trim()}</ScenarioQuote>
        </ScenarioFieldBlock>
      </div>
    </section>
  );
}
