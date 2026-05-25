import { ArrowRight, type LucideIcon } from "lucide-react";
import { TrackableLink } from "@/components/analytics/trackable-link";
import { AnalyticsEvents } from "@/lib/analytics/events";
import type { DashboardNextStepCard as NextStep } from "@/lib/dashboard-ui";
import { cn } from "@/lib/utils";

export function DashboardNextStepCard({
  card,
  sectionEyebrow,
  sectionIcon: SectionIcon,
}: {
  card: NextStep;
  sectionEyebrow: string;
  sectionIcon: LucideIcon;
}) {
  const disabled = card.empty;
  const ctaLabel =
    disabled
      ? "Карта курса"
      : card.kind === "lesson"
        ? "Открыть лекцию"
        : card.kind === "test"
          ? "К тесту"
          : "К практике";

  return (
    <article
      className={cn(
        "ce-glass ce-card-glow flex h-full min-h-[12.5rem] flex-col rounded-2xl border p-5 sm:p-6",
        disabled ? "border-border/80 opacity-95" : "border-primary/15",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="typo-eyebrow text-primary">{sectionEyebrow}</p>
        <span className="rounded-md border border-border/80 bg-muted/30 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          {card.statusLabel}
        </span>
      </div>
      <div className="mt-4 flex flex-1 flex-col gap-3">
        <div className="flex gap-3">
          <span
            className={cn(
              "flex size-11 shrink-0 items-center justify-center rounded-xl border",
              disabled ? "border-border bg-muted/40 text-muted-foreground" : "border-primary/25 bg-primary/10 text-primary",
            )}
          >
            <SectionIcon className="size-5" strokeWidth={1.75} aria-hidden />
          </span>
          <div className="min-w-0">
            <h3 className="font-display text-lg font-semibold leading-snug text-balance text-foreground">{card.title}</h3>
            <p className="mt-1 text-sm text-pretty text-muted-foreground">{card.moduleTitle}</p>
          </div>
        </div>
        <TrackableLink
          href={card.href}
          event={
            card.kind === "lesson"
              ? AnalyticsEvents.lessonOpened
              : card.kind === "practice"
                ? AnalyticsEvents.practiceOpened
                : AnalyticsEvents.courseContinueClicked
          }
          analytics={{
            source:
              card.kind === "lesson"
                ? "dashboard_next_lesson"
                : card.kind === "practice"
                  ? "dashboard_next_practice"
                  : "dashboard_next_test",
          }}
          className={cn(
            "mt-auto inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold sm:w-auto",
            disabled
              ? "border-border bg-muted/30 text-muted-foreground"
              : "border-primary/30 bg-primary text-primary-foreground shadow-card hover:brightness-110",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          )}
        >
          {ctaLabel}
          <ArrowRight className="size-4" aria-hidden />
        </TrackableLink>
      </div>
    </article>
  );
}
