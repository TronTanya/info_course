"use client";

import Link from "next/link";
import { Activity, BookOpen, ClipboardCheck, FlaskConical } from "lucide-react";
import type { DashboardActivityItem } from "@/lib/dashboard-ui";
import { CockpitWidget, CockpitWidgetHeader } from "@/components/dashboard/cockpit/cockpit-widget";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const kindIcon = {
  lesson: BookOpen,
  test: ClipboardCheck,
  practice: FlaskConical,
} as const;

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString("ru-RU", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function CockpitActivityFeed({
  items,
  delay = 0,
}: {
  items: DashboardActivityItem[];
  delay?: number;
}) {
  return (
    <CockpitWidget variant="terminal" delay={delay} id="cockpit-feed" aria-labelledby="cockpit-feed-heading">
      <p id="cockpit-feed-heading" className="sr-only">
        Лента активности
      </p>
      <CockpitWidgetHeader
        eyebrow="Лента SOC"
        title="Активность"
        action={
          <span className="inline-flex items-center gap-1.5 font-mono text-2.5 text-success">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-60 motion-reduce:animate-none" />
              <span className="relative size-1.5 rounded-full bg-success" />
            </span>
            live
          </span>
        }
      />
      {items.length === 0 ? (
        <div className="space-y-3 px-1">
          <p className="ce-cockpit-terminal-line">
            <span className="ce-cockpit-terminal-prompt">soc@cyberedu</span>
            <span className="text-muted-foreground"> $</span>{" "}
            <span className="ce-cockpit-terminal-cmd">await activity...</span>
          </p>
          <Button asChild size="sm" variant="outline" className="rounded-full">
            <Link href="/dashboard/course">Открыть курс</Link>
          </Button>
        </div>
      ) : (
        <ul className="max-h-70 space-y-1 overflow-y-auto pr-1" aria-label="Лента активности">
          {items.map((item, i) => {
            const Icon = kindIcon[item.kind];
            return (
              <li key={item.id}>
                <div className={cn("ce-cockpit-feed-item", i === 0 && "ce-cockpit-feed-item--live")}>
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                    <Icon className="size-4" strokeWidth={1.75} aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-mono text-2.5 uppercase tracking-wider text-primary">{item.label}</p>
                      {i === 0 ? <Activity className="size-3 text-success" aria-hidden /> : null}
                    </div>
                    <p className="mt-0.5 text-sm font-medium text-foreground">{item.detail}</p>
                    {item.meta ? <p className="text-xs text-muted-foreground">{item.meta}</p> : null}
                    <p className="mt-1 font-mono text-2.5 text-muted-foreground">{formatWhen(item.at)}</p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      {items.length > 0 ? (
        <p className="mt-3 text-center text-xs sm:text-left">
          <Link href="/dashboard/profile" className="font-medium text-primary hover:underline">
            Полная история →
          </Link>
        </p>
      ) : null}
    </CockpitWidget>
  );
}
