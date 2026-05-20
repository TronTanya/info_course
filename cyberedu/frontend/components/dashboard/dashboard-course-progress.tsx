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
        Course progress
      </p>
      <div className="mt-4 flex min-w-0 flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-5">
        <div className="min-w-0 flex-1 basis-[12rem] space-y-3">
          <p className="font-display text-3xl font-bold tabular-nums text-foreground">{stats.progressPercent}%</p>
          <ProgressBar
            label="Общий прогресс"
            value={stats.progressPercent}
            max={100}
            tone={stats.progressPercent >= 100 ? "success" : "default"}
          />
        </div>
        <CircularProgress
          value={stats.progressPercent}
          size={88}
          strokeWidth={7}
          tone={tone}
          label="Курс"
          glow
          className="shrink-0 self-center sm:self-auto"
        />
      </div>
      <ul className="mt-5 grid grid-cols-2 gap-2">
        <li>
          <MetricCard
            variant="default"
            label="Модули"
            value={`${stats.completedModules}/${stats.totalModules}`}
            hint="Завершено"
            icon={<Layers className="size-4" aria-hidden />}
            className="h-full"
          />
        </li>
        <li>
          <MetricCard
            variant="cyan"
            label="Уроки"
            value={steps.lessonsTotal > 0 ? `${steps.lessonsDone}/${steps.lessonsTotal}` : "—"}
            hint="Лекции"
            icon={<BookOpen className="size-4" aria-hidden />}
            className="h-full"
          />
        </li>
        <li>
          <MetricCard
            variant="accent"
            label="Тесты"
            value={steps.testsTotal > 0 ? `${steps.testsDone}/${steps.testsTotal}` : "—"}
            hint="Зачтено"
            icon={<ClipboardCheck className="size-4" aria-hidden />}
            className="h-full"
          />
        </li>
        <li>
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
