"use client";

import { useEffect, type ReactNode } from "react";
import { Bot, Clock, Lock, Shield, Sparkles } from "lucide-react";
import { preloadMentorChat } from "@/components/ai/ai-mentor-chat-lazy";
import {
  LESSON_MENTOR_GUARDRAIL,
  LESSON_MENTOR_INTRO,
  LESSON_MENTOR_LESSON_DISABLED,
  LESSON_MENTOR_LOCKED_MESSAGE,
  LESSON_MENTOR_QUICK_ACTIONS,
  LESSON_MENTOR_UNAVAILABLE,
  type LessonMentorQuickAction,
  type LessonMentorQuickActionId,
  type LessonMentorSafeContext,
} from "@/lib/lesson-mentor-panel";
import type { MentorModeId } from "@/lib/ai/mentor-ui/modes";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type LessonAIMentorPanelPlacement = "sidebar" | "inline";

export type LessonAIMentorPanelProps = {
  /** Уникальный префикс id (desktop/mobile — два экземпляра на странице). */
  panelId?: string;
  /** sidebar — правая колонка; inline — под материалом на mobile. */
  placement?: LessonAIMentorPanelPlacement;
  allowAiAdaptation: boolean;
  aiConfigured: boolean;
  /** Урок в статусе locked — чат и быстрые действия недоступны. */
  lessonLocked?: boolean;
  aiBusy: boolean;
  context: LessonMentorSafeContext;
  onOpenMentorChat: (bootModeId?: MentorModeId, bootPrompt?: string) => void;
  className?: string;
};

function PanelShell({
  children,
  className,
  headingId,
  placement,
}: {
  children: ReactNode;
  className?: string;
  headingId: string;
  placement: LessonAIMentorPanelPlacement;
}) {
  return (
    <aside
      className={cn(
        "ce-lesson-ai-mentor ce-glass relative z-[1] min-w-0 max-w-full overflow-x-clip rounded-2xl border border-cyan/20",
        "bg-linear-to-br from-cyan/[0.05] via-card to-card p-4 shadow-sm ring-1 ring-inset ring-cyan/10 sm:p-5",
        placement === "inline" && "lg:hidden",
        placement === "sidebar" && "hidden lg:block",
        className,
      )}
      aria-labelledby={headingId}
    >
      {children}
    </aside>
  );
}

function PanelHeader({ headingId }: { headingId: string }) {
  return (
    <div className="flex items-start gap-3">
      <span
        className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-cyan/30 bg-cyan/10 text-cyan"
        aria-hidden
      >
        <Bot className="size-5" strokeWidth={1.75} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-cyan">
          Помощник урока
        </p>
        <h2 id={headingId} className="mt-0.5 font-display text-base font-semibold tracking-tight text-foreground">
          AI-наставник
        </h2>
      </div>
    </div>
  );
}

function GuardrailNote({ className }: { className?: string }) {
  return (
    <p
      className={cn(
        "flex gap-2 rounded-xl border border-border/70 bg-muted/20 px-3 py-2.5 text-xs leading-relaxed text-muted-foreground",
        className,
      )}
      role="note"
    >
      <Shield className="mt-0.5 size-3.5 shrink-0 text-success" aria-hidden />
      <span>{LESSON_MENTOR_GUARDRAIL}</span>
    </p>
  );
}

function ContextLine({ context }: { context: LessonMentorSafeContext }) {
  return (
    <p className="mt-2 text-xs leading-relaxed text-pretty text-muted-foreground">
      <span className="font-medium text-foreground/85">{context.topic}</span>
    </p>
  );
}

type QuickActionsProps = {
  disabled: boolean;
  onAction: (id: LessonMentorQuickActionId) => void;
};

function QuickActionsList({ disabled, onAction }: QuickActionsProps) {
  return (
    <ul
      className="ce-lesson-mentor-actions relative z-10 mt-4 flex min-w-0 flex-col gap-2"
      aria-label="Быстрые действия AI-наставника"
    >
      {LESSON_MENTOR_QUICK_ACTIONS.map((item) => (
        <QuickActionButton
          key={item.id}
          item={item}
          disabled={disabled}
          onClick={() => onAction(item.id)}
        />
      ))}
    </ul>
  );
}

function QuickActionButton({
  item,
  disabled,
  onClick,
}: {
  item: LessonMentorQuickAction;
  disabled: boolean;
  onClick: () => void;
}) {
  const Icon = item.icon;
  return (
    <li className="min-w-0">
      <button
        type="button"
        disabled={disabled}
        title={disabled ? undefined : item.description}
        className={cn(
          "flex w-full min-w-0 flex-col items-start gap-1.5 rounded-xl border border-border/80 px-3 py-3 text-left",
          "whitespace-normal transition-colors touch-manipulation",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          disabled
            ? "cursor-not-allowed opacity-55"
            : "bg-background/40 hover:border-cyan/35 hover:bg-cyan/[0.06] active:bg-cyan/10",
        )}
        onPointerDown={disabled ? undefined : preloadMentorChat}
        onClick={onClick}
      >
        <span className="flex w-full min-w-0 items-center gap-2">
          <Icon className="size-4 shrink-0 text-cyan" aria-hidden />
          <span className="min-w-0 text-sm font-semibold leading-snug text-foreground">{item.label}</span>
        </span>
        <span className="w-full min-w-0 text-xs font-normal leading-snug text-pretty text-muted-foreground">
          {item.description}
        </span>
      </button>
    </li>
  );
}

