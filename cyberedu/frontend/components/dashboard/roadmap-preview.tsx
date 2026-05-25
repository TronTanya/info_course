"use client";

import Link from "next/link";
import { CheckCircle2, Lock, PlayCircle } from "lucide-react";
import {
  ROADMAP_PREVIEW_COURSE_HREF,
  ROADMAP_PREVIEW_STATUS_LABELS,
  type RoadmapPreviewItem,
} from "@/lib/roadmap-preview";
import type { DashboardRoadmapItemStatus } from "@/types/dashboard-view-model";
import { statusBadge } from "@/lib/course-path-ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PremiumCard } from "@/components/ui/premium-card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { cn } from "@/lib/utils";

export type RoadmapPreviewProps = {
  items: RoadmapPreviewItem[];
  courseMapHref?: string;
  compact?: boolean;
  className?: string;
};

function moduleNumberTone(status: DashboardRoadmapItemStatus, isCurrent: boolean): string {
  if (isCurrent) return "border-primary/40 bg-primary/12 text-primary";
  switch (status) {
    case "completed":
      return "border-success/35 bg-success/10 text-success";
    case "in_progress":
      return "border-primary/35 bg-primary/10 text-primary";
    case "available":
      return "border-cyan/30 bg-cyan/8 text-foreground";
    case "locked":
    default:
      return "border-border bg-muted/40 text-muted-foreground";
  }
}

function RoadmapPreviewRow({ item, compact = false }: { item: RoadmapPreviewItem; compact?: boolean }) {
  const badge = statusBadge[item.status] ?? {
    variant: "outline" as const,
    label: ROADMAP_PREVIEW_STATUS_LABELS[item.status],
    className: undefined,
  };
  const showProgress =
    item.status !== "locked" && item.status !== "completed" && item.progressPercentage > 0;

  return (
    <li
      className={cn(
        "grid rounded-xl border sm:grid-cols-[auto_1fr_auto] sm:items-center",
        compact ? "gap-2 p-2.5 sm:gap-2.5" : "gap-3 p-3 sm:gap-4",
        item.isCurrent
          ? "border-primary/35 bg-primary/[0.06] ring-1 ring-primary/20"
          : item.status === "locked"
            ? "border-border/70 bg-muted/15"
            : "border-border/80 bg-card/50",
      )}
    >
      <div className="flex min-w-0 items-start gap-3 sm:contents">
        <span
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-xl border text-sm font-bold tabular-nums",
            moduleNumberTone(item.status, item.isCurrent),
          )}
          aria-hidden
        >
          {item.status === "completed" ? (
            <CheckCircle2 className="size-5" aria-hidden />
          ) : item.status === "locked" ? (
            <Lock className="size-4" aria-hidden />
          ) : (
            item.orderNumber
          )}
        </span>

        <div className="min-w-0 flex-1 sm:col-start-2">
          <div className="flex flex-wrap items-center gap-2">
            <p className="min-w-0 flex-1 text-sm font-semibold text-foreground">{item.title}</p>
            {item.isCurrent ? (
              <span className="shrink-0 rounded-md bg-primary/12 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                Сейчас
              </span>
            ) : null}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <Badge variant={badge.variant} className={badge.className}>
              {item.statusLabel}
            </Badge>
            <span className="text-xs tabular-nums text-muted-foreground">
              Модуль {item.orderNumber}
            </span>
          </div>
          {item.lockedReason ? (
            <p className="mt-2 text-xs text-pretty text-muted-foreground">{item.lockedReason}</p>
          ) : null}
          {showProgress ? (
            <ProgressBar
              className="mt-2 max-w-full"
              label="Прогресс модуля"
              value={item.progressPercentage}
              max={100}
            />
          ) : null}
        </div>
      </div>

      <div className="sm:col-start-3 sm:justify-self-end">
        {item.ctaDisabled ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled
            title={item.lockedReason ?? "Модуль пока недоступен"}
            aria-label={
              item.lockedReason
                ? `${item.ctaLabel}. ${item.lockedReason}`
                : `${item.ctaLabel}. Модуль пока недоступен`
            }
            className="ce-touch-target w-full min-h-12 touch-manipulation sm:min-h-10 sm:w-auto"
          >
            {item.ctaLabel}
          </Button>
        ) : (
          <Button
            asChild
            size="sm"
            variant={item.isCurrent ? "primary" : "outline"}
            className="ce-touch-target w-full min-h-12 touch-manipulation sm:min-h-10 sm:w-auto"
          >
            <Link href={item.href}>
              {item.status === "available" && item.ctaLabel === "Начать" ? (
                <PlayCircle className="mr-1.5 size-4 shrink-0" aria-hidden />
              ) : null}
              {item.ctaLabel}
            </Link>
          </Button>
        )}
      </div>
    </li>
  );
}

export function RoadmapPreview({
  items,
  courseMapHref = ROADMAP_PREVIEW_COURSE_HREF,
  compact = false,
  className,
}: RoadmapPreviewProps) {
  return (
    <PremiumCard
      as="section"
      variant="default"
      padding={compact ? "sidebar" : "md"}
      className={cn("ce-roadmap-preview min-w-0 overflow-x-clip", compact && "ce-roadmap-preview--compact", className)}
      aria-labelledby="roadmap-preview-heading"
    >
      <div className="min-w-0">
        <h2 id="roadmap-preview-heading" className="typo-eyebrow text-primary">
          Карта курса
        </h2>
        {!compact ? (
          <p className="mt-1 text-sm text-pretty text-muted-foreground">
            Ближайшие модули: завершённые, текущий и следующие шаги. Полная карта — на странице курса.
          </p>
        ) : null}
      </div>

      {items.length === 0 ? (
        <p className={cn("text-sm text-muted-foreground", compact ? "mt-2" : "mt-4")}>
          Модули курса пока не загружены.
        </p>
      ) : (
        <ol
          className={cn("list-none space-y-1.5 p-0", compact ? "mt-2" : "mt-4 space-y-2")}
          aria-label="Превью модулей курса"
        >
          {items.map((item) => (
            <RoadmapPreviewRow key={item.moduleId} item={item} compact={compact} />
          ))}
        </ol>
      )}

      <div className={cn("border-t border-border/60", compact ? "mt-3 pt-3" : "mt-4 pt-4")}>
        <Button
          asChild
          size="sm"
          variant="outline"
          className="ce-touch-target w-full min-h-12 touch-manipulation sm:min-h-10 sm:w-auto"
        >
          <Link href={courseMapHref}>Открыть карту курса</Link>
        </Button>
      </div>
    </PremiumCard>
  );
}
