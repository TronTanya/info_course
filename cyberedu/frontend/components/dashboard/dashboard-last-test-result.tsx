"use client";

import Link from "next/link";
import { ArrowRight, ClipboardCheck } from "lucide-react";
import type { DashboardLastTestResult } from "@/lib/dashboard-ui";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { CockpitWidget, CockpitWidgetHeader } from "@/components/dashboard/cockpit/cockpit-widget";
import { StatusPill } from "@/components/ui/status-pill";
import { cn } from "@/lib/utils";

function formatWhen(iso: string): string {
  try {
    return new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(
      new Date(iso),
    );
  } catch {
    return "";
  }
}

export function DashboardLastTestResult({ result }: { result: DashboardLastTestResult | null }) {
  if (!result) {
    return (
      <CockpitWidget variant="terminal" className="h-full">
        <EmptyState
          compact
          title="Тестов ещё не было"
          description="После первой попытки здесь появится балл и подсказки, что повторить."
          action={
            <Button asChild size="sm" variant="outline">
              <Link href="/dashboard/course">К курсу</Link>
            </Button>
          }
        />
      </CockpitWidget>
    );
  }

  return (
    <CockpitWidget variant="terminal" className="flex h-full min-w-0 flex-col" aria-labelledby="dash-test-heading">
      <CockpitWidgetHeader
        titleId="dash-test-heading"
        eyebrow="Журнал тестов"
        title="Последний тест"
        action={
          <StatusPill status={result.passed ? "completed" : "error"} label={result.passed ? "Зачёт" : "Не зачтён"} />
        }
      />
      <div className="flex min-w-0 flex-col gap-1 sm:flex-row sm:flex-wrap sm:items-baseline sm:gap-x-2 sm:gap-y-1">
        <span
          className={cn(
            "ce-cockpit-stat-value shrink-0 tabular-nums",
            result.passed ? "text-success" : "text-warning",
          )}
        >
          {result.percent}%
        </span>
        <span className="min-w-0 text-sm text-pretty text-muted-foreground sm:flex-1">· {result.testTitle}</span>
      </div>
      <p className="mt-1 min-w-0 wrap-break-word text-xs text-pretty text-muted-foreground">
        {result.moduleTitle}
        {result.at ? ` · ${formatWhen(result.at)}` : ""}
      </p>
      {result.reviewItems.length > 0 ? (
        <ul className="mt-4 space-y-2 border-t border-border/70 pt-4 text-sm text-muted-foreground">
          {result.reviewItems.map((item) => (
            <li key={item} className="flex gap-2 text-pretty">
              <ClipboardCheck className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
              {item}
            </li>
          ))}
        </ul>
      ) : null}
      <div className="mt-auto flex flex-wrap gap-2 pt-5">
        <Button asChild variant={result.passed ? "outline" : "primary"}>
          <Link href={result.href}>{result.passed ? "Открыть тест" : "Повторить тест"}</Link>
        </Button>
        {!result.passed ? (
          <Button asChild variant="ghost" size="sm" className="min-h-10">
            <Link href={result.href.replace(/\/test$/, "/lesson")}>
              К лекции
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </Button>
        ) : null}
      </div>
    </CockpitWidget>
  );
}
