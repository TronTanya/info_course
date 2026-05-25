import { TrackableLink } from "@/components/analytics/trackable-link";
import { AnalyticsEvents } from "@/lib/analytics/events";
import { ArrowRight, Award } from "lucide-react";
import type { CoursePageSummary } from "@/lib/course-page-summary";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { ProgressRing } from "@/components/ui/progress-ring";
import { cn } from "@/lib/utils";

export function CourseHeader({
  summary,
  className,
}: {
  summary: CoursePageSummary;
  className?: string;
}) {
  const allDone = summary.modulesTotal > 0 && summary.modulesCompleted >= summary.modulesTotal;
  const ringTone = summary.progressPercent >= 100 ? "success" : "default";

  return (
    <header
      className={cn(
        "ce-course-header ce-glass relative min-w-0 overflow-hidden rounded-2xl border border-primary/20 p-4 sm:rounded-3xl sm:p-6 lg:p-8",
        "shadow-[0_0_48px_-12px_hsl(var(--primary)/0.22)]",
        className,
      )}
      aria-labelledby="course-header-title"
    >
      <div
        className="pointer-events-none absolute -right-16 -top-20 size-56 rounded-full bg-primary/10 blur-3xl"
        aria-hidden
      />
      <div className="relative grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(220px,280px)] lg:items-center lg:gap-8">
        <div className="min-w-0 space-y-4 sm:space-y-5">
          <Badge variant="primary" className="max-w-full font-mono text-[10px] uppercase tracking-wider">
            <span className="truncate">{summary.badge}</span>
          </Badge>

          <div className="min-w-0 space-y-2 sm:space-y-3">
            <h1
              id="course-header-title"
              className="typo-h1 text-balance text-xl leading-tight sm:text-2xl lg:text-3xl"
            >
              {summary.title}
            </h1>
            <p className="max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground [overflow-wrap:anywhere] sm:text-base">
              {summary.subtitle}
            </p>
          </div>

          <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            <Badge
              variant={summary.certificate.issued || summary.certificate.ready ? "success" : "outline"}
              className="max-w-full gap-1.5 self-start"
            >
              <Award className="size-3.5 shrink-0" aria-hidden />
              <span className="truncate">Сертификат: {summary.certificate.statusLabel}</span>
            </Badge>
            {!summary.certificate.ready && summary.certificate.remainingConditions > 0 ? (
              <span className="text-xs text-pretty text-muted-foreground">
                до выдачи — {summary.certificate.remainingConditions} из {summary.certificate.totalConditions} условий
              </span>
            ) : null}
          </div>

          <p className="text-sm text-muted-foreground lg:hidden">
            <span className="font-display text-2xl font-bold tabular-nums text-foreground">
              {summary.progressPercent}%
            </span>
            <span className="ml-2">общий прогресс</span>
          </p>

          <div className="hidden flex-col gap-2 lg:flex lg:flex-row lg:flex-wrap">
            <Button asChild size="lg" className="min-h-12 w-full shadow-card sm:w-auto">
              <TrackableLink
                href={summary.continue.href}
                event={AnalyticsEvents.courseContinueClicked}
                analytics={{ source: "course_header" }}
              >
                {summary.continue.label}
                <ArrowRight className="size-4" aria-hidden />
              </TrackableLink>
            </Button>
            <Button asChild size="lg" variant="outline" className="min-h-12 w-full border-primary/25 sm:w-auto">
              <TrackableLink
                href={summary.certificate.cta.href}
                event={AnalyticsEvents.certificateProgressOpened}
                analytics={{ source: "course_header" }}
              >
                <Award className="size-4" aria-hidden />
                {summary.certificate.cta.label}
              </TrackableLink>
            </Button>
          </div>
          <p className="hidden text-xs text-muted-foreground lg:block">{summary.continue.hint}</p>
        </div>

        <aside className="ce-glass hidden min-w-0 space-y-4 rounded-2xl border border-primary/20 p-5 lg:block">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="typo-label">Прогресс курса</p>
              <p className="mt-0.5 font-display text-4xl font-bold tabular-nums text-foreground">
                {summary.progressPercent}%
              </p>
            </div>
            <ProgressRing
              value={summary.progressPercent}
              tone={ringTone}
              size={88}
              strokeWidth={7}
              label={allDone ? "Готово" : "Курс"}
            />
          </div>
          <ProgressBar
            value={summary.progressPercent}
            max={100}
            label={`Модули: ${summary.modulesCompleted} / ${summary.modulesTotal}`}
            tone={allDone ? "success" : "default"}
          />
        </aside>
      </div>
    </header>
  );
}
