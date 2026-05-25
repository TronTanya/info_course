import { TrackableLink } from "@/components/analytics/trackable-link";
import { AnalyticsEvents } from "@/lib/analytics/events";
import { ArrowRight, Sparkles } from "lucide-react";
import { CourseStepIcon } from "@/components/course/course-step-icon";
import {
  guestCourseNextStepCta,
  type CourseNextStep,
  type CourseNextStepKind,
} from "@/lib/course-next-step";
import type { CourseStepIconKind } from "@/lib/course-step-icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const kindIcons: Record<CourseNextStepKind, CourseStepIconKind | null> = {
  lesson: "lesson",
  test: "test",
  practice: "practice",
  module: "module",
  certificate: "certificate",
  empty: null,
};

export function NextStepCard({
  step,
  authenticated = true,
  className,
}: {
  step: CourseNextStep;
  authenticated?: boolean;
  className?: string;
}) {
  const guestCta = authenticated ? null : guestCourseNextStepCta();
  const href = guestCta?.href ?? step.href;
  const ctaLabel = guestCta?.ctaLabel ?? step.ctaLabel;
  const iconKind = kindIcons[step.kind];

  return (
    <section
      aria-labelledby="course-next-step-heading"
      className={cn(
        "ce-course-next-step ce-glass relative min-w-0 overflow-hidden rounded-2xl border p-4 sm:p-5 md:p-6",
        step.empty ? "border-border/80" : "border-primary/20 shadow-[0_0_32px_-10px_hsl(var(--primary)/0.2)]",
        className,
      )}
    >
      <div className="pointer-events-none absolute -left-10 top-0 size-40 rounded-full bg-primary/8 blur-3xl" aria-hidden />
      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 flex-1 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <p className="typo-eyebrow text-primary">Следующий шаг</p>
            <span className="rounded-md border border-border/80 bg-muted/30 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              {step.statusLabel}
            </span>
          </div>

          <div className="flex gap-4">
            {iconKind ? (
              <CourseStepIcon kind={iconKind} size="lg" status={step.empty ? "not_started" : "available"} />
            ) : (
              <span className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-border bg-muted/40 text-muted-foreground">
                <Sparkles className="size-5" strokeWidth={1.75} aria-hidden />
              </span>
            )}
            <div className="min-w-0 space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{step.typeLabel}</p>
              <h2
                id="course-next-step-heading"
                className="font-display text-lg font-semibold text-balance text-foreground [overflow-wrap:anywhere] sm:text-xl md:text-2xl"
              >
                {step.title}
              </h2>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{step.moduleTitle}</span>
              </p>
            </div>
          </div>

          <p className="max-w-2xl text-sm text-pretty leading-relaxed text-muted-foreground">{step.description}</p>

          <dl className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
            <div>
              <dt className="sr-only">Ориентировочное время</dt>
              <dd>
                <span className="text-subtle-foreground">Время: </span>
                <span className="font-medium text-foreground">{step.estimatedTime}</span>
              </dd>
            </div>
          </dl>
        </div>

        <Button
          asChild
          size="lg"
          className="min-h-12 w-full shrink-0 touch-manipulation text-base shadow-card sm:min-h-11 lg:w-auto lg:min-w-[12rem]"
        >
          <TrackableLink
            href={href}
            event={AnalyticsEvents.courseContinueClicked}
            analytics={{ source: "course_next_step" }}
          >
            {ctaLabel}
            <ArrowRight className="size-4" aria-hidden />
          </TrackableLink>
        </Button>
      </div>
    </section>
  );
}
