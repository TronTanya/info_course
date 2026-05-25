import Link from "next/link";
import { AlertTriangle, BookOpen, Info, Sparkles } from "lucide-react";
import type { CourseProgressModuleRow } from "@/lib/progress";
import type { ProfileCourseStats } from "@/lib/profile-course-stats";
import {
  buildWeakTopicPanelItems,
  getFirstAvailableTestHref,
  WEAK_TOPICS_EMPTY,
  type WeakTopicPanelItem,
} from "@/lib/weak-topics-panel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SectionCard } from "@/components/ui/section-card";
import { cn } from "@/lib/utils";

export type WeakTopicsPanelProps = {
  /** Готовые карточки; если не переданы — собираются из stats + modules. */
  items?: WeakTopicPanelItem[];
  stats?: ProfileCourseStats | null;
  modules?: CourseProgressModuleRow[];
  className?: string;
};

function resolveItems(props: WeakTopicsPanelProps): WeakTopicPanelItem[] {
  if (props.items) return props.items;
  if (props.stats && props.modules) return buildWeakTopicPanelItems(props.stats, props.modules);
  return [];
}

function WeakTopicCard({ item }: { item: WeakTopicPanelItem }) {
  const isWarning = item.tone === "warning";

  return (
    <li>
      <article
        className={cn(
          "flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between",
          isWarning
            ? "border-warning/30 bg-warning/5"
            : "border-border/80 bg-muted/20",
        )}
        aria-label={isWarning ? `Требует внимания: ${item.title}` : `Рекомендация: ${item.title}`}
      >
        <div className="flex min-w-0 gap-3">
          <span
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-xl border",
              isWarning ? "border-warning/35 bg-warning/10 text-warning" : "border-primary/25 bg-primary/10 text-primary",
            )}
            aria-hidden
          >
            {isWarning ? <AlertTriangle className="size-5" /> : <Info className="size-5" />}
          </span>
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-semibold text-foreground">
                <span className="sr-only">Тема: </span>
                {item.title}
              </h3>
              <Badge variant="outline" className="text-[10px] font-normal text-muted-foreground">
                {item.difficulty}
              </Badge>
            </div>
            <p className="text-sm text-pretty leading-relaxed text-muted-foreground">{item.reason}</p>
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <BookOpen className="size-3.5 shrink-0 text-primary" aria-hidden />
              <span>
                Связанный урок:{" "}
                <Link
                  href={item.lessonHref}
                  className="font-medium text-foreground underline-offset-4 hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                >
                  {item.lessonTitle}
                </Link>
              </span>
            </p>
          </div>
        </div>
        <Button
          asChild
          variant={isWarning ? "primary" : "outline"}
          size="sm"
          className="min-h-12 w-full shrink-0 touch-manipulation sm:min-h-10 sm:w-auto"
        >
          <Link href={item.href}>{item.ctaLabel}</Link>
        </Button>
      </article>
    </li>
  );
}

function WeakTopicsEmptyState({ firstTestHref }: { firstTestHref: string | null }) {
  return (
    <div className="flex flex-col items-center gap-4 py-4 text-center sm:py-6">
      <span
        className="flex size-12 items-center justify-center rounded-2xl border border-dashed border-border/80 bg-muted/25 text-muted-foreground"
        aria-hidden
      >
        <Sparkles className="size-6 opacity-70" />
      </span>
      <div className="max-w-sm space-y-2">
        <p className="text-sm text-pretty text-muted-foreground">{WEAK_TOPICS_EMPTY.line1}</p>
        <p className="text-sm text-pretty text-muted-foreground">{WEAK_TOPICS_EMPTY.line2}</p>
      </div>
      {firstTestHref ? (
        <Button asChild variant="outline" size="sm">
          <Link href={firstTestHref}>К первому тесту</Link>
        </Button>
      ) : (
        <Button asChild variant="outline" size="sm">
          <Link href="/dashboard/course">Карта курса</Link>
        </Button>
      )}
    </div>
  );
}

export function WeakTopicsPanel({ items: itemsProp, stats, modules = [], className }: WeakTopicsPanelProps) {
  const items = resolveItems({ items: itemsProp, stats, modules });
  const firstTestHref = getFirstAvailableTestHref(modules);

  if (items.length === 0) {
    return (
      <SectionCard variant="muted" flushTitle className={cn("h-full p-5 sm:p-6", className)}>
        <h2 className="typo-eyebrow text-primary">{WEAK_TOPICS_EMPTY.title}</h2>
        <WeakTopicsEmptyState firstTestHref={firstTestHref} />
      </SectionCard>
    );
  }

  return (
    <SectionCard
      variant="default"
      flushTitle
      className={cn("h-full p-5 sm:p-6", className)}
      aria-labelledby="weak-topics-panel-heading"
    >
      <h2 id="weak-topics-panel-heading" className="typo-eyebrow text-primary">
        Слабые темы и рекомендации
      </h2>
      <p className="mt-1 text-xs text-muted-foreground">
        На основе незачтённых тестов, практики на доработке и вашего прогресса по курсу.
      </p>
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <WeakTopicCard key={item.id} item={item} />
        ))}
      </ul>
    </SectionCard>
  );
}
