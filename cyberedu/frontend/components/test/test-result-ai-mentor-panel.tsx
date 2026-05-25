"use client";

import { Bot, Clock, Shield, Sparkles } from "lucide-react";
import {
  TEST_MENTOR_GUARDRAIL,
  TEST_MENTOR_INTRO,
  TEST_MENTOR_QUICK_ACTIONS,
  TEST_MENTOR_UNAVAILABLE,
  type TestMentorQuickAction,
  type TestMentorQuickActionId,
  type TestMentorSafeContext,
} from "@/lib/test-mentor-panel";
import type { MentorModeId } from "@/lib/ai/mentor-ui/modes";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/ui/section-card";
import { cn } from "@/lib/utils";

export type TestResultAIMentorPanelProps = {
  panelId?: string;
  aiConfigured: boolean;
  context: TestMentorSafeContext;
  onOpenMentorChat: (bootModeId?: MentorModeId, bootPrompt?: string) => void;
  className?: string;
};

function ContextLine({ context }: { context: TestMentorSafeContext }) {
  const outcome = context.passed ? "зачтён" : "не зачтён";
  return (
    <p className="mt-2 text-xs leading-relaxed text-pretty break-words text-muted-foreground">
      <span className="font-medium text-foreground/80">{context.moduleTitle}</span>
      <span aria-hidden> · </span>
      <span>{context.testTitle}</span>
      <span aria-hidden> · </span>
      <span>
        {context.percent}% · {outcome}
      </span>
    </p>
  );
}

function QuickActionButton({
  item,
  disabled,
  onClick,
}: {
  item: TestMentorQuickAction;
  disabled: boolean;
  onClick: () => void;
}) {
  const Icon = item.icon;
  return (
    <li>
      <Button
        type="button"
        variant="outline"
        disabled={disabled}
        aria-disabled={disabled}
        title={disabled ? undefined : item.description}
        className={cn(
          "h-auto min-h-11 w-full flex-col items-start gap-1 border-border/80 px-3 py-2.5 text-left",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          disabled
            ? "cursor-not-allowed opacity-55"
            : "bg-background/40 hover:border-cyan/35 hover:bg-cyan/6",
        )}
        onClick={onClick}
      >
        <span className="flex w-full items-center gap-2">
          <Icon className="size-4 shrink-0 text-cyan" aria-hidden />
          <span className="text-sm font-semibold text-foreground">{item.label}</span>
        </span>
        <span className="w-full text-xs font-normal text-muted-foreground">{item.description}</span>
      </Button>
    </li>
  );
}

export function TestResultAIMentorPanel({
  panelId = "test-result-ai-mentor",
  aiConfigured,
  context,
  onOpenMentorChat,
  className,
}: TestResultAIMentorPanelProps) {
  const available = aiConfigured;
  const headingId = `${panelId}-heading`;
  const unavailableHintId = `${panelId}-unavailable-hint`;

  function handleQuickAction(id: TestMentorQuickActionId) {
    if (!available) return;
    const action = TEST_MENTOR_QUICK_ACTIONS.find((a) => a.id === id);
    if (!action) return;
    onOpenMentorChat(action.mentorModeId, action.bootPrompt);
  }

  if (!aiConfigured) {
    return (
      <SectionCard
        variant="default"
        flushTitle
        className={cn("ce-test-result-ai-mentor ce-glass border-cyan/20 p-4 sm:p-5", className)}
        title={
          <span id={headingId} className="flex items-center gap-2">
            <Bot className="size-4 text-cyan" aria-hidden />
            AI-наставник после теста
          </span>
        }
      >
        <p className="mt-2 rounded-lg border border-dashed border-border/70 bg-muted/15 px-3 py-2.5 text-sm text-muted-foreground" role="status">
          {TEST_MENTOR_UNAVAILABLE}
        </p>
        <ContextLine context={context} />
        <ul className="mt-4 space-y-2 opacity-55" aria-label="Быстрые действия AI-наставника">
          {TEST_MENTOR_QUICK_ACTIONS.map((item) => (
            <QuickActionButton key={item.id} item={item} disabled onClick={() => {}} />
          ))}
        </ul>
        <Button type="button" variant="outline" className="mt-3 min-h-11 w-full" disabled aria-describedby={unavailableHintId}>
          <Clock className="mr-2 size-4 opacity-60" aria-hidden />
          Открыть чат наставника
        </Button>
        <p id={unavailableHintId} className="sr-only">
          {TEST_MENTOR_UNAVAILABLE}
        </p>
        <p className="mt-4 flex gap-2 rounded-xl border border-border/70 bg-muted/20 px-3 py-2.5 text-xs text-muted-foreground" role="note">
          <Shield className="mt-0.5 size-3.5 shrink-0 text-success" aria-hidden />
          <span>{TEST_MENTOR_GUARDRAIL}</span>
        </p>
      </SectionCard>
    );
  }

  return (
    <SectionCard
      variant="default"
      flushTitle
      className={cn(
        "ce-test-result-ai-mentor ce-glass border-cyan/20 bg-linear-to-br from-cyan/5 via-card to-card p-4 sm:p-5",
        className,
      )}
      title={
        <span id={headingId} className="flex items-center gap-2">
          <Bot className="size-4 text-cyan" aria-hidden />
          AI-наставник после теста
        </span>
      }
    >
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{TEST_MENTOR_INTRO}</p>
      <ContextLine context={context} />

      <ul className="mt-4 space-y-2" aria-label="Быстрые действия AI-наставника">
        {TEST_MENTOR_QUICK_ACTIONS.map((item) => (
          <QuickActionButton
            key={item.id}
            item={item}
            disabled={!available}
            onClick={() => handleQuickAction(item.id)}
          />
        ))}
      </ul>

      <Button
        type="button"
        variant="secondary"
        className="mt-3 min-h-12 w-full gap-2 border-cyan/25 bg-cyan/6 hover:bg-cyan/10"
        disabled={!available}
        onClick={() => onOpenMentorChat()}
      >
        <Sparkles className="size-4 text-cyan" aria-hidden />
        Открыть чат наставника
      </Button>

      <p className="mt-2 text-xs text-muted-foreground">
        Наставник объясняет концепции и не называет «правильный ответ был …».
      </p>

      <p className="mt-4 flex gap-2 rounded-xl border border-border/70 bg-muted/20 px-3 py-2.5 text-xs text-muted-foreground" role="note">
        <Shield className="mt-0.5 size-3.5 shrink-0 text-success" aria-hidden />
        <span>{TEST_MENTOR_GUARDRAIL}</span>
      </p>
    </SectionCard>
  );
}
