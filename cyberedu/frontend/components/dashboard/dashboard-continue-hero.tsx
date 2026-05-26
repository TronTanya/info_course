"use client";

import Link from "next/link";
import { ArrowRight, PlayCircle } from "lucide-react";
import type { ProfileCourseStats } from "@/lib/profile-course-stats";
import { countPendingTasks, getContinueTarget, getNextLessonCard } from "@/lib/dashboard-ui";
import type { CourseProgressModuleRow } from "@/lib/progress";
import { CockpitWidget } from "@/components/dashboard/cockpit/cockpit-widget";
import { MobileImmersiveCard } from "@/components/mobile";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";

export function DashboardContinueHero({
  stats,
  modules,
}: {
  stats: ProfileCourseStats;
  modules: CourseProgressModuleRow[];
}) {
  const target = getContinueTarget(stats, modules);
  const nextLesson = getNextLessonCard(modules);
  const row = modules.find((m) => m.module.id === stats.currentModuleId) ?? modules.find((m) => m.unlocked && !m.moduleCompleted);
  const modulePct = row?.progressPercent ?? 0;
  const pending = countPendingTasks(modules);

  return (
    <MobileImmersiveCard className="lg:contents" delay={0.02}>
    <CockpitWidget variant="mission" padding="md" animate={false} aria-labelledby="dash-continue-heading">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 gap-4 sm:gap-5">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-primary/8 text-primary sm:size-14">
            <PlayCircle className="size-7" strokeWidth={1.5} aria-hidden />
          </span>
          <div className="min-w-0 space-y-2">
            <p className="ce-cockpit-eyebrow">Продолжить обучение</p>
            <h2
              id="dash-continue-heading"
              className="wrap-break-word font-heading text-xl font-semibold text-balance text-foreground sm:text-2xl"
            >
              {target.title}
            </h2>
            <p className="text-sm text-pretty text-muted-foreground sm:text-base">{target.subtitle}</p>
            {nextLesson && !nextLesson.empty ? (
              <p className="text-sm text-foreground">
                Следующий урок:{" "}
                <span className="font-medium">{nextLesson.moduleTitle}</span>
                <span className="text-muted-foreground"> · {nextLesson.statusLabel}</span>
              </p>
            ) : null}
            {!stats.allModulesComplete && row ? (
              <div className="max-w-md pt-1">
                <ProgressBar label={`Модуль ${row.module.orderNumber}`} value={modulePct} max={100} />
              </div>
            ) : null}
            <p className="typo-caption wrap-break-word text-pretty">
              {stats.courseTitle}
              {pending > 0 ? ` · ${pending} ${pending === 1 ? "шаг" : pending < 5 ? "шага" : "шагов"} в очереди` : ""}
              {stats.lastActivitySummary
                ? ` · последняя активность: ${stats.lastActivitySummary.label.toLowerCase()}`
                : ""}
            </p>
          </div>
        </div>
        <Button asChild size="lg" className="w-full shrink-0 rounded-2xl lg:w-auto lg:min-w-55">
          <Link href={target.href}>
            {target.label}
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </Button>
      </div>
    </CockpitWidget>
    </MobileImmersiveCard>
  );
}
