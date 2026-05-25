"use client";

import Link from "next/link";
import {
  Award,
  BookOpen,
  ClipboardCheck,
  FlaskConical,
  LayoutGrid,
  type LucideIcon,
} from "lucide-react";
import { type RecentActivityFeedItem } from "@/lib/recent-activity-feed";
import type { DashboardActivityType } from "@/types/dashboard-view-model";
import { PremiumCard } from "@/components/ui/premium-card";
import { cn } from "@/lib/utils";

export type RecentActivityFeedProps = {
  items: RecentActivityFeedItem[];
  compact?: boolean;
  className?: string;
};

const typeIcon: Record<DashboardActivityType, LucideIcon> = {
  lesson_completed: BookOpen,
  test_passed: ClipboardCheck,
  practice_submitted: FlaskConical,
  practice_approved: FlaskConical,
  certificate_issued: Award,
  module_opened: LayoutGrid,
};

function formatActivityWhen(iso: string): string {
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

function ActivityRow({ item, compact = false }: { item: RecentActivityFeedItem; compact?: boolean }) {
  const Icon = typeIcon[item.type];
  const when = formatActivityWhen(item.createdAt);
  const content = (
    <div
      className={cn(
        "flex gap-2.5 rounded-xl border border-border/70 bg-muted/15 transition-colors",
        compact ? "p-2" : "gap-3 p-3",
        item.href && "hover:border-primary/30 hover:bg-primary/[0.04]",
      )}
    >
      <span
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-xl border text-primary",
          item.type === "certificate_issued" && "border-success/30 bg-success/10 text-success",
          item.type === "test_passed" && "border-primary/25 bg-primary/10",
          item.type === "module_opened" && "border-cyan/25 bg-cyan/8",
          item.type === "practice_submitted" && "border-cyan/25 bg-cyan/8",
          item.type === "practice_approved" && "border-success/30 bg-success/10 text-success",
          (item.type === "lesson_completed" || !item.type) && "border-border/80 bg-muted/30",
        )}
        aria-hidden
      >
        <Icon className="size-4" strokeWidth={1.75} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="typo-label text-muted-foreground">{item.typeLabel}</p>
        <p className="mt-0.5 font-medium text-pretty text-foreground">{item.title}</p>
        {when ? (
          <time className="typo-caption mt-1 block" dateTime={item.createdAt}>
            {when}
          </time>
        ) : null}
      </div>
    </div>
  );

  if (!item.href) {
    return <li>{content}</li>;
  }

  return (
    <li>
      <Link
        href={item.href}
        className="block rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        {content}
      </Link>
    </li>
  );
}

export function RecentActivityFeed({ items, className, compact = false }: RecentActivityFeedProps) {
  if (items.length === 0) return null;

  return (
    <PremiumCard
      as="section"
      variant="default"
      padding={compact ? "sidebar" : "md"}
      className={cn("min-w-0", className)}
      aria-labelledby="recent-activity-feed-heading"
    >
      <h2 id="recent-activity-feed-heading" className="typo-eyebrow text-primary">
        Недавняя активность
      </h2>
      {!compact ? (
        <p className="mt-1 text-sm text-pretty text-muted-foreground">
          Последние шаги обучения — без служебных записей и данных безопасности.
        </p>
      ) : null}

      <ul
        className={cn("list-none space-y-1.5 p-0", compact ? "mt-2" : "mt-3 space-y-2")}
        aria-label="История обучения"
      >
        {items.slice(0, compact ? 3 : items.length).map((item) => (
          <ActivityRow key={item.id} item={item} compact={compact} />
        ))}
      </ul>
    </PremiumCard>
  );
}
