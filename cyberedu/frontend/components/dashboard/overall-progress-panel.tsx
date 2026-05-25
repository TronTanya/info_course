"use client";

import { BookOpen, ClipboardCheck, FlaskConical, Layers, TrendingUp } from "lucide-react";
import { CircularProgress } from "@/components/ui/circular-progress";
import { DashboardSectionEmptyState } from "@/components/dashboard/dashboard-page-states";
import { EmptyState } from "@/components/ui/empty-state";
import { MetricCard } from "@/components/ui/metric-card";
import { PremiumCard } from "@/components/ui/premium-card";
import { ProgressBar } from "@/components/ui/progress-bar";
import {
  formatMetricRatio,
  formatModulesUntilCertificateCopy,
  formatOverallProgressCourseCopy,
  hasOverallProgressData,
} from "@/lib/overall-progress-panel";
import type { DashboardProgress } from "@/types/dashboard-view-model";
import { cn } from "@/lib/utils";

export type OverallProgressPanelProps = {
  progress: DashboardProgress;
  /** Модулей до сертификата (из stats.modulesUntilCertificate). */
  modulesUntilCertificate?: number;
  /** false — показать empty «нет прогресса» при наличии модулей курса. */
  learningStarted?: boolean;
  /** Компактная вёрстка при завершённом курсе — меньше вертикальных отступов. */
  compact?: boolean;
  className?: string;
};

export function OverallProgressPanel({
  progress,
  modulesUntilCertificate = 0,
  learningStarted,
  compact = false,
  className,
}: OverallProgressPanelProps) {
  const courseConfigured = hasOverallProgressData(progress);
  const hasLearning = learningStarted ?? courseConfigured;
  const showNoProgressEmpty = courseConfigured && !hasLearning;
  const started = courseConfigured;
  const percentage = started ? progress.percentage : 0;
  const tone = percentage >= 100 ? "success" : "default";
  const courseCopy = formatOverallProgressCourseCopy(percentage);
  const certificateCopy = formatModulesUntilCertificateCopy(modulesUntilCertificate);

  return (
    <PremiumCard
      as="section"
      variant="glow"
      padding={compact ? "sidebar" : "md"}
      className={cn("ce-overall-progress-panel min-w-0", compact && "ce-overall-progress-panel--compact", className)}
      aria-labelledby="overall-progress-heading"
    >
      <h2 id="overall-progress-heading" className="typo-eyebrow text-primary">
        Общий прогресс
      </h2>

      <div
        className={cn(
          "grid min-w-0 sm:grid-cols-[1fr_auto] sm:items-center",
          compact ? "mt-2 gap-3" : "mt-4 gap-5",
        )}
      >
        <div className={cn("min-w-0", compact ? "space-y-2" : "space-y-3")}>
          <p
            className={cn(
              "font-display font-bold tabular-nums tracking-tight text-foreground",
              compact ? "text-2xl sm:text-3xl" : "text-3xl sm:text-4xl",
            )}
            aria-label={`Завершение программы: ${percentage} процентов`}
          >
            {percentage}
            <span className={cn("text-muted-foreground", compact ? "text-lg sm:text-xl" : "text-xl sm:text-2xl")} aria-hidden>
              %
            </span>
          </p>
          <ProgressBar
            label="Завершение программы"
            labelTruncate={false}
            value={percentage}
            max={100}
            tone={tone}
          />
          {started && !compact ? (
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">{courseCopy}</p>
              {certificateCopy ? <p className="text-xs text-muted-foreground">{certificateCopy}</p> : null}
            </div>
          ) : null}
        </div>
        <CircularProgress
          value={percentage}
          size={compact ? 80 : 96}
          strokeWidth={compact ? 5 : 6}
          tone={tone}
          label="Курс"
          glow={!compact}
          className="shrink-0 justify-self-center sm:justify-self-end"
        />
      </div>

      {showNoProgressEmpty ? (
        <div className="mt-5">
          <DashboardSectionEmptyState kind="no_progress" />
        </div>
      ) : !started ? (
        <EmptyState
          compact
          className="mt-5"
          icon={<TrendingUp className="size-5 opacity-70" aria-hidden />}
          title="Прогресс появится после начала обучения."
          terminalLine="progress --pending"
        />
      ) : (
        <ul
          className={cn(
            "ce-dashboard-progress-metrics grid grid-cols-2 lg:grid-cols-4 [&>li]:min-w-0",
            compact ? "mt-3 gap-1.5 sm:gap-2" : "mt-5 gap-2 sm:gap-3",
          )}
          aria-label="Статистика по шагам курса"
        >
          <li>
            <MetricCard
              variant="default"
              label="Модули"
              value={formatMetricRatio(progress.completedModules, progress.totalModules)}
              hint="Завершено"
              icon={<Layers className="size-4" aria-hidden />}
              className={cn("h-full", compact && "ce-metric-card--compact")}
            />
          </li>
          <li>
            <MetricCard
              variant="cyan"
              label="Уроки"
              value={formatMetricRatio(progress.completedLessons, progress.totalLessons)}
              hint="Пройдено"
              icon={<BookOpen className="size-4" aria-hidden />}
              className={cn("h-full", compact && "ce-metric-card--compact")}
            />
          </li>
          <li>
            <MetricCard
              variant="accent"
              label="Тесты"
              value={formatMetricRatio(progress.passedTests, progress.totalTests)}
              hint="Зачтено"
              icon={<ClipboardCheck className="size-4" aria-hidden />}
              className={cn("h-full", compact && "ce-metric-card--compact")}
            />
          </li>
          <li>
            <MetricCard
              variant="cyan"
              label="Практики"
              value={formatMetricRatio(progress.approvedPractices, progress.totalPractices)}
              hint="Одобрено"
              icon={<FlaskConical className="size-4" aria-hidden />}
              className={cn("h-full", compact && "ce-metric-card--compact")}
            />
          </li>
        </ul>
      )}
    </PremiumCard>
  );
}
