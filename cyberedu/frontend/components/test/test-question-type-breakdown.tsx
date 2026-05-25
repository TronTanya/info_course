"use client";

import type { ClientTestQuestion } from "@/lib/test-grading";
import { countQuestionsByType } from "@/lib/test-ui";
import { cn } from "@/lib/utils";

export function TestQuestionTypeBreakdown({
  questions,
  className,
}: {
  questions: Pick<ClientTestQuestion, "questionType">[];
  className?: string;
}) {
  const rows = countQuestionsByType(questions);
  if (rows.length === 0) return null;

  return (
    <div className={cn("space-y-2", className)}>
      <p className="text-xs font-semibold uppercase tracking-wide text-foreground">Состав теста</p>
      <ul className="flex flex-wrap gap-2" role="list">
        {rows.map((row) => (
          <li key={row.type}>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-muted/25 px-2.5 py-1 text-xs font-medium text-foreground">
              <span className="font-mono tabular-nums text-primary">{row.count}</span>
              <span className="text-muted-foreground">×</span>
              <span>{row.label}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
