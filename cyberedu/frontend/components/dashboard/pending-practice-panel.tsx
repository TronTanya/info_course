"use client";

import Link from "next/link";
import { Clock, FlaskConical, MessageSquare } from "lucide-react";
import {
  getPendingPracticeStatusClass,
  type PendingPracticePanelItem,
} from "@/lib/pending-practice-panel";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PremiumCard } from "@/components/ui/premium-card";
import { cn } from "@/lib/utils";

export type PendingPracticePanelProps = {
  items: PendingPracticePanelItem[];
  assignmentsHref?: string;
  className?: string;
};

function formatSubmittedAt(iso: string): string {
  try {
    return new Intl.DateTimeFormat("ru-RU", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return "";
  }
}

function PracticeStatusBadge({ item }: { item: PendingPracticePanelItem }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-lg border px-2.5 py-1 text-xs font-medium",
        getPendingPracticeStatusClass(item.status),
      )}
    >
      {item.statusLabel}
    </span>
  );
}

function PracticeRow({ item }: { item: PendingPracticePanelItem }) {
  const submittedLabel = formatSubmittedAt(item.submittedAt);

  return (
    <li>
      <div
        className={cn(
          "flex flex-col gap-3 rounded-xl border border-border/80 bg-muted/15 p-3 sm:flex-row sm:items-start sm:justify-between",
        )}
      >
        <div className="flex min-w-0 gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/8 text-primary">
            <FlaskConical className="size-4" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-foreground">{item.title}</p>
            <p className="text-sm text-muted-foreground">{item.moduleTitle}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <PracticeStatusBadge item={item} />
              {submittedLabel ? (
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="size-3 shrink-0" aria-hidden />
                  <time dateTime={item.submittedAt}>{submittedLabel}</time>
                </span>
              ) : null}
            </div>
            {item.studentFeedback ? (
              <p className="mt-2 flex gap-2 text-xs text-pretty text-muted-foreground">
                <MessageSquare className="mt-0.5 size-3.5 shrink-0 text-primary/70" aria-hidden />
                <span>{item.studentFeedback}</span>
              </p>
            ) : null}
          </div>
        </div>
        <Button
          asChild
          variant="outline"
          size="sm"
          className="w-full shrink-0 min-h-10 touch-manipulation sm:w-auto"
        >
          <Link href={item.href}>Посмотреть статус</Link>
        </Button>
      </div>
    </li>
  );
}

export function PendingPracticePanel({
  items,
  assignmentsHref = "/dashboard/my-assignments",
  className,
}: PendingPracticePanelProps) {
  return (
    <PremiumCard
      variant="default"
      padding="md"
      className={cn("flex h-full min-w-0 flex-col", className)}
      aria-labelledby="pending-practice-panel-heading"
    >
      <p id="pending-practice-panel-heading" className="typo-eyebrow text-primary">
        Практики на проверке
      </p>

      {items.length === 0 ? (
        <EmptyState
          compact
          className="mt-4 flex-1"
          icon={<FlaskConical className="size-5 opacity-70" aria-hidden />}
          title="Практики на проверке появятся после отправки лаборатории."
          terminalLine="practice --queue empty"
        />
      ) : (
        <>
          <p className="mt-2 text-sm text-pretty text-muted-foreground">
            Статус проверки и комментарии преподавателя — без служебных заметок и рубрик.
          </p>
          <ul className="mt-4 flex-1 space-y-2" aria-label="Практики на проверке">
            {items.map((item) => (
              <PracticeRow key={item.id} item={item} />
            ))}
          </ul>
          <div className="mt-4 border-t border-border/60 pt-4">
            <Button asChild variant="ghost" size="sm" className="w-full min-h-10 sm:w-auto">
              <Link href={assignmentsHref}>Все мои работы</Link>
            </Button>
          </div>
        </>
      )}
    </PremiumCard>
  );
}
