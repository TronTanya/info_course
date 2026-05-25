"use client";

import Link from "next/link";
import { TrackableLink } from "@/components/analytics/trackable-link";
import { AnalyticsEvents } from "@/lib/analytics/events";
import { ArrowRight, PlayCircle, Sparkles } from "lucide-react";
import type { ProfileCourseStats } from "@/lib/profile-course-stats";
import { countPendingTasks, getContinueTarget } from "@/lib/dashboard-ui";
import type { CourseProgressModuleRow } from "@/lib/progress";
import { Button } from "@/components/ui/button";
import { CircularProgress } from "@/components/ui/circular-progress";
import { ProgressBar } from "@/components/ui/progress-bar";
import { cn } from "@/lib/utils";

export function DashboardContinueHero({
  stats,
  modules,
}: {
  stats: ProfileCourseStats;
  modules: CourseProgressModuleRow[];
}) {
  const target = getContinueTarget(stats, modules);
  const row = modules.find((m) => m.module.id === stats.currentModuleId) ?? modules.find((m) => m.unlocked && !m.moduleCompleted);
  const modulePct = row?.progressPercent ?? 0;
  const pending = countPendingTasks(modules);
  const tone = stats.progressPercent >= 100 ? "success" : "default";

  return (
    <section
      className={cn(
        "ce-landing-hero relative overflow-hidden rounded-3xl border border-primary/20 p-5 shadow-[var(--shadow-glow)] sm:p-6 lg:p-8",
        "bg-linear-to-br from-primary/14 via-card/95 to-cyan/8",
      )}
      aria-labelledby="dash-continue-heading"
    >
      <div
        className="pointer-events-none absolute -right-20 -top-24 size-64 rounded-full bg-primary/15 blur-3xl"
        aria-hidden
      />
      <div className="relative grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-10">
        <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:gap-6">
          <CircularProgress
            value={stats.progressPercent}
            size={104}
            strokeWidth={8}
            tone={tone}
            label="Курс"
            glow
            className="shrink-0 self-center sm:self-start"
          />
          <div className="min-w-0 flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <p className="typo-eyebrow text-primary">Продолжить обучение</p>
              {stats.allModulesComplete ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-success/30 bg-success/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-success">
                  <Sparkles className="size-3" aria-hidden />
                  Финиш
                </span>
              ) : null}
            </div>
            <h2
              id="dash-continue-heading"
              className="break-words font-display text-2xl font-semibold text-balance text-foreground sm:text-3xl"
            >
              {target.title}
            </h2>
            <p className="text-sm text-pretty text-muted-foreground sm:text-base">{target.subtitle}</p>
            <ProgressBar
              className="max-w-lg"
              label={`${stats.courseTitle} · ${stats.completedModules}/${stats.totalModules} модулей`}
              value={stats.progressPercent}
              max={100}
              tone={tone}
            />
            {!stats.allModulesComplete && row ? (
              <ProgressBar label={`Текущий модуль ${row.module.orderNumber}`} value={modulePct} max={100} />
            ) : null}
            <p className="typo-caption break-words text-pretty text-muted-foreground">
              {pending > 0
                ? `${pending} ${pending === 1 ? "шаг" : pending < 5 ? "шага" : "шагов"} в очереди`
                : "Очередь шагов пуста — откройте карту курса"}
              {stats.lastActivitySummary
                ? ` · ${stats.lastActivitySummary.label}: ${stats.lastActivitySummary.detail}`
                : ""}
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row lg:flex-col lg:items-stretch">
          <Button asChild size="lg" className="w-full min-h-12 shadow-[var(--shadow-glow)] lg:min-w-[240px]">
            <TrackableLink
              href={target.href}
              event={AnalyticsEvents.courseContinueClicked}
              analytics={{ source: "dashboard_continue" }}
            >
              <PlayCircle className="size-5" aria-hidden />
              {target.label}
              <ArrowRight className="size-4" aria-hidden />
            </TrackableLink>
          </Button>
          <Button asChild size="lg" variant="outline" className="w-full border-primary/30 bg-card/70 lg:min-w-[240px]">
            <Link href="/dashboard/course">Карта курса</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
