"use client";

import Link from "next/link";
import { PlayCircle } from "lucide-react";
import type { ProfileCourseStats } from "@/lib/profile-course-stats";
import { getContinueTarget } from "@/lib/dashboard-ui";
import type { CourseProgressModuleRow } from "@/lib/progress";
import { GlassCard } from "@/components/ui/glass-card";
import { ProgressBar } from "@/components/ui/progress-bar";

export function DashboardContinueLearning({
  stats,
  modules,
}: {
  stats: ProfileCourseStats;
  modules: CourseProgressModuleRow[];
}) {
  const target = getContinueTarget(stats, modules);
  const row = modules.find((m) => m.module.id === stats.currentModuleId);
  const modulePct = row?.progressPercent ?? stats.progressPercent;

  return (
    <GlassCard glow className="p-5 sm:p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 gap-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-primary/25 bg-primary/10 text-primary">
            <PlayCircle className="size-6" strokeWidth={1.75} aria-hidden />
          </span>
          <div className="min-w-0 space-y-1">
            <p className="typo-eyebrow text-primary">Продолжить</p>
            <h2 className="font-display text-lg font-semibold text-foreground">{target.title}</h2>
            <p className="text-sm text-muted-foreground">{target.subtitle}</p>
            {row && !stats.allModulesComplete ? (
              <div className="max-w-md pt-2">
                <ProgressBar label="Прогресс модуля" value={modulePct} max={100} />
              </div>
            ) : null}
            {stats.lastActivitySummary ? (
              <p className="typo-caption pt-1">
                Последняя активность: {stats.lastActivitySummary.label} ·{" "}
                {new Date(stats.lastActivitySummary.at).toLocaleDateString("ru-RU", {
                  day: "numeric",
                  month: "short",
                })}
              </p>
            ) : null}
          </div>
        </div>
        <Link
          href={target.href}
          className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
        >
          Открыть шаг
        </Link>
      </div>
    </GlassCard>
  );
}
