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

export type DashboardAiWidgetProps = {
  stats: ProfileCourseStats;
  modules: CourseProgressModuleRow[];
  aiConfigured: boolean;
  onOpenChat: (prompt: string) => void;
  compact?: boolean;
  className?: string;
};

const AI_WIDGET_DISABLED_HINT_ID = "dashboard-ai-widget-disabled-hint";

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
      title={disabled ? "AI-наставник временно недоступен на сервере" : action.description}
      aria-describedby={disabled ? AI_WIDGET_DISABLED_HINT_ID : undefined}
      className={cn(
        "ce-touch-target h-auto min-h-11 w-full touch-manipulation flex-col items-start gap-0.5 border-border/80 px-3 py-2.5 text-left",
        !disabled && "hover:border-cyan/35 hover:bg-cyan/[0.06]",
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
      title={disabled ? "AI-наставник временно недоступен на сервере" : undefined}
      aria-describedby={disabled ? AI_WIDGET_DISABLED_HINT_ID : undefined}
      className="h-auto min-h-9 max-w-full justify-start whitespace-normal px-2.5 py-2 text-left text-xs font-medium text-foreground/90 hover:bg-cyan/[0.08] hover:text-foreground"
      onClick={onSelect}
    >
      {prompt.label}
    </Button>
  );
}

export function DashboardAiWidget({
  stats,
  modules,
  aiConfigured,
  onOpenChat,
  compact = false,
  className,
}: DashboardAiWidgetProps) {
  const weakTopics = buildDashboardWeakTopics(stats, modules);
  const quickActions = buildDashboardAiWidgetQuickActions(stats, modules, weakTopics);
  const suggested = buildDashboardAiWidgetSuggestedPrompts(weakTopics);
  const hasWeak = weakTopics.length > 0;

  return (
    <PremiumCard
      as="section"
      variant="accent"
      padding={compact ? "sidebar" : "md"}
      className={cn("ce-dashboard-ai-widget min-w-0 border-cyan/20", compact && "ce-dashboard-ai-widget--compact", className)}
      aria-labelledby="dashboard-ai-widget-heading"
    >
      <div className="flex gap-2.5">
        <span
          className={cn(
            "flex shrink-0 items-center justify-center rounded-xl border border-cyan/30 bg-cyan/10 text-cyan",
            compact ? "size-9" : "size-10",
          )}
          aria-hidden
        >
          <Bot className={compact ? "size-4" : "size-5"} strokeWidth={1.75} />
        </span>
        <div className="min-w-0 flex-1">
          <h2
            id="dashboard-ai-widget-heading"
            className="font-display text-sm font-semibold tracking-tight text-foreground sm:text-base"
          >
            AI-наставник
          </h2>
          {!compact ? (
            <p className="mt-1.5 text-sm leading-relaxed text-pretty text-muted-foreground">
              {DASHBOARD_AI_WIDGET_INTRO}
            </p>
          ) : (
            <p className="mt-0.5 text-xs text-muted-foreground">Подсказки по курсу и тестам</p>
          )}
        </div>
      </div>

      {!compact ? (
        <div className="ce-dashboard-ai-quick-actions mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
          {quickActions.map((action) => (
            <QuickActionButton
              key={action.id}
              action={action}
              disabled={!aiConfigured}
              onClick={() => onOpenChat(action.prompt)}
            />
          ))}
        </div>
      ) : null}

      <div
        className={cn(
          "rounded-xl border border-border/60 bg-muted/15",
          compact ? "mt-3 px-3.5 py-2.5" : "mt-3 px-4 py-3",
        )}
      >
        <p className="flex items-center gap-1.5 font-mono text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
          <Sparkles className="size-3 text-cyan" aria-hidden />
          {hasWeak ? "По вашим слабым темам" : "С чего начать"}
        </p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {(compact ? suggested.slice(0, 2) : suggested).map((item) => (
            <SuggestedPromptChip
              key={item.id}
              prompt={item}
              disabled={!aiConfigured}
              onSelect={() => onOpenChat(item.text)}
            />
          ))}
        </div>
      </div>

      <div
        className={cn(
          "flex flex-col gap-2.5",
          compact ? "mt-3.5" : "mt-3",
          !compact && "sm:flex-row sm:flex-wrap",
        )}
      >
        <Button
          type="button"
          className={cn(
            "ce-touch-target w-full border-cyan/30 bg-cyan/10 text-cyan hover:bg-cyan/15 touch-manipulation",
            compact ? "min-h-10 text-sm" : "min-h-12 md:w-auto",
          )}
          disabled={!aiConfigured}
          aria-describedby={!aiConfigured ? AI_WIDGET_DISABLED_HINT_ID : undefined}
          onClick={() => onOpenChat(quickActions[0]?.prompt ?? suggested[0]?.text ?? "")}
        >
          <MessageSquare className="size-4" aria-hidden />
          Открыть чат
        </Button>
        {!compact ? (
          <Button
            asChild
            variant="outline"
            size="md"
            className="ce-touch-target min-h-12 w-full touch-manipulation md:w-auto"
          >
            <Link href={DASHBOARD_MENTOR_PAGE_PATH}>Страница наставника</Link>
          </Button>
        ) : null}
      </div>

      {!aiConfigured ? (
        <p
          id={AI_WIDGET_DISABLED_HINT_ID}
          className="mt-3 text-xs text-muted-foreground"
          role="status"
        >
          AI-наставник временно недоступен на сервере. Кнопки чата и подсказок отключены до восстановления
          сервиса.
        </p>
      ) : null}
    </PremiumCard>
  );
}
