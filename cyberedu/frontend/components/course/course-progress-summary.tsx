import type { ReactNode } from "react";
import { Award, TrendingUp } from "lucide-react";
import { CourseStepIcon } from "@/components/course/course-step-icon";
import type { CoursePageSummary } from "@/lib/course-page-summary";
import { CircularProgress } from "@/components/ui/circular-progress";
import { MetricCard } from "@/components/ui/metric-card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { cn } from "@/lib/utils";

function SummaryGlassCard({
  children,
  className,
  labelledBy,
}: {
  children: ReactNode;
  className?: string;
  labelledBy: string;
}) {
  return (
    <article
      className={cn(
        "ce-glass flex h-full min-w-0 flex-col rounded-2xl border border-primary/15 p-4 sm:p-5",
        "transition-colors hover:border-primary/25",
        className,
      )}
      aria-labelledby={labelledBy}
    >
      {children}
    </article>
  );
}

export function CourseProgressSummary({
  summary,
  className,
}: {
  summary: CoursePageSummary;
  className?: string;
}) {
  const { steps } = summary;
  const tone = summary.progressPercent >= 100 ? "success" : "default";
  const cert = summary.certificate;

  return (
    <section
      aria-labelledby="course-progress-summary-heading"
      className={cn("ce-course-progress-summary min-w-0", className)}
    >
      <h2 id="course-progress-summary-heading" className="sr-only">
        Сводка прогресса курса
      </h2>
      <p className="mb-3 text-sm font-medium text-foreground lg:sr-only">Сводка прогресса</p>
      <ul className="ce-course-progress-summary__grid">
        <li className="ce-course-progress-summary__progress min-w-0">
          <SummaryGlassCard labelledBy="course-summary-progress" className="p-3 sm:p-4 md:p-5">
            <p id="course-summary-progress" className="typo-eyebrow text-[10px] text-primary sm:text-xs">
              Прогресс курса
            </p>
            <div className="mt-2 flex flex-1 flex-col gap-3 sm:mt-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <div className="min-w-0 flex-1 space-y-2">
                <p className="font-display text-2xl font-bold tabular-nums tracking-tight text-foreground sm:text-3xl md:text-4xl">
                  {summary.progressPercent}
                  <span className="text-lg text-muted-foreground sm:text-xl md:text-2xl">%</span>
                </p>
                <ProgressBar
                  label="Завершение программы"
                  labelTruncate={false}
                  value={summary.progressPercent}
                  max={100}
                  tone={tone}
                />
              </div>
              <CircularProgress
                value={summary.progressPercent}
                size={64}
                strokeWidth={5}
                tone={tone}
                label="Курс"
                glow
                className="hidden shrink-0 self-center sm:block"
              />
            </div>
          </SummaryGlassCard>
        </li>

        <li className="ce-course-progress-summary__metric min-w-0">
          <SummaryGlassCard labelledBy="course-summary-modules" className="p-3 sm:p-4">
            <MetricCard
              variant="default"
              label="Модули"
              value={`${summary.modulesCompleted}/${summary.modulesTotal}`}
              hint="Завершено"
              icon={<CourseStepIcon kind="module" size="sm" status="available" />}
              className="h-full border-0 bg-transparent p-0"
            />
          </SummaryGlassCard>
        </li>

        <li className="ce-course-progress-summary__metric min-w-0">
          <SummaryGlassCard labelledBy="course-summary-lessons" className="p-3 sm:p-4">
            <MetricCard
              variant="cyan"
              label="Уроки"
              value={steps.lessonsTotal > 0 ? `${steps.lessonsDone}/${steps.lessonsTotal}` : "—"}
              hint="Пройдено"
              icon={<CourseStepIcon kind="lesson" size="sm" status="available" />}
              className="h-full border-0 bg-transparent p-0"
            />
          </SummaryGlassCard>
        </li>

        <li className="ce-course-progress-summary__metric min-w-0">
          <SummaryGlassCard labelledBy="course-summary-tests" className="p-3 sm:p-4">
            <MetricCard
              variant="accent"
              label="Тесты"
              value={steps.testsTotal > 0 ? `${steps.testsDone}/${steps.testsTotal}` : "—"}
              hint="Зачтено"
              icon={<CourseStepIcon kind="test" size="sm" status="available" />}
              className="h-full border-0 bg-transparent p-0"
            />
          </SummaryGlassCard>
        </li>

        <li className="ce-course-progress-summary__metric min-w-0">
          <SummaryGlassCard labelledBy="course-summary-practice" className="p-3 sm:p-4">
            <MetricCard
              variant="default"
              label="Практики"
              value={steps.practiceTotal > 0 ? `${steps.practiceDone}/${steps.practiceTotal}` : "—"}
              hint="Зачтено"
              icon={<CourseStepIcon kind="practice" size="sm" status="available" />}
              className="h-full border-0 bg-transparent p-0"
            />
          </SummaryGlassCard>
        </li>

        <li className="ce-course-progress-summary__certificate min-w-0">
          <SummaryGlassCard labelledBy="course-summary-certificate" className="p-3 sm:p-4 md:p-5">
            <div className="flex h-full min-w-0 flex-col">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p id="course-summary-certificate" className="typo-label whitespace-nowrap">
                    Сертификат
                  </p>
                  <p
                    className={cn(
                      "mt-1 text-lg font-semibold tracking-tight sm:text-xl",
                      cert.ready ? "text-emerald-400" : "text-foreground",
                    )}
                  >
                    {cert.statusLabel}
                  </p>
                  <p className="typo-caption mt-1 text-pretty leading-snug wrap-break-word">{cert.detail}</p>
                </div>
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary sm:size-10">
                  <Award className="size-4" aria-hidden />
                </span>
              </div>
              {!cert.ready && cert.remainingConditions > 0 ? (
                <p className="mt-3 flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
                  <TrendingUp className="size-3.5 shrink-0 text-primary" aria-hidden />
                  <span className="text-pretty leading-snug">
                    {cert.remainingConditions} из {cert.totalConditions} условий
                  </span>
                </p>
              ) : null}
            </div>
          </SummaryGlassCard>
        </li>
      </ul>
    </section>
  );
}