export function LessonAIMentorPanel({
  panelId = "lesson-ai-mentor",
  placement = "sidebar",
  allowAiAdaptation,
  aiConfigured,
  lessonLocked = false,
  aiBusy,
  context,
  onOpenMentorChat,
  className,
}: LessonAIMentorPanelProps) {
  const available = allowAiAdaptation && aiConfigured && !lessonLocked;
  const headingId = `${panelId}-heading`;

  useEffect(() => {
    if (available) preloadMentorChat();
  }, [available]);
  const unavailableHintId = `${panelId}-unavailable-hint`;
  const disabledHintId = `${panelId}-disabled-hint`;
  const lockedHintId = `${panelId}-locked-hint`;

  function handleQuickAction(id: LessonMentorQuickActionId) {
    if (!available) return;
    const action = LESSON_MENTOR_QUICK_ACTIONS.find((a) => a.id === id);
    if (!action) return;
    preloadMentorChat();
    onOpenMentorChat(action.mentorModeId, action.bootPrompt);
  }

  if (lessonLocked) {
    return (
      <PanelShell className={className} headingId={headingId} placement={placement}>
        <PanelHeader headingId={headingId} />
        <p
          className="mt-3 flex gap-2 rounded-lg border border-warning/30 bg-warning/[0.06] px-3 py-2.5 text-sm leading-relaxed text-foreground/90"
          role="status"
        >
          <Lock className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden />
          <span>{LESSON_MENTOR_LOCKED_MESSAGE}</span>
        </p>
        <ContextLine context={context} />
        <QuickActionsList disabled onAction={() => {}} />
        <Button
          type="button"
          variant="outline"
          className="mt-3 min-h-11 w-full touch-manipulation"
          disabled
          aria-describedby={lockedHintId}
        >
          Открыть чат наставника
        </Button>
        <p id={lockedHintId} className="sr-only">
          {LESSON_MENTOR_LOCKED_MESSAGE}
        </p>
        <GuardrailNote className="mt-4" />
      </PanelShell>
    );
  }

  if (!allowAiAdaptation) {
    return (
      <PanelShell className={className} headingId={headingId} placement={placement}>
        <PanelHeader headingId={headingId} />
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{LESSON_MENTOR_LESSON_DISABLED}</p>
        <ContextLine context={context} />
        <QuickActionsList disabled onAction={() => {}} />
        <Button
          type="button"
          variant="outline"
          className="mt-3 min-h-11 w-full touch-manipulation"
          disabled
          aria-describedby={disabledHintId}
        >
          Открыть чат наставника
        </Button>
        <p id={disabledHintId} className="sr-only">
          {LESSON_MENTOR_LESSON_DISABLED}
        </p>
        <GuardrailNote className="mt-4" />
      </PanelShell>
    );
  }

  if (!aiConfigured) {
    return (
      <PanelShell className={className} headingId={headingId} placement={placement}>
        <PanelHeader headingId={headingId} />
        <p
          className="mt-3 rounded-lg border border-dashed border-border/70 bg-muted/15 px-3 py-2.5 text-sm leading-relaxed text-muted-foreground"
          role="status"
        >
          {LESSON_MENTOR_UNAVAILABLE}
        </p>
        <ContextLine context={context} />
        <QuickActionsList disabled onAction={() => {}} />
        <Button
          type="button"
          variant="outline"
          className="mt-3 min-h-11 w-full touch-manipulation gap-2"
          disabled
          aria-describedby={unavailableHintId}
        >
          <Clock className="size-4 shrink-0 opacity-60" aria-hidden />
          Открыть чат наставника
        </Button>
        <p id={unavailableHintId} className="sr-only">
          {LESSON_MENTOR_UNAVAILABLE}
        </p>
        {placement === "inline" ? (
          <p className="mt-2 text-xs text-muted-foreground">
            На мобильном чат откроется в панели поверх страницы — как на других экранах курса.
          </p>
        ) : null}
        <GuardrailNote className="mt-4" />
      </PanelShell>
    );
  }

  return (
    <PanelShell className={className} headingId={headingId} placement={placement}>
      <PanelHeader headingId={headingId} />
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{LESSON_MENTOR_INTRO}</p>
      <ContextLine context={context} />

      <QuickActionsList disabled={!available} onAction={handleQuickAction} />

      <Button
        type="button"
        variant="secondary"
        className="mt-3 min-h-12 w-full touch-manipulation gap-2 border-cyan/25 bg-cyan/[0.06] hover:bg-cyan/10 focus-visible:ring-2 focus-visible:ring-ring"
        disabled={!available}
        onPointerDown={!available ? undefined : preloadMentorChat}
        onClick={() => onOpenMentorChat()}
      >
        <Sparkles className="size-4 text-cyan" aria-hidden />
        Открыть чат наставника
      </Button>

      {placement === "inline" ? (
        <p className="mt-2 text-xs text-muted-foreground">
          Чат откроется в выдвижной панели — контекст: только урок и модуль, без ответов теста.
        </p>
      ) : null}

      <GuardrailNote className="mt-4" />
    </PanelShell>
  );
}
