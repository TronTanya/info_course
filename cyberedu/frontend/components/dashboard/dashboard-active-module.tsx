"use client";

import Link from "next/link";
import { BookOpen, ClipboardCheck, FlaskConical, Layers, PlayCircle } from "lucide-react";
import type { DashboardActiveModuleSnapshot, DashboardActiveModuleStep } from "@/lib/dashboard-ui";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PremiumCard } from "@/components/ui/premium-card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { cn } from "@/lib/utils";

const stepIcon = {
  lesson: BookOpen,
  test: ClipboardCheck,
  practice: FlaskConical,
} as const;

function StepChip({ step }: { step: DashboardActiveModuleStep }) {
  const Icon = stepIcon[step.kind];
  const isDone = step.state === "done";
  const isCurrent = step.state === "current";

  return (
    <li
      className={cn(
        "flex min-w-0 items-center gap-2 rounded-xl border px-3 py-2 text-sm",
        isDone && "border-success/30 bg-success/8 text-foreground",
        isCurrent && "border-primary/35 bg-primary/10 text-foreground",
        step.state === "locked" && "border-border/70 bg-muted/20 text-muted-foreground",
      )}
    >
      <Icon
        className={cn(
          "size-4 shrink-0",
          isDone ? "text-success" : isCurrent ? "text-primary" : "text-muted-foreground",
        )}
        aria-hidden
      />
      <span className="min-w-0 truncate font-medium">{step.label}</span>
      <span className="ml-auto shrink-0 text-[10px] font-semibold uppercase tracking-wide">
        {isDone ? "Готово" : isCurrent ? "Сейчас" : "Далее"}
      </span>
    </li>
  );
}

export function DashboardActiveModule({ snapshot }: { snapshot: DashboardActiveModuleSnapshot | null }) {
  if (!snapshot) {
    return (
      <PremiumCard variant="glow" padding="md" className="min-w-0" aria-labelledby="dash-active-module-heading">
        <p id="dash-active-module-heading" className="typo-eyebrow text-primary">
          Активный модуль
        </p>
        <EmptyState
          compact
          className="mt-3"
          title="Все модули пройдены"
          description="Перейдите к сертификату или повторите материалы в карте курса."
          action={
            <Button asChild size="sm" variant="outline">
              <Link href="/dashboard/certificate">К сертификату</Link>
            </Button>
          }
        />
      </PremiumCard>
    );
  }

  const tone = snapshot.progressPercent >= 100 ? "success" : "default";

  return (
    <PremiumCard variant="glow" padding="md" className="min-w-0" aria-labelledby="dash-active-module-heading">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-primary/25 bg-primary/10 text-primary">
            <Layers className="size-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <p id="dash-active-module-heading" className="typo-eyebrow text-primary">
              Активный модуль
            </p>
            <h2 className="mt-1 font-display text-xl font-semibold text-balance text-foreground sm:text-2xl">
              {snapshot.orderNumber}. {snapshot.title}
            </h2>
            <p className="mt-1 line-clamp-2 text-sm text-pretty text-muted-foreground">{snapshot.skillLine}</p>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2 sm:flex-col sm:items-end">
          <Button asChild size="sm" variant="primary" className="min-h-10 w-full sm:w-auto">
            <Link href={snapshot.continueHref}>
              <PlayCircle className="size-4" aria-hidden />
              {snapshot.continueLabel}
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="min-h-10 w-full sm:w-auto">
            <Link href={snapshot.moduleHref}>Карточка модуля</Link>
          </Button>
        </div>
      </div>

      <ProgressBar
        className="mt-4 max-w-xl"
        label="Прогресс модуля"
        value={snapshot.progressPercent}
        max={100}
        tone={tone}
      />

      {snapshot.steps.length > 0 ? (
        <ul className="mt-4 grid gap-2 sm:grid-cols-3" aria-label="Шаги модуля">
          {snapshot.steps.map((step) => (
            <StepChip key={step.kind} step={step} />
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-muted-foreground">В этом модуле нет обязательных шагов — откройте карточку модуля.</p>
      )}
    </PremiumCard>
  );
}
