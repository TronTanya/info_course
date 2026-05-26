"use client";

import Link from "next/link";
import { AlertTriangle, Info } from "lucide-react";
import type { DashboardWeakTopic } from "@/lib/dashboard-ui";
import { CockpitWidget, CockpitWidgetHeader } from "@/components/dashboard/cockpit/cockpit-widget";
import { cn } from "@/lib/utils";

export function DashboardWeakTopics({ items }: { items: DashboardWeakTopic[] }) {
  if (items.length === 0) {
    return (
      <CockpitWidget variant="default">
        <CockpitWidgetHeader eyebrow="Аналитика" title="Рекомендуем повторить" />
        <p className="text-sm text-muted-foreground">
          Пока нет зафиксированных ошибок. Продолжайте по плану курса — сюда попадут незачтённые тесты и работы на
          доработке.
        </p>
        <Link
          href="/dashboard/course"
          className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
        >
          Карта курса
        </Link>
      </CockpitWidget>
    );
  }

  return (
    <CockpitWidget variant="default" aria-labelledby="dash-weak-heading">
      <CockpitWidgetHeader titleId="dash-weak-heading" eyebrow="Аналитика" title="Рекомендуем повторить" />
      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item.id}>
            <Link
              href={item.href}
              className={cn(
                "flex gap-3 rounded-xl border p-3 transition-colors",
                item.tone === "warning"
                  ? "border-warning/30 bg-warning/5 hover:bg-warning/10"
                  : "border-border/80 bg-muted/20 hover:bg-muted/35",
                "focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring",
              )}
            >
              <span
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-lg",
                  item.tone === "warning" ? "bg-warning/15 text-warning" : "bg-primary/10 text-primary",
                )}
                aria-hidden
              >
                {item.tone === "warning" ? <AlertTriangle className="size-4" /> : <Info className="size-4" />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-foreground">{item.title}</span>
                <span className="mt-0.5 block text-xs text-pretty text-muted-foreground">{item.reason}</span>
              </span>
              <span className="shrink-0 text-xs font-semibold text-primary">Повторить</span>
            </Link>
          </li>
        ))}
      </ul>
    </CockpitWidget>
  );
}
