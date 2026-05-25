"use client";

import { Lightbulb, Route, ShieldAlert, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getMentorRefusalStructuredUi,
  getMentorRefusalUi,
  MENTOR_REFUSAL_SUGGESTED_ACTIONS,
  shouldShowStructuredRefusal,
} from "@/lib/ai/mentor-ui/refusal-ui";
import type { MentorRefusalKind } from "@/lib/ai/safety/mentor-refusal-copy";
import type { TutorPipelineMeta, TutorRefusalCode } from "@/lib/ai/tutor/types";
import { cn } from "@/lib/utils";

export function MentorRefusalState({
  refusalCode,
  refusalKind,
  topicLabel,
  meta,
  className,
  compact,
  onSuggestAction,
}: {
  refusalCode?: TutorRefusalCode;
  refusalKind?: MentorRefusalKind;
  topicLabel?: string;
  meta?: TutorPipelineMeta;
  className?: string;
  compact?: boolean;
  onSuggestAction?: (prompt: string) => void;
}) {
  const pipelineMeta: TutorPipelineMeta =
    meta ??
    ({
      refused: true,
      refusalCode,
      refusalKind,
      topic: "general",
      difficulty: "beginner",
      recommendations: [],
    } as TutorPipelineMeta);
  const structuredMode = shouldShowStructuredRefusal(pipelineMeta);
  const structured = structuredMode
    ? getMentorRefusalStructuredUi({ refusalCode, refusalKind, topicLabel })
    : null;
  const fallback = getMentorRefusalUi(refusalCode);

  if (structured) {
    return (
      <div
        className={cn(
          "ce-mentor-refusal rounded-xl border border-warning/40 bg-linear-to-br from-warning/12 via-transparent to-cyan/5",
          compact ? "px-2.5 py-2" : "px-3 py-3",
          className,
        )}
        role="status"
        aria-live="polite"
      >
        <p
          className={cn(
            "flex items-center gap-2 font-semibold text-warning",
            compact ? "text-xs" : "text-sm",
          )}
        >
          <ShieldAlert className="size-3.5 shrink-0" aria-hidden />
          {structured.title}
        </p>

        <ol className={cn("mt-2.5 space-y-2.5", compact ? "text-[11px]" : "text-xs")}>
          <li className="rounded-lg border border-warning/25 bg-background/40 px-2.5 py-2">
            <p className="font-medium text-foreground">{structured.denial}</p>
          </li>
          <li className="rounded-lg border border-border/60 bg-muted/25 px-2.5 py-2">
            <p className="font-medium text-muted-foreground">Почему</p>
            <p className="mt-0.5 text-pretty text-foreground/90">{structured.reason}</p>
          </li>
          <li className="rounded-lg border border-cyan/20 bg-cyan/5 px-2.5 py-2">
            <p className="flex items-center gap-1.5 font-medium text-cyan">
              <Lightbulb className="size-3 shrink-0" aria-hidden />
              Чем могу помочь
            </p>
            <p className="mt-0.5 text-pretty text-foreground/90">{structured.alternative}</p>
          </li>
          <li className="rounded-lg border border-primary/15 bg-primary/5 px-2.5 py-2">
            <p className="flex items-center gap-1.5 font-medium text-primary">
              <Route className="size-3 shrink-0" aria-hidden />
              Следующий шаг
            </p>
            <p className="mt-0.5 text-pretty text-foreground/90">{structured.learnAction}</p>
          </li>
        </ol>

        {onSuggestAction ? (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {MENTOR_REFUSAL_SUGGESTED_ACTIONS.map((action) => (
              <Button
                key={action.id}
                type="button"
                variant="outline"
                size="sm"
                className="h-auto min-h-7 border-cyan/25 bg-background/50 px-2 py-1 text-[11px] font-normal text-foreground hover:border-cyan/40 hover:bg-cyan/10"
                onClick={() => onSuggestAction(action.prompt)}
              >
                <Sparkles className="mr-1 size-3 shrink-0 text-cyan" aria-hidden />
                {action.label}
              </Button>
            ))}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-lg border border-warning/35 bg-warning/8",
        compact ? "px-2.5 py-2" : "px-3 py-2.5",
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <p className={cn("flex items-center gap-2 font-semibold text-warning", compact ? "text-xs" : "text-sm")}>
        <ShieldAlert className="size-3.5 shrink-0" aria-hidden />
        {fallback.title}
      </p>
      <p className={cn("mt-1 text-pretty text-muted-foreground", compact ? "text-[11px]" : "text-xs")}>
        {fallback.description}
      </p>
      <p className={cn("mt-1.5 text-pretty text-foreground/85", compact ? "text-[11px]" : "text-xs")}>
        <span className="font-medium">Что делать: </span>
        {fallback.actionHint}
      </p>
    </div>
  );
}
