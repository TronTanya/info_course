import Link from "next/link";
import type { PracticeLabState } from "@/lib/practice-lab-ui";
import { formatPracticeDuration, practiceLabStateMeta, practiceDifficultyLabel } from "@/lib/practice-lab-ui";
import { PracticeLabTimer } from "@/components/practice/practice-lab-timer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const toneBadge: Record<PracticeLabState, string> = {
  not_started: "ce-mission-validation ce-mission-validation--pending",
  in_progress: "ce-mission-validation ce-mission-validation--running",
  submitted: "ce-mission-validation ce-mission-validation--running",
  passed: "ce-mission-validation ce-mission-validation--passed",
  needs_review: "ce-mission-validation ce-mission-validation--running",
  wrong: "ce-mission-validation ce-mission-validation--failed",
  correct: "ce-mission-validation ce-mission-validation--passed",
};

export type PracticeLabTopBarProps = {
  taskTitle: string;
  moduleTitle: string;
  moduleOrderNumber: number;
  maxScore: number;
  score: number | null;
  labState: PracticeLabState;
  moduleId: string;
  estimatedMinutes?: number;
  showTimer?: boolean;
};

export function PracticeLabTopBar({
  taskTitle,
  moduleTitle,
  moduleOrderNumber,
  maxScore,
  score,
  labState,
  moduleId,
  estimatedMinutes,
  showTimer = true,
}: PracticeLabTopBarProps) {
  const meta = practiceLabStateMeta[labState];
  const difficulty = practiceDifficultyLabel(moduleOrderNumber, maxScore);
  const live = labState === "in_progress" || labState === "not_started";

  return (
    <div className="ce-mission-topbar relative overflow-hidden p-5 sm:p-6">
      <div className="ce-learn-grid pointer-events-none absolute inset-0 opacity-10" aria-hidden />
      <div className="relative flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <p className="ce-learn-os-eyebrow">Текущая миссия</p>
            {live ? (
              <span className="ce-mission-topbar__live">
                <span className="ce-mission-topbar__live-dot" aria-hidden />
                Песочница активна
              </span>
            ) : null}
          </div>
          <h1 className="font-heading text-xl font-semibold leading-snug text-foreground sm:text-2xl">
            {taskTitle}
          </h1>
          <p className="font-mono text-sm text-muted-foreground">
            MOD-{String(moduleOrderNumber).padStart(2, "0")} · {moduleTitle}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="border-primary/25 bg-primary/8 font-mono text-2.5 font-normal">
              {difficulty}
            </Badge>
            {estimatedMinutes != null && estimatedMinutes > 0 ? (
              <Badge variant="outline" className="font-mono text-2.5 font-normal tabular-nums">
                {formatPracticeDuration(estimatedMinutes)}
              </Badge>
            ) : null}
            {showTimer && labState !== "passed" ? (
              <PracticeLabTimer active={labState === "in_progress" || labState === "not_started"} />
            ) : null}
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-stretch gap-3 sm:items-end">
          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            <span className={cn(toneBadge[labState])}>{meta.label}</span>
            <span className="rounded-xl border border-white/10 bg-white/4 px-2.5 py-1 font-mono text-xs tabular-nums">
              <span className="text-muted-foreground">score </span>
              <span className="font-semibold text-foreground">{score ?? "—"}</span>
              <span className="text-muted-foreground"> / {maxScore}</span>
            </span>
          </div>
          <Button asChild variant="outline" className="w-full rounded-2xl border-white/10 bg-white/3 sm:w-auto">
            <Link href={`/dashboard/course/${moduleId}`}>← К карте курса</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
