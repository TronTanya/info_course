"use client";

import Link from "next/link";
import { TrackableLink } from "@/components/analytics/trackable-link";
import { AnalyticsEvents } from "@/lib/analytics/events";
import { ArrowRight, Clock3, Map, PlayCircle, Sparkles } from "lucide-react";
import type { ProfileCourseStats } from "@/lib/profile-course-stats";
import {
  buildContinueLearningCard,
  buildDashboardWelcomeGreeting,
  DASHBOARD_WELCOME_STATUS_LABEL,
  DASHBOARD_WELCOME_TAGLINE,
  formatDashboardLastActivity,
  getDashboardWelcomeCourseStatus,
} from "@/lib/dashboard-ui";
import type { CourseProgressModuleRow } from "@/lib/progress";
import type { UiStatus } from "@/types/ui-status";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { cn } from "@/lib/utils";

const statusUi: Record<
  ReturnType<typeof getDashboardWelcomeCourseStatus>,
  UiStatus
> = {
  started: "pending",
  in_progress: "in_progress",
  almost_done: "warning",
  certificate_ready: "completed",
};

export function DashboardWelcomeHeader({
  displayName,
  stats,
  modules,
  className,
}: {
  displayName: string;
  stats: ProfileCourseStats;
  modules: CourseProgressModuleRow[];
  className?: string;
}) {
  const greeting = buildDashboardWelcomeGreeting(displayName);
  const courseStatus = getDashboardWelcomeCourseStatus(stats);
  const statusLabel = DASHBOARD_WELCOME_STATUS_LABEL[courseStatus];
  const lastActivity = formatDashboardLastActivity(stats);
  const continueCard = buildContinueLearningCard(stats, modules);

  return (
    <header
      className={cn(
        "ce-dashboard-welcome relative min-w-0 overflow-hidden rounded-3xl border border-cyan/25",
        "bg-linear-to-br from-cyan/14 via-card/90 to-cyan/5 p-5 shadow-glow sm:p-6 lg:p-7",
        className,
      )}
      aria-labelledby="dash-welcome-heading"
    >
      <div
        className="pointer-events-none absolute -left-24 -top-28 size-72 rounded-full bg-cyan/20 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-20 -right-16 size-64 rounded-full bg-cyan/12 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,color-mix(in_oklab,var(--cyan)_24%,transparent),transparent)]"
        aria-hidden
      />

      <div className="relative flex min-w-0 flex-col gap-5 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
        <div className="min-w-0 flex-1 space-y-3">
          <p className="typo-eyebrow text-cyan">Центр обучения</p>
          <h1
            id="dash-welcome-heading"
            className="font-display text-2xl font-semibold tracking-tight text-balance text-foreground sm:text-3xl lg:text-[2rem]"
          >
            {greeting}
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-pretty text-muted-foreground sm:text-base">
            {DASHBOARD_WELCOME_TAGLINE}
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-0.5">
            <StatusBadge status={statusUi[courseStatus]} label={statusLabel} />
            {stats.progressPercent > 0 && !stats.allModulesComplete ? (
              <span className="rounded-lg border border-border/70 bg-background/40 px-2.5 py-1 text-xs font-medium tabular-nums text-muted-foreground backdrop-blur-sm">
                {stats.progressPercent}% программы
              </span>
            ) : null}
            {courseStatus === "certificate_ready" ? (
              <span className="inline-flex items-center gap-1 rounded-lg border border-success/30 bg-success/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-success">
                <Sparkles className="size-3" aria-hidden />
                Финиш
              </span>
            ) : null}
          </div>

          {lastActivity ? (
            <p className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground sm:text-sm">
              <Clock3 className="size-3.5 shrink-0 text-cyan/80" aria-hidden />
              <span>
                Последняя активность:{" "}
                <time dateTime={stats.lastActivitySummary?.at}>{lastActivity}</time>
              </span>
            </p>
          ) : null}

          <p className="text-xs text-muted-foreground sm:text-sm">
            <span className="font-medium text-foreground">{stats.courseTitle}</span>
          </p>
        </div>

        <div className="flex w-full shrink-0 flex-col gap-2 lg:w-auto lg:min-w-[200px] lg:items-stretch">
          <Button
            asChild
            size="lg"
            className="ce-touch-target min-h-12 w-full touch-manipulation shadow-glow"
          >
            <TrackableLink
              href={continueCard.href}
              event={AnalyticsEvents.courseContinueClicked}
              analytics={{ source: "dashboard_welcome_continue" }}
            >
              <PlayCircle className="size-5" aria-hidden />
              Продолжить обучение
              <ArrowRight className="size-4 opacity-80" aria-hidden />
            </TrackableLink>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="ce-touch-target min-h-12 w-full border-cyan/30 bg-card/60 backdrop-blur-sm touch-manipulation hover:border-cyan/40 hover:bg-card/80"
          >
            <Link href="/dashboard/course">
              <Map className="size-5" aria-hidden />
              Открыть карту курса
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
