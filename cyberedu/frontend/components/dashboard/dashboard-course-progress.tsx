"use client";

import { BookOpen, ClipboardCheck, FlaskConical, Layers } from "lucide-react";
import type { ProfileCourseStats } from "@/lib/profile-course-stats";
import { computeStepMetrics } from "@/lib/dashboard-ui";
import type { CourseProgressModuleRow } from "@/lib/progress";
import { CircularProgress } from "@/components/ui/circular-progress";
import { MetricCard } from "@/components/ui/metric-card";
import { PremiumCard } from "@/components/ui/premium-card";
import { ProgressBar } from "@/components/ui/progress-bar";

export function DashboardCourseProgress({
  stats,
  modules,
}: {
  stats: ProfileCourseStats;
  modules: CourseProgressModuleRow[];
}) {
  const steps = computeStepMetrics(modules);
  const tone = stats.progressPercent >= 100 ? "success" : "default";

  return (
    <PremiumCard variant="glow" padding="md" className="h-full min-w-0" aria-labelledby="dash-course-progress-heading">
      <p id="dash-course-progress-heading" className="typo-eyebrow text-primary">
        Прогресс курса
      </p>
      <div className="mt-4 flex min-w-0 flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1 space-y-3">
          <p className="font-display text-4xl font-bold tabular-nums tracking-tight text-foreground">
            {stats.progressPercent}
            <span className="text-2xl text-muted-foreground">%</span>
          </p>
          <ProgressBar
            label="Завершение программы"
            labelTruncate={false}
            value={stats.progressPercent}
            max={100}
            tone={tone}
          />
          <p className="text-xs text-muted-foreground">
            Баллы: {stats.totalPoints}
            {stats.maxPossiblePoints > 0 ? ` / ${stats.maxPossiblePoints}` : ""}
            {stats.averageTestPercent != null ? ` · средний тест: ${stats.averageTestPercent}%` : ""}
          </p>
        </div>
        <CircularProgress
          value={stats.progressPercent}
          size={96}
          strokeWidth={7}
          tone={tone}
          label="Программа"
          glow
          className="shrink-0 self-center"
        />
      </div>
      <ul className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-2 lg:grid-cols-4 [&>li]:min-w-[8.5rem]">
        <li className="min-w-0">
          <MetricCard
            variant="default"
            label="Модули"
            value={`${stats.completedModules}/${stats.totalModules}`}
            hint="Завершено"
            icon={<Layers className="size-4" aria-hidden />}
            className="h-full"
          />
        </li>
        <li className="min-w-0">
          <MetricCard
            variant="cyan"
            label="Уроки"
            value={steps.lessonsTotal > 0 ? `${steps.lessonsDone}/${steps.lessonsTotal}` : "—"}
            hint="Лекции"
            icon={<BookOpen className="size-4" aria-hidden />}
            className="h-full"
          />
        </li>
        <li className="min-w-0">
          <MetricCard
            variant="accent"
            label="Тесты"
            value={steps.testsTotal > 0 ? `${steps.testsDone}/${steps.testsTotal}` : "—"}
            hint="Зачтено"
            icon={<ClipboardCheck className="size-4" aria-hidden />}
            className="h-full"
          />
        </li>
        <li className="min-w-0">
          <MetricCard
            variant="cyan"
            label="Практика"
            value={steps.practiceTotal > 0 ? `${steps.practiceDone}/${steps.practiceTotal}` : "—"}
            hint="Лаборатории"
            icon={<FlaskConical className="size-4" aria-hidden />}
            className="h-full"
          />
        </li>
      </ul>
    </PremiumCard>
  );
}
