"use client";

import { MentorRefusalState } from "@/components/ai/mentor/mentor-refusal-state";
import type { TutorPipelineMeta } from "@/lib/ai/tutor/types";
import { cn } from "@/lib/utils";

/**
 * Отдельный friendly UI для отказа по безопасности (не путать с error banner).
 */
export function MentorSafetyRefusal({
  meta,
  topicLabel,
  onSuggestAction,
  className,
}: {
  meta?: TutorPipelineMeta;
  topicLabel?: string;
  onSuggestAction?: (prompt: string) => void;
  className?: string;
}) {
  return (
    <MentorRefusalState
      meta={meta}
      refusalCode={meta?.refusalCode}
      refusalKind={meta?.refusalKind}
      topicLabel={topicLabel}
      onSuggestAction={onSuggestAction}
      className={cn("ce-mentor-safety-refusal", className)}
    />
  );
}
