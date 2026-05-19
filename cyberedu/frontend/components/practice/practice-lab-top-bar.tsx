import Link from "next/link";
import type { PracticeLabState } from "@/lib/practice-lab-ui";
import { practiceLabStateMeta, practiceDifficultyLabel } from "@/lib/practice-lab-ui";
import { PracticeLabTimer } from "@/components/practice/practice-lab-timer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const toneBadge: Record<PracticeLabState, string> = {
  not_started: "border-border text-muted-foreground",
  in_progress: "border-primary/35 bg-primary/12 text-primary",
  submitted: "border-warning/40 bg-warning/12 text-warning",
  passed: "border-success/35 bg-success/12 text-success",
  needs_review: "border-warning/40 bg-warning/12 text-warning",
  wrong: "border-danger/35 bg-danger/12 text-danger",
  correct: "border-success/35 bg-success/12 text-success",
};

export type PracticeLabTopBarProps = {
  taskTitle: string;
  moduleOrderNumber: number;
  maxScore: number;
  score: number | null;
  labState: PracticeLabState;
  moduleId: string;
  showTimer?: boolean;
};

export function PracticeLabTopBar({
  taskTitle,
  moduleOrderNumber,
  maxScore,
  score,
  labState,
  moduleId,
  showTimer = true,
}: PracticeLabTopBarProps) {
  const meta = practiceLabStateMeta[labState];
  const difficulty = practiceDifficultyLabel(moduleOrderNumber, maxScore);

  return (
    <div className="ce-practice-lab-topbar relative overflow-hidden rounded-2xl border border-primary/25 bg-card/90 p-5 shadow-card ring-1 ring-primary/10 sm:p-6">
      <div className="ce-tech-grid pointer-events-none absolute inset-0 opacity-[0.1]" aria-hidden />
      <div className="relative flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 space-y-2">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Лабораторная работа</p>
          <h1 className="font-display text-xl font-semibold leading-snug text-foreground sm:text-2xl">{taskTitle}</h1>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="border-primary/20 bg-primary/5 font-normal">
              {difficulty}
            </Badge>
            {showTimer && labState !== "passed" ? (
              <PracticeLabTimer active={labState === "in_progress" || labState === "not_started"} />
            ) : null}
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-stretch gap-3 sm:items-end">
          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            <Badge className={cn("font-mono text-[10px] uppercase tracking-wider", toneBadge[labState])}>{meta.label}</Badge>
            <span className="rounded-lg border border-border/80 bg-muted/30 px-2.5 py-1 font-mono text-xs tabular-nums">
              <span className="text-muted-foreground">баллы </span>
              <span className="font-semibold text-foreground">{score ?? "—"}</span>
              <span className="text-muted-foreground"> / {maxScore}</span>
            </span>
          </div>
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href={`/dashboard/course/${moduleId}`}>К модулю</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
