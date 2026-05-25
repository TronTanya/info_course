"use client";

import { ListChecks } from "lucide-react";
import { buildPracticeImprovementItems } from "@/lib/practice-feedback-revision-ui";
import type { PracticeViewStatus } from "@/types/practice-view-model";
import { cn } from "@/lib/utils";

export function PracticeRevisionFeedback({
  status,
  feedback,
  className,
}: {
  status: PracticeViewStatus;
  feedback?: string | null;
  className?: string;
}) {
  const items = buildPracticeImprovementItems({ status, feedback });
  if (!items.length) return null;

  return (
    <div
      className={cn(
        "rounded-xl border border-warning/35 bg-warning/[0.06] px-4 py-4 ring-1 ring-inset ring-warning/20",
        className,
      )}
      role="region"
      aria-label="Что улучшить"
    >
      <div className="flex items-center gap-2">
        <ListChecks className="size-4 shrink-0 text-warning" aria-hidden />
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-warning">
          Что улучшить
        </p>
      </div>
      <ul className="mt-3 space-y-2 text-sm text-pretty text-foreground">
        {items.map((item) => (
          <li key={item} className="flex gap-2 before:shrink-0 before:text-warning before:content-['•']">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
