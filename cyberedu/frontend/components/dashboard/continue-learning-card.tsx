"use client";

import Link from "next/link";
import { TrackableLink } from "@/components/analytics/trackable-link";
import { AnalyticsEvents } from "@/lib/analytics/events";
import {
  Award,
  BookOpen,
  ClipboardCheck,
  FlaskConical,
  Layers,
  PlayCircle,
  type LucideIcon,
} from "lucide-react";
import type { ProfileCourseStats } from "@/lib/profile-course-stats";
import {
  buildContinueLearningCard,
  type DashboardContinueLearningCard as ContinueCardModel,
  type DashboardContinueStepKind,
} from "@/lib/dashboard-ui";
import type { CourseProgressModuleRow } from "@/lib/progress";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusPill } from "@/components/ui/status-pill";
import { cn } from "@/lib/utils";

type StepKind = DashboardContinueStepKind | "empty";

const kindMeta: Record<
  StepKind,
  { icon: LucideIcon; pill: "pending" | "in_progress" | "completed" }
> = {
  lesson: { icon: BookOpen, pill: "pending" },
  test: { icon: ClipboardCheck, pill: "in_progress" },
  practice: { icon: FlaskConical, pill: "in_progress" },
  certificate: { icon: Award, pill: "completed" },
  course: { icon: Layers, pill: "pending" },
  empty: { icon: BookOpen, pill: "pending" },
};

function ContinueLearningCardBody({
  card,
  className,
}: {
  card: ContinueCardModel;
  className?: string;
}) {
  const meta = kindMeta[card.kind];
  const Icon = meta.icon;

  if (card.empty) {
    return (
      <section
        className={cn(
          "ce-dashboard-continue relative min-w-0 overflow-hidden rounded-3xl border border-border/80",
          "bg-linear-to-br from-muted/30 via-card/95 to-primary/5 p-5 sm:p-6 lg:p-8",
          className,
        )}
        aria-labelledby="dash-continue-learning-heading"
      >
        <EmptyState
          title={card.title}
          description={card.description}
          action={
            <Button asChild size="lg" className="min-h-12 w-full sm:w-auto">
              <Link href={card.href}>{card.ctaLabel}</Link>
            </Button>
          }
        />
      </section>
    );
  }

  return (
    <section
      className={cn(
        "ce-dashboard-continue relative min-w-0 overflow-hidden rounded-3xl border border-cyan/25",
        "bg-linear-to-br from-cyan/12 via-card/95 to-cyan/6 p-5 shadow-glow sm:p-6 lg:p-8",
        className,
      )}
      aria-labelledby="dash-continue-learning-heading"
    >
      <div
        className="pointer-events-none absolute -right-16 -top-20 size-56 rounded-full bg-cyan/14 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-16 -left-12 size-48 rounded-full bg-cyan/10 blur-3xl"
        aria-hidden
      />

      <div className="relative flex min-w-0 flex-col gap-4 sm:gap-5 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:gap-5">
          <span
            className="flex size-14 shrink-0 items-center justify-center rounded-2xl border border-cyan/30 bg-cyan/10 text-cyan sm:size-16"
            aria-hidden
          >
            <Icon className="size-7 sm:size-8" strokeWidth={1.5} />
          </span>
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <p className="typo-eyebrow text-cyan">Продолжить обучение</p>
              <StatusPill status={meta.pill} label={card.statusLabel} aria-label={`Статус шага: ${card.statusLabel}`} />
            </div>
            <h2
              id="dash-continue-learning-heading"
              className="break-words font-display text-xl font-semibold text-balance text-foreground sm:text-2xl lg:text-3xl"
            >
              {card.title}
            </h2>
            <p className="text-sm font-medium text-foreground/90">{card.moduleTitle}</p>
            <p className="text-sm leading-relaxed text-pretty text-muted-foreground sm:text-base">
              {card.description}
            </p>
            {card.estimatedLabel ? (
              <p className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
                Примерно {card.estimatedLabel}
              </p>
            ) : null}
          </div>
        </div>
        <Button
          asChild
          size="lg"
          className="ce-touch-target w-full min-h-12 shrink-0 touch-manipulation shadow-glow lg:min-w-[240px]"
        >
          <TrackableLink
            href={card.href}
            event={AnalyticsEvents.courseContinueClicked}
            analytics={{ source: "dashboard_continue_learning" }}
          >
            <PlayCircle className="size-5" aria-hidden />
            {card.ctaLabel}
          </TrackableLink>
        </Button>
      </div>
    </section>
  );
}

export function ContinueLearningCard({
  stats,
  modules,
  className,
}: {
  stats: ProfileCourseStats;
  modules: CourseProgressModuleRow[];
  className?: string;
}) {
  const card = buildContinueLearningCard(stats, modules);
  return <ContinueLearningCardBody card={card} className={className} />;
}

/** @deprecated Используйте `ContinueLearningCard`. */
export const DashboardContinueLearningCard = ContinueLearningCard;
