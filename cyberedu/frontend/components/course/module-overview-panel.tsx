import type { ComponentProps } from "react";
import Link from "next/link";
import { CyberHero } from "@/components/cyber/cyber-hero";
import {
  formatLessonCount,
  formatPracticeCount,
  moduleDifficultyByOrder,
} from "@/lib/course-path-ui";
import type { ModuleContentCounts, ModuleRequirements } from "@/lib/progress";
import { cyber } from "@/lib/design-system/cyber";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { cn } from "@/lib/utils";

type ModuleOverviewPanelProps = {
  orderNumber: number;
  title: string;
  description: string;
  progressPercent: number;
  score: number;
  statusLabel: string;
  statusVariant: NonNullable<ComponentProps<typeof Badge>["variant"]>;
  contentCounts: ModuleContentCounts;
  requirements: ModuleRequirements;
  continueHref: string;
  continueLabel: string;
  courseHref?: string;
};

export function ModuleOverviewPanel({
  orderNumber,
  title,
  description,
  progressPercent,
  score,
  statusLabel,
  statusVariant,
  contentCounts,
  requirements,
  continueHref,
  continueLabel,
  courseHref = "/dashboard/course",
}: ModuleOverviewPanelProps) {
  const difficulty = moduleDifficultyByOrder(orderNumber);
  const stepsTotal = requirements.totalSteps;

  return (
    <CyberHero className="ce-module-overview" padding="default">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(220px,280px)] lg:items-start">
        <div className="min-w-0 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className={cyber.monoLabel}>MOD-{String(orderNumber).padStart(2, "0")}</span>
            <Badge variant={statusVariant}>{statusLabel}</Badge>
            <Badge variant="outline" className="border-primary/20 bg-primary/5">
              {difficulty}
            </Badge>
          </div>

          <h1 className="typo-h1 text-balance sm:text-2xl">{title}</h1>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">{description}</p>

          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{formatLessonCount(contentCounts.lessons)}</Badge>
            <Badge variant="outline">{formatPracticeCount(contentCounts.practices)}</Badge>
            {contentCounts.tests > 0 ? (
              <Badge variant="outline">
                {contentCounts.tests} {contentCounts.tests === 1 ? "тест" : "теста"}
              </Badge>
            ) : null}
            <Badge variant="outline">{stepsTotal} шагов</Badge>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href={continueHref}>{continueLabel}</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="w-full border-primary/25 sm:w-auto">
              <Link href={courseHref}>К карте трека</Link>
            </Button>
          </div>
        </div>

        <aside className={cn(cyber.panelStatic, "space-y-4 p-5")}>
          <div>
            <p className="typo-label">Прогресс модуля</p>
            <p className="mt-1 font-display text-3xl font-bold tabular-nums text-foreground">{progressPercent}%</p>
          </div>
          <ProgressBar
            value={progressPercent}
            max={100}
            label="Шаги"
            tone={progressPercent >= 100 ? "success" : "default"}
          />
          <div
            className={cn(
              "rounded-xl border px-3 py-2.5",
              progressPercent >= 100 ? "border-success/30 bg-success/10" : "border-primary/20 bg-primary/8",
            )}
          >
            <p className="typo-label text-muted-foreground">Баллы</p>
            <p className="font-mono text-xl font-bold tabular-nums text-foreground">{score}</p>
          </div>
        </aside>
      </div>
    </CyberHero>
  );
}
