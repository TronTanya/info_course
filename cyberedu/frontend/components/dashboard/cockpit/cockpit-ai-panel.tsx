"use client";

import Link from "next/link";
import { Brain, MessageSquare, Sparkles, Terminal } from "lucide-react";
import { openMentorChat } from "@/lib/ai/mentor-ui/open";
import type { DashboardAiRecommendation } from "@/lib/dashboard-ui";
import type { ProfileCourseStats } from "@/lib/profile-course-stats";
import type { CourseProgressModuleRow } from "@/lib/progress";
import { CockpitWidget, CockpitWidgetHeader } from "@/components/dashboard/cockpit/cockpit-widget";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";

export function CockpitAiPanel({
  stats,
  modules,
  recommendation,
  delay = 0,
}: {
  stats: ProfileCourseStats;
  modules: CourseProgressModuleRow[];
  recommendation: DashboardAiRecommendation;
  delay?: number;
}) {
  const row = modules.find((m) => m.module.id === stats.currentModuleId);
  const modulePct = row?.progressPercent ?? 0;

  return (
    <div className="ce-cockpit-ai-rail flex flex-col gap-4">
      <CockpitWidget variant="accent" delay={delay} aria-labelledby="cockpit-ai-heading">
        <CockpitWidgetHeader
          eyebrow="AI-помощник"
          title="Наставник"
          action={
            <span className="flex size-9 items-center justify-center rounded-xl border border-cyan/25 bg-cyan/10 text-cyan">
              <Sparkles className="size-4" aria-hidden />
            </span>
          }
        />
        <p id="cockpit-ai-heading" className="sr-only">
          AI-наставник
        </p>
        <p className="text-sm leading-relaxed text-pretty text-muted-foreground">{recommendation.message}</p>
        {row ? (
          <div className="mt-4">
            <ProgressBar label={`Модуль ${row.module.orderNumber}`} value={modulePct} max={100} />
          </div>
        ) : null}
        <div className="mt-5 flex flex-col gap-2">
          <Button
            type="button"
            className="w-full rounded-2xl shadow-ce-glow-soft"
            onClick={() => openMentorChat()}
          >
            <MessageSquare className="size-4" aria-hidden />
            {recommendation.actionLabel}
          </Button>
          <Button asChild variant="outline" className="w-full rounded-2xl border-white/10 bg-white/3">
            <Link href={recommendation.mentorHref}>К материалам</Link>
          </Button>
        </div>
      </CockpitWidget>

      <CockpitWidget variant="terminal" delay={delay + 0.06} padding="md">
        <div className="flex items-center gap-2 text-cyan">
          <Terminal className="size-4" aria-hidden />
          <span className="font-mono text-2.5 uppercase tracking-wider">Система</span>
        </div>
        <div className="mt-3 space-y-2">
          <p className="ce-cockpit-terminal-line">
            <span className="ce-cockpit-terminal-prompt">mentor@soc</span>
            <span className="text-muted-foreground">:</span>
            <span className="text-primary">~/{stats.currentModuleId ? `module-${row?.module.orderNumber ?? "?"}` : "idle"}</span>
            <span className="text-muted-foreground"> $</span> status
          </p>
          <p className="ce-cockpit-terminal-line">
            <span className="ce-cockpit-terminal-ok">✓</span> course_sync · {stats.progressPercent}% готово
          </p>
          <p className="ce-cockpit-terminal-line">
            <span className="ce-cockpit-terminal-ok">✓</span> ai_context · открыто модулей:{" "}
            {modules.filter((m) => m.unlocked).length}
          </p>
          <p className="ce-cockpit-terminal-line text-primary/80">
            <span className="text-muted-foreground">{">"}</span> ожидание ввода
          </p>
        </div>
      </CockpitWidget>

      <CockpitWidget variant="default" delay={delay + 0.1} padding="md">
        <div className="flex items-center gap-3">
          <Brain className="size-5 text-primary" aria-hidden />
          <div>
            <p className="text-sm font-medium text-foreground">Контекст обучения</p>
            <p className="text-xs text-muted-foreground">{stats.courseTitle}</p>
          </div>
        </div>
      </CockpitWidget>
    </div>
  );
}
