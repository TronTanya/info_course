"use client";

import { useId, useState, type ReactNode } from "react";
import { Bot, Clock, Shield, Sparkles } from "lucide-react";
import {
  buildPracticeMentorChatBoot,
  PRACTICE_MENTOR_ANSWER_RULES,
  PRACTICE_MENTOR_GUARDRAIL,
  PRACTICE_MENTOR_INTRO,
  PRACTICE_MENTOR_MAX_ARGUMENT_EXCERPT,
  PRACTICE_MENTOR_QUICK_ACTIONS,
  PRACTICE_MENTOR_UNAVAILABLE,
  type PracticeMentorChatBoot,
  type PracticeMentorQuickAction,
  type PracticeMentorQuickActionId,
  type PracticeMentorSafeContext,
} from "@/lib/practice-mentor-panel";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export type PracticeAIMentorPanelProps = {
  panelId?: string;
  aiConfigured: boolean;
  aiBusy?: boolean;
  context: PracticeMentorSafeContext;
  onOpenMentorChat: (boot: PracticeMentorChatBoot) => void;
  className?: string;
};

function PanelShell({
  children,
  className,
  headingId,
}: {
  children: ReactNode;
  className?: string;
  headingId: string;
}) {
  return (
    <aside
      className={cn(
        "ce-practice-ai-mentor ce-glass min-w-0 max-w-full overflow-x-clip rounded-2xl border border-cyan/20",
        "bg-linear-to-br from-cyan/[0.05] via-card to-card p-4 shadow-sm ring-1 ring-inset ring-cyan/10 sm:p-5",
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
          Помощник лаборатории
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
      <span>{PRACTICE_MENTOR_GUARDRAIL}</span>
    </p>
  );
}

function ContextLine({ context }: { context: PracticeMentorSafeContext }) {
  return (
    <div className="mt-2 space-y-2 text-xs leading-relaxed text-pretty break-words text-muted-foreground">
      <p>
        <span className="font-medium text-foreground/80">{context.moduleTitle}</span>
        <span aria-hidden> · </span>
        <span>{context.taskTitle}</span>
        <span className="block mt-0.5 text-muted-foreground/90">{context.taskTypeLabel}</span>
      </p>
      {context.scenarioSummary ? (
        <p className="rounded-lg border border-cyan/15 bg-cyan/[0.04] px-2.5 py-2">
          <span className="font-mono text-[9px] uppercase tracking-wider text-cyan/80">Сценарий</span>
          <span className="mt-1 block line-clamp-3">{context.scenarioSummary}</span>
        </p>
      ) : null}
      {context.publicInstructionsPreview ? (
        <p className="rounded-lg border border-border/60 bg-muted/15 px-2.5 py-2">
          <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
            Инструкции
          </span>
          <span className="mt-1 block line-clamp-4 whitespace-pre-line">
            {context.publicInstructionsPreview}
          </span>
        </p>
      ) : null}
    </div>
  );
}

function AnswerRulesNote() {
  return (
    <ul className="mt-3 space-y-1.5 text-[11px] leading-relaxed text-muted-foreground" role="list">
      {PRACTICE_MENTOR_ANSWER_RULES.map((line: string) => (
        <li key={line} className="flex gap-2">
          <span className="text-cyan" aria-hidden>
            ·
          </span>
          <span>{line}</span>
        </li>
      ))}
    </ul>
  );
}

function QuickActionButton({
  item,
  disabled,
  onClick,
}: {
  item: PracticeMentorQuickAction;
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
          "ce-touch-target h-auto min-h-12 w-full touch-manipulation flex-col items-start gap-1 border-border/80 px-3 py-3 text-left",
          disabled
            ? "cursor-not-allowed opacity-55"
            : "bg-background/40 hover:border-cyan/35 hover:bg-cyan/[0.06]",
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

export function PracticeAIMentorPanel({
  panelId = "practice-ai-mentor",
  aiConfigured,
  aiBusy = false,
  context,
  onOpenMentorChat,
  className,
}: PracticeAIMentorPanelProps) {
  const headingId = `${panelId}-heading`;
  const unavailableHintId = `${panelId}-unavailable-hint`;
  const draftId = useId();
  const [argumentDraft, setArgumentDraft] = useState("");

  const available = aiConfigured;
  const disabled = !available || aiBusy;

  function handleQuickAction(id: PracticeMentorQuickActionId) {
    if (disabled) return;
    const boot = buildPracticeMentorChatBoot(id, {
      argumentExcerpt: id === "check_argumentation" ? argumentDraft : undefined,
    });
    onOpenMentorChat(boot);
  }

  if (!aiConfigured) {
    return (
      <PanelShell className={className} headingId={headingId}>
        <PanelHeader headingId={headingId} />
        <p
          className="mt-3 rounded-lg border border-dashed border-border/70 bg-muted/15 px-3 py-2.5 text-sm leading-relaxed text-muted-foreground"
          role="status"
        >
          {PRACTICE_MENTOR_UNAVAILABLE}
        </p>
        <ContextLine context={context} />
        <ul className="mt-4 space-y-2" aria-label="Быстрые действия AI-наставника">
          {PRACTICE_MENTOR_QUICK_ACTIONS.map((item) => (
            <QuickActionButton key={item.id} item={item} disabled onClick={() => {}} />
          ))}
        </ul>
        <Button
          type="button"
          variant="outline"
          className="mt-3 min-h-11 w-full gap-2"
          disabled
          aria-describedby={unavailableHintId}
        >
          <Clock className="size-4 shrink-0 opacity-60" aria-hidden />
          Открыть чат наставника
        </Button>
        <p id={unavailableHintId} className="sr-only">
          {PRACTICE_MENTOR_UNAVAILABLE}
        </p>
        <GuardrailNote className="mt-4" />
      </PanelShell>
    );
  }

  return (
    <PanelShell className={className} headingId={headingId}>
      <PanelHeader headingId={headingId} />
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{PRACTICE_MENTOR_INTRO}</p>
      <ContextLine context={context} />
      <AnswerRulesNote />

      <div className="mt-4 space-y-2">
        <label htmlFor={draftId} className="text-xs font-medium text-foreground">
          Черновик для проверки аргументации{" "}
          <span className="font-normal text-muted-foreground">(необязательно)</span>
        </label>
        <Textarea
          id={draftId}
          value={argumentDraft}
          onChange={(e) => setArgumentDraft(e.target.value)}
          rows={3}
          maxLength={PRACTICE_MENTOR_MAX_ARGUMENT_EXCERPT}
          disabled={disabled}
          placeholder="Кратко опишите свой ход мысли — только для действия «Проверь мою аргументацию»."
          className="text-sm"
        />
        <p className="text-[11px] text-muted-foreground">
          Текст уходит в чат наставника только при нажатии на проверку аргументации. Не более{" "}
          {PRACTICE_MENTOR_MAX_ARGUMENT_EXCERPT} символов.
        </p>
      </div>

      <ul className="mt-4 space-y-2" aria-label="Быстрые действия AI-наставника">
        {PRACTICE_MENTOR_QUICK_ACTIONS.map((item) => (
          <QuickActionButton
            key={item.id}
            item={item}
            disabled={disabled}
            onClick={() => handleQuickAction(item.id)}
          />
        ))}
      </ul>

      <Button
        type="button"
        variant="secondary"
        className="ce-touch-target mt-3 min-h-12 w-full touch-manipulation gap-2 border-cyan/25 bg-cyan/[0.06] hover:bg-cyan/10 text-base"
        disabled={disabled}
        onClick={() =>
          onOpenMentorChat({
            prompt:
              "Помоги с этой практикой: задай один наводящий вопрос, чтобы я продвинулся сам, без готового решения.",
          })
        }
      >
        <Sparkles className="size-4 text-cyan" aria-hidden />
        Открыть чат наставника
      </Button>

      <GuardrailNote className="mt-4" />
    </PanelShell>
  );
}
