"use client";

import Link from "next/link";
import { Clock, FlaskConical } from "lucide-react";
import type { DashboardPendingPracticeItem } from "@/lib/dashboard-ui";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PremiumCard } from "@/components/ui/premium-card";
import { StatusPill } from "@/components/ui/status-pill";
import { cn } from "@/lib/utils";

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

export function DashboardPendingPractices({ items }: { items: DashboardPendingPracticeItem[] }) {
  if (items.length === 0) {
    return (
      <PremiumCard
        as="section"
        variant="default"
        padding="md"
        className="flex h-full min-w-0 flex-col"
        aria-labelledby="dash-pending-practices-heading"
      >
        <h2 id="dash-pending-practices-heading" className="typo-eyebrow text-primary">
          Практики на проверке
        </h2>
        <EmptyState
          compact
          className="mt-3 flex-1"
          title="Нет работ в очереди"
          description="После отправки лабораторной здесь появится статус проверки — без доступа к тексту решения для других."
          action={
            <Button asChild size="sm" variant="outline">
              <Link href="/dashboard/my-assignments">Мои работы</Link>
            </Button>
          }
        />
      </PremiumCard>
    );
  }

  return (
    <PremiumCard
      as="section"
      variant="default"
      padding="md"
      className="flex h-full min-w-0 flex-col"
      aria-labelledby="dash-pending-practices-heading"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h2 id="dash-pending-practices-heading" className="typo-eyebrow text-primary">
          Практики на проверке
        </h2>
        <StatusPill status="in_progress" label={`${items.length} в очереди`} />
      </div>
      <p className="mt-2 text-sm text-pretty text-muted-foreground">
        Работы проверяются преподавателем. Откройте задание, чтобы увидеть статус и комментарии.
      </p>
      <ul className="mt-4 flex-1 space-y-2" aria-label="Практики на проверке">
        {items.map((item) => (
          <li key={item.id}>
            <div
              className={cn(
                "flex flex-col gap-3 rounded-xl border border-border/80 bg-muted/15 p-3 sm:flex-row sm:items-center sm:justify-between",
              )}
            >
              <div className="flex min-w-0 gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/8 text-primary">
                  <FlaskConical className="size-4" aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="font-medium text-foreground">{item.taskTitle}</p>
                  <p className="text-sm text-muted-foreground">{item.moduleTitle}</p>
                  <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className="rounded-md border border-border/70 bg-muted/30 px-2 py-0.5">{item.statusLabel}</span>
                    {item.at ? (
                      <span className="inline-flex items-center gap-1">
                        <Clock className="size-3" aria-hidden />
                        {formatSubmittedAt(item.at)}
                      </span>
                    ) : null}
                  </p>
                </div>
              </div>
              <Button asChild variant="outline" size="sm" className="w-full shrink-0 sm:w-auto">
                <Link href={item.href}>Открыть</Link>
              </Button>
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-4 pt-1">
        <Button asChild variant="ghost" size="sm" className="w-full sm:w-auto">
          <Link href="/dashboard/my-assignments">Все мои работы</Link>
        </Button>
      </div>
    </PremiumCard>
  );
}
