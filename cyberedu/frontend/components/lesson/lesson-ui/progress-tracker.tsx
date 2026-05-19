import type { LearningNavStepItem } from "@/lib/learning-nav";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type ProgressTrackerProps = {
  moduleProgressPercent: number;
  moduleStepsLabel: string;
  lessonCompleted: boolean;
  difficulty: string;
  steps: LearningNavStepItem[];
  className?: string;
};

export function ProgressTracker({
  moduleProgressPercent,
  moduleStepsLabel,
  lessonCompleted,
  difficulty,
  steps,
  className,
}: ProgressTrackerProps) {
  return (
    <aside className={cn("space-y-4", className)} aria-label="Прогресс урока">
      <div className="rounded-2xl border border-border/80 bg-card/90 p-4 shadow-card">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Прогресс модуля</p>
        <p className="mt-1 font-display text-3xl font-bold tabular-nums text-foreground">{moduleProgressPercent}%</p>
        <p className="mt-0.5 text-xs text-muted-foreground">Шаги: {moduleStepsLabel}</p>
        <ProgressBar value={moduleProgressPercent} max={100} className="mt-3" label="Модуль" />
      </div>

      <div className="rounded-2xl border border-border/80 bg-card/90 p-4 shadow-card">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Урок</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <Badge variant={lessonCompleted ? "success" : "primary"}>
            {lessonCompleted ? "Изучено" : "В процессе"}
          </Badge>
          <Badge variant="outline">{difficulty}</Badge>
        </div>
      </div>

      <div className="rounded-2xl border border-border/80 bg-card/90 p-4 shadow-card">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Этапы модуля</p>
        <ol className="space-y-2">
          {steps.map((step) => (
            <li
              key={step.kind}
              className={cn(
                "flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs",
                step.isActive && "bg-primary/10 font-medium text-primary ring-1 ring-primary/20",
                step.status === "completed" && !step.isActive && "text-muted-foreground",
                step.status === "blocked" && "opacity-60",
              )}
            >
              <span
                className={cn(
                  "size-1.5 shrink-0 rounded-full",
                  step.status === "completed" && "bg-success",
                  step.status === "blocked" && "bg-muted-foreground/40",
                  step.status !== "completed" && step.status !== "blocked" && "bg-primary",
                )}
                aria-hidden
              />
              <span className="min-w-0 truncate">{step.title}</span>
            </li>
          ))}
        </ol>
      </div>
    </aside>
  );
}
