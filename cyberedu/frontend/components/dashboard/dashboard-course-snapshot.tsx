"use client";

import Link from "next/link";
import { Award, BookOpen, ClipboardCheck, FlaskConical } from "lucide-react";
import type { ProfileCourseStats } from "@/lib/profile-course-stats";
import { computeStepMetrics } from "@/lib/dashboard-ui";
import type { CourseProgressModuleRow } from "@/lib/progress";
import { CircularProgress } from "@/components/ui/circular-progress";
import { ProgressBar } from "@/components/ui/progress-bar";
import { SectionCard } from "@/components/ui/section-card";
import { cn } from "@/lib/utils";

export function DashboardCourseSnapshot({
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
  const tone = stats.progressPercent >= 100 ? "success" : "default";

  const certHint = stats.certificateIssued
    ? "Сертификат выдан"
    : stats.allModulesComplete
      ? "Можно оформить сертификат"
      : `${stats.modulesUntilCertificate} мод. до выдачи`;

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
      <SectionCard variant="default" flushTitle className="p-5 sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 flex-1 space-y-3">
            <p className="typo-eyebrow text-primary">Прогресс курса</p>
            <p className="font-display text-3xl font-bold tabular-nums text-foreground">{stats.progressPercent}%</p>
            <p className="text-sm text-muted-foreground">
              {stats.completedModules} из {stats.totalModules} модулей завершено
            </p>
            <ProgressBar
              label="Завершение программы"
              value={stats.progressPercent}
              max={100}
              tone={stats.progressPercent >= 100 ? "success" : "default"}
            />
          </div>
          <CircularProgress value={stats.progressPercent} size={100} strokeWidth={8} tone={tone} label="Курс" />
        </div>
        <dl className="mt-5 grid grid-cols-3 gap-2 border-t border-border/80 pt-4">
          <StepStat icon={BookOpen} done={steps.lessonsDone} total={steps.lessonsTotal} label="Лекции" />
          <StepStat icon={ClipboardCheck} done={steps.testsDone} total={steps.testsTotal} label="Тесты" />
          <StepStat icon={FlaskConical} done={steps.practiceDone} total={steps.practiceTotal} label="Практика" />
        </dl>
        {stats.maxPossiblePoints > 0 ? (
          <p className="mt-3 text-xs text-muted-foreground">
            Баллы: {stats.totalPoints} / {stats.maxPossiblePoints} ({stats.scoreSuccessPercent}%)
          </p>
        ) : null}
      </SectionCard>

      <SectionCard variant="default" flushTitle className="flex flex-col justify-between p-5 sm:p-6">
        <div>
          <p className="typo-eyebrow text-primary">Сертификат и достижения</p>
          <p className="mt-2 font-display text-lg font-semibold text-foreground">{certHint}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {stats.certificateIssued && stats.certificateNumber
              ? `Номер ${stats.certificateNumber}`
              : "Завершите все модули, чтобы получить документ с проверкой подлинности."}
          </p>
          {achievementsTotal > 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">
              Достижения:{" "}
              <span className="font-medium text-foreground">
                {achievementsUnlocked} / {achievementsTotal}
              </span>
            </p>
          ) : null}
        </div>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <Link
            href="/dashboard/certificate"
            className={cn(
              "inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-primary/25 bg-primary/10 px-4 text-sm font-semibold text-primary",
              "hover:bg-primary/15 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring",
            )}
          >
            <Award className="size-4" aria-hidden />
            Сертификат
          </Link>
          {achievementsTotal > 0 ? (
            <Link
              href="/dashboard/profile?tab=achievements"
              className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl border border-border px-4 text-sm font-medium text-foreground hover:bg-muted/50 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
            >
              Достижения
            </Link>
          ) : null}
        </div>
      </SectionCard>
    </div>
  );
}

function StepStat({
  icon: Icon,
  done,
  total,
  label,
}: {
  icon: typeof BookOpen;
  done: number;
  total: number;
  label: string;
}) {
  return (
    <div className="ce-polish-inset px-2 py-2 text-center">
      <Icon className="mx-auto size-4 text-primary" aria-hidden />
      <dd className="mt-1 text-sm font-semibold tabular-nums text-foreground">
        {total > 0 ? `${done}/${total}` : "—"}
      </dd>
      <dt className="text-2.5 uppercase tracking-wide text-muted-foreground">{label}</dt>
    </div>
  );
}
