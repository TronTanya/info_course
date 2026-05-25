"use client";

import { Scale } from "lucide-react";
import { buildPracticeGradingSummary, type PracticeGradingUiInput } from "@/lib/practice-grading-ui";
import { SectionCard } from "@/components/ui/section-card";
import { cn } from "@/lib/utils";

export function PracticeLabGradingCard({
  input,
  className,
}: {
  input: PracticeGradingUiInput;
  className?: string;
}) {
  const summary = buildPracticeGradingSummary(input);

  return (
    <SectionCard variant="muted" flushTitle className={cn("p-4 sm:p-5", className)} title={summary.headline}>
      <div className="flex gap-3">
        <Scale className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
        <div className="min-w-0 space-y-3">
          <p className="text-sm font-medium text-foreground">{summary.scoreLine}</p>
          <ul className="space-y-2 text-sm text-muted-foreground" role="list">
            {summary.bullets.map((line) => (
              <li key={line} className="flex gap-2 before:text-primary before:content-['•']">
                {line}
              </li>
            ))}
          </ul>
          <p className="text-xs text-muted-foreground">
            Эталонные ответы, regex и ключи автопроверки не отображаются — итог определяет сервер или
            преподаватель.
          </p>
        </div>
      </div>
    </SectionCard>
  );
}
