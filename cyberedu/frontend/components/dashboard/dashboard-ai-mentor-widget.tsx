"use client";

import Link from "next/link";
import { Bot, MessageSquare, Sparkles } from "lucide-react";
import {
  DASHBOARD_AI_WIDGET_INTRO,
  DASHBOARD_MENTOR_PAGE_PATH,
  buildDashboardAiWidgetQuickActions,
  buildDashboardAiWidgetSuggestedPrompts,
  buildDashboardWeakTopics,
  type DashboardAiWidgetQuickAction,
  type DashboardAiWidgetPrompt,
} from "@/lib/dashboard-ai-widget";
import type { ProfileCourseStats } from "@/lib/profile-course-stats";
import type { CourseProgressModuleRow } from "@/lib/progress";
import { Button } from "@/components/ui/button";
import { PremiumCard } from "@/components/ui/premium-card";
import { cn } from "@/lib/utils";

export type DashboardAIMentorWidgetProps = {
  stats: ProfileCourseStats;
  modules: CourseProgressModuleRow[];
  aiConfigured: boolean;
  onOpenChat: (prompt: string) => void;
  className?: string;
};

function QuickActionButton({
  action,
  disabled,
  onClick,
}: {
  action: DashboardAiWidgetQuickAction;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      disabled={disabled}
      title={action.description}
      className={cn(
        "ce-touch-target h-auto min-h-11 w-full touch-manipulation flex-col items-start gap-0.5 border-border/80 px-3 py-2.5 text-left",
        !disabled && "hover:border-cyan/35 hover:bg-cyan/[0.06]",
        disabled && "opacity-60",
      )}
      onClick={onClick}
    >
      <span className="text-sm font-semibold text-foreground">{action.label}</span>
      <span className="text-[11px] font-normal text-muted-foreground line-clamp-2">{action.description}</span>
    </Button>
  );
}

function SuggestedPromptChip({
  prompt,
  disabled,
  onSelect,
}: {
  prompt: DashboardAiWidgetPrompt;
  disabled: boolean;
  onSelect: () => void;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      disabled={disabled}
      className={cn(
        "h-auto min-h-9 max-w-full justify-start whitespace-normal px-2.5 py-2 text-left text-xs font-medium",
        disabled
          ? "opacity-60 text-muted-foreground"
          : "text-foreground/90 hover:bg-cyan/[0.08] hover:text-foreground",
      )}
      onClick={onSelect}
    >
      {prompt.label}
    </Button>
  );
}

export function DashboardAIMentorWidget({
  stats,
  modules,
  aiConfigured,
  onOpenChat,
  className,
}: DashboardAIMentorWidgetProps) {
  const weakTopics = buildDashboardWeakTopics(stats, modules);
  const quickActions = buildDashboardAiWidgetQuickActions(stats, modules, weakTopics);
  const suggested = buildDashboardAiWidgetSuggestedPrompts(weakTopics);
  const hasWeak = weakTopics.length > 0;
  const disabled = !aiConfigured;
  const defaultPrompt =
    quickActions.find((a) => a.id === "explain_module")?.prompt ??
    suggested[0]?.text ??
    "";

  return (
    <PremiumCard
      variant="accent"
      padding="md"
      className={cn(
        "min-w-0 border-cyan/20",
        disabled && "opacity-95",
        className,
      )}
      aria-labelledby="dashboard-ai-mentor-widget-heading"
      aria-disabled={disabled || undefined}
    >
      <div className="flex gap-3">
        <span
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-xl border border-cyan/30 bg-cyan/10 text-cyan",
            disabled && "opacity-60",
          )}
          aria-hidden
        >
          <Bot className="size-5" strokeWidth={1.75} />
        </span>
        <div className="min-w-0 flex-1">
          <h2
            id="dashboard-ai-mentor-widget-heading"
            className="font-display text-base font-semibold tracking-tight text-foreground"
          >
            AI-наставник
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-pretty text-muted-foreground">
            {DASHBOARD_AI_WIDGET_INTRO}
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {quickActions.map((action) => (
          <QuickActionButton
            key={action.id}
            action={action}
            disabled={disabled}
            onClick={() => onOpenChat(action.prompt)}
          />
        ))}
      </div>

      <div
        className={cn(
          "mt-4 rounded-xl border border-border/60 bg-muted/15 px-3 py-2.5",
          disabled && "opacity-80",
        )}
      >
        <p className="flex items-center gap-1.5 font-mono text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
          <Sparkles className="size-3 text-cyan" aria-hidden />
          {hasWeak ? "По слабым темам" : "Подсказки"}
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {suggested.map((item) => (
            <SuggestedPromptChip
              key={item.id}
              prompt={item}
              disabled={disabled}
              onSelect={() => onOpenChat(item.text)}
            />
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        <Button
          type="button"
          className={cn(
            "w-full min-h-10 touch-manipulation border-cyan/30 bg-cyan/10 text-cyan hover:bg-cyan/15",
            disabled && "opacity-60",
          )}
          disabled={disabled}
          onClick={() => onOpenChat(defaultPrompt)}
        >
          <MessageSquare className="size-4 shrink-0" aria-hidden />
          Открыть AI-наставника
        </Button>
        <Button
          asChild
          variant="ghost"
          size="sm"
          className={cn("w-full text-muted-foreground", disabled && "pointer-events-none opacity-50")}
        >
          <Link href={DASHBOARD_MENTOR_PAGE_PATH} tabIndex={disabled ? -1 : undefined}>
            Полная страница наставника
          </Link>
        </Button>
      </div>

      {disabled ? (
        <p className="mt-3 rounded-lg border border-border/70 bg-muted/20 px-3 py-2 text-xs text-muted-foreground" role="status">
          AI-наставник временно недоступен. Быстрые действия и чат будут доступны после настройки сервиса.
        </p>
      ) : null}
    </PremiumCard>
  );
}
