"use client";

import Link from "next/link";
import { ArrowRight, Clock, FlaskConical, Gauge } from "lucide-react";
import type { DashboardNextStepCard } from "@/lib/dashboard-ui";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PremiumCard } from "@/components/ui/premium-card";
import { StatusPill } from "@/components/ui/status-pill";
import { cn } from "@/lib/utils";

export function DashboardNextPractice({ card }: { card: DashboardNextStepCard | null }) {
  if (!card) {
    return (
      <PremiumCard variant="default" padding="md" className="h-full">
        <EmptyState
          compact
          title="Практика пока недоступна"
          description="Откройте карту курса — лаборатория появится после лекции и теста в модуле."
          action={
            <Button asChild size="sm" variant="outline">
              <Link href="/dashboard/course">Карта курса</Link>
            </Button>
          }
        />
      </PremiumCard>
    );
  }

  const isPractice = card.kind === "practice";

  return (
    <PremiumCard variant="default" padding="md" className="flex h-full min-w-0 flex-col" aria-labelledby="dash-practice-heading">
      <div className="flex min-w-0 flex-wrap items-start justify-between gap-2">
        <p id="dash-practice-heading" className="typo-eyebrow text-primary">
          Next practice
        </p>
        <StatusPill
          status={card.empty ? "pending" : "in_progress"}
          label={card.statusLabel}
        />
      </div>
      <div className="mt-4 flex gap-3">
        <span
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-xl border",
            isPractice ? "border-primary/25 bg-primary/10 text-primary" : "border-border bg-muted/40 text-muted-foreground",
          )}
        >
          <FlaskConical className="size-5" aria-hidden />
        </span>
        <div className="min-w-0">
          <h3 className="break-words font-display text-lg font-semibold text-balance text-foreground">{card.title}</h3>
          <p className="mt-1 break-words text-sm text-pretty text-muted-foreground">{card.moduleTitle}</p>
        </div>
      </div>
      {!card.empty && (card.difficultyLabel || card.estimatedLabel) ? (
        <dl className="mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
          {card.difficultyLabel ? (
            <div className="flex items-center gap-1.5 rounded-lg border border-border/70 bg-muted/20 px-2.5 py-1.5">
              <Gauge className="size-3.5 text-primary" aria-hidden />
              <span>{card.difficultyLabel}</span>
            </div>
          ) : null}
          {card.estimatedLabel ? (
            <div className="flex items-center gap-1.5 rounded-lg border border-border/70 bg-muted/20 px-2.5 py-1.5">
              <Clock className="size-3.5 text-primary" aria-hidden />
              <span>{card.estimatedLabel}</span>
            </div>
          ) : null}
        </dl>
      ) : null}
      <div className="mt-auto pt-5">
        <Button asChild className="w-full sm:w-auto" variant={card.empty ? "outline" : "primary"}>
          <Link href={card.href}>
            {card.empty ? "Карта курса" : isPractice ? "Открыть практику" : "К тесту"}
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </Button>
      </div>
    </PremiumCard>
  );
}
