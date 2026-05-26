"use client";

import Link from "next/link";
import { Award, BookOpen, CheckCircle2, Circle, ClipboardCheck, FlaskConical, Layers } from "lucide-react";
import type { ProfileCourseStats } from "@/lib/profile-course-stats";
import { computeStepMetrics, getCertificateEligibility } from "@/lib/dashboard-ui";
import type { CourseProgressModuleRow } from "@/lib/progress";
import { CockpitWidget, CockpitWidgetHeader } from "@/components/dashboard/cockpit/cockpit-widget";
import { Button } from "@/components/ui/button";
import { MetricCard } from "@/components/ui/metric-card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { cn } from "@/lib/utils";

export function DashboardProgressOverview({
  stats,
  modules,
}: {
  stats: ProfileCourseStats;
  modules: CourseProgressModuleRow[];
}) {
  const steps = computeStepMetrics(modules);
  const eligibility = getCertificateEligibility(stats, steps);
  const modulesTotal = stats.totalModules || 1;

  return (
    <CockpitWidget
      variant="default"
      className="h-full"
      aria-labelledby="dash-progress-overview-heading"
    >
      <CockpitWidgetHeader
        titleId="dash-progress-overview-heading"
        eyebrow="Курс и сертификат"
        title="Прогресс программы"
      />

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
        <section className="min-w-0 space-y-4" aria-label="Прогресс курса">
          <div className="space-y-3">
            <p className="ce-cockpit-stat-value tabular-nums">{stats.progressPercent}%</p>
            <ProgressBar
              label="Общий прогресс"
              value={stats.progressPercent}
              max={100}
              tone={stats.progressPercent >= 100 ? "success" : "default"}
            />
          </div>
          <ul className="grid grid-cols-2 gap-2">
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
        </section>

        <section
          className="min-w-0 rounded-2xl border border-border/80 bg-muted/20 p-4 sm:p-5"
          aria-label="Сертификат"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 space-y-1">
              <h3 className="font-heading text-base font-semibold text-balance text-foreground">
                {eligibility.title}
              </h3>
              <p className="text-sm text-pretty text-muted-foreground wrap-anywhere">
                {eligibility.description}
              </p>
            </div>
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/8 text-primary">
              <Award className="size-5" aria-hidden />
            </span>
          </div>

          {!stats.certificateIssued ? (
            <ProgressBar
              className="mt-4"
              label="Модули программы"
              value={stats.completedModules}
              max={modulesTotal}
              tone={stats.allModulesComplete ? "success" : "default"}
            />
          ) : (
            <p className="mt-4 text-sm font-medium text-success">Все требования выполнены</p>
          )}

          <ul className="mt-4 space-y-2">
            {eligibility.requirements.map((req) => (
              <li key={req.label} className="flex min-w-0 items-start gap-2 text-sm">
                {req.met ? (
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
                ) : (
                  <Circle className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
                )}
                <span
                  className={cn(
                    "min-w-0 wrap-break-word",
                    req.met ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {req.label}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-5">
            <Button
              asChild
              variant={stats.certificateIssued || stats.canGenerateCertificate ? "primary" : "outline"}
              className="w-full sm:w-auto"
            >
              <Link href={eligibility.ctaHref}>{eligibility.ctaLabel}</Link>
            </Button>
          </div>
        </section>
      </div>
    </CockpitWidget>
  );
}
