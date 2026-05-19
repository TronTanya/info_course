"use client";

import Link from "next/link";
import { ArrowRight, PlayCircle } from "lucide-react";
import type { ProfileCourseStats } from "@/lib/profile-course-stats";
import { countPendingTasks, getContinueTarget } from "@/lib/dashboard-ui";
import type { CourseProgressModuleRow } from "@/lib/progress";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { SectionCard } from "@/components/ui/section-card";

export function DashboardContinueHero({
  stats,
  modules,
}: {
  stats: ProfileCourseStats;
  modules: CourseProgressModuleRow[];
}) {
  const target = getContinueTarget(stats, modules);
  const row = modules.find((m) => m.module.id === stats.currentModuleId);
  const modulePct = row?.progressPercent ?? 0;
  const pending = countPendingTasks(modules);

  return (
    <SectionCard variant="lab" flushTitle className="p-5 sm:p-6" aria-labelledby="dash-continue-heading">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 gap-4 sm:gap-5">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary sm:size-14">
            <PlayCircle className="size-7" strokeWidth={1.5} aria-hidden />
          </span>
          <div className="min-w-0 space-y-2">
            <p className="typo-eyebrow text-primary">Продолжить обучение</p>
            <h2 id="dash-continue-heading" className="font-display text-xl font-semibold text-balance text-foreground sm:text-2xl">
              {target.title}
            </h2>
            <p className="text-sm text-pretty text-muted-foreground sm:text-base">{target.subtitle}</p>
            {!stats.allModulesComplete && row ? (
              <div className="max-w-md pt-1">
                <ProgressBar label={`Модуль ${row.module.orderNumber}`} value={modulePct} max={100} />
              </div>
            ) : null}
            <p className="typo-caption">
              {stats.courseTitle}
              {pending > 0 ? ` · ${pending} ${pending === 1 ? "шаг" : pending < 5 ? "шага" : "шагов"} в очереди` : ""}
              {stats.lastActivitySummary
                ? ` · последняя активность: ${stats.lastActivitySummary.label.toLowerCase()}`
                : ""}
            </p>
          </div>
        </div>
        <Button asChild size="lg" className="w-full shrink-0 shadow-card lg:w-auto lg:min-w-[220px]">
          <Link href={target.href}>
            {target.label}
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </Button>
      </div>
    </SectionCard>
  );
}
