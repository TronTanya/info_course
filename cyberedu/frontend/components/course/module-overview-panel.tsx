import type { ComponentProps } from "react";
import Link from "next/link";
import { BookOpen, ClipboardCheck, FlaskConical } from "lucide-react";
import { ModuleInlineProgress } from "@/components/course/module-inline-progress";
import { CyberHero } from "@/components/cyber/cyber-hero";
import {
  formatLessonCount,
  formatPracticeCount,
  formatTestCount,
  moduleDifficultyByOrder,
} from "@/lib/course-path-ui";
import type { CourseProgressModuleRow, ModuleContentCounts, ModuleRequirements } from "@/lib/progress";
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
  /** Для внутреннего прогресса по шагам (лекция → тест → практика). */
  progressRow?: CourseProgressModuleRow | null;
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
  requirements: _requirements,
  continueHref,
  continueLabel,
  courseHref = "/dashboard/course",
  progressRow = null,
}: ModuleOverviewPanelProps) {
  const difficulty = moduleDifficultyByOrder(orderNumber);

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

          <dl className="grid grid-cols-3 gap-2 sm:max-w-md">
            <MetricPill icon={BookOpen} label="Уроки" text={formatLessonCount(contentCounts.lessons)} />
            <MetricPill icon={ClipboardCheck} label="Тесты" text={formatTestCount(contentCounts.tests)} />
            <MetricPill icon={FlaskConical} label="Практика" text={formatPracticeCount(contentCounts.practices)} />
          </dl>
          {progressRow ? (
            <div className="max-w-xl">
              <ModuleInlineProgress row={progressRow} />
            </div>
          ) : null}

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

function MetricPill({
  icon: Icon,
  label,
  text,
}: {
  icon: typeof BookOpen;
  label: string;
  text: string;
}) {
  return (
    <div className="rounded-xl border border-border/70 bg-muted/20 px-2 py-2 text-center">
      <Icon className="mx-auto size-4 text-primary" aria-hidden />
      <dt className="mt-1 text-[10px] uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="text-xs font-semibold text-foreground">{text}</dd>
    </div>
  );
}
