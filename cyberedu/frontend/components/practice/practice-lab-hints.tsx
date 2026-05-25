"use client";

import { PracticeHints } from "@/components/practice/practice-hints";
import { normalizePracticeHintsInput } from "@/lib/practice-hints";
import type { PracticeHint } from "@/types/practice-view-model";
import { cn } from "@/lib/utils";

/** @deprecated Используйте PracticeHints */
export function PracticeLabHints({
  levels,
  hints,
  className,
  moduleId,
  practiceId,
}: {
  levels?: string[];
  hints?: PracticeHint[];
  className?: string;
  moduleId?: string;
  practiceId?: string;
}) {
  const resolved = normalizePracticeHintsInput(hints ?? [], levels ?? []);
  return (
    <PracticeHints
      hints={resolved}
      className={cn(className)}
      moduleId={moduleId}
      practiceId={practiceId}
    />
  );
}
