"use client";

import Link from "next/link";
import type { ProfileCourseStats } from "@/lib/profile-course-stats";
import { computeStepMetrics } from "@/lib/dashboard-ui";
import type { CourseProgressModuleRow } from "@/lib/progress";
import { MetricCard } from "@/components/ui/metric-card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { SectionHeader } from "@/components/ui/section-header";

export function DashboardProgressOverview({
  stats,
  modules,
  achievementsUnlocked,
  achievementsTotal,
}: {
  stats: ProfileCourseStats;
  modules: CourseProgressModuleRow[];
  achievementsUnlocked: number;
  achievementsTotal: number;
}) {
  const steps = computeStepMetrics(modules);
  const certLabel = stats.certificateIssued
    ? "Выдан"
    : stats.allModulesComplete
      ? "Доступен"
      : `${stats.modulesUntilCertificate} мод.`;

  return (
    <section className="space-y-5" aria-labelledby="dash-progress-heading">
      <SectionHeader
        title="Обзор прогресса"
        description="Что уже сделано и сколько осталось до финала."
      />
      <h2 id="dash-progress-heading" className="sr-only">
        Обзор прогресса
      </h2>
      <div className="ce-glass rounded-2xl p-5 sm:p-6">
        <ProgressBar
          label="Общий прогресс курса"
          value={stats.progressPercent}
          max={100}
          tone={stats.progressPercent >= 100 ? "success" : "default"}
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <MetricCard
          label="Лекции"
          value={steps.lessonsTotal > 0 ? `${steps.lessonsDone}/${steps.lessonsTotal}` : "—"}
          hint="Завершённые модули с лекцией"
        />
        <MetricCard
          label="Тесты"
          value={steps.testsTotal > 0 ? `${steps.testsDone}/${steps.testsTotal}` : "—"}
          hint="Сданные тесты по модулям"
        />
        <MetricCard
          label="Практика"
          value={steps.practiceTotal > 0 ? `${steps.practiceDone}/${steps.practiceTotal}` : "—"}
          hint="Выполненные лаборатории"
        />
        <MetricCard
          label="Баллы"
          value={stats.totalPoints}
          hint={stats.maxPossiblePoints > 0 ? `из ${stats.maxPossiblePoints}` : "По курсу"}
        />
        <MetricCard
          label="Сертификат"
          value={certLabel}
          hint={
            stats.certificateIssued
              ? stats.certificateNumber ?? "В кабинете"
              : "После всех модулей"
          }
        />
      </div>
      {achievementsTotal > 0 ? (
        <p className="typo-caption text-center sm:text-left">
          Достижения: {achievementsUnlocked} из {achievementsTotal} ·{" "}
          <Link href="/dashboard/profile" className="font-medium text-primary underline-offset-4 hover:underline">
            в профиле
          </Link>
        </p>
      ) : null}
    </section>
  );
}
