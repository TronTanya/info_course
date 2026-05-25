import { buildModuleTrackSteps, type UiStatus } from "@/lib/course-path-ui";
import type { CourseProgressModuleRow } from "@/lib/progress";
import { cn } from "@/lib/utils";

export function ModuleInlineProgress({
  row,
  compact = false,
}: {
  row: CourseProgressModuleRow;
  compact?: boolean;
}) {
  const steps = buildModuleTrackSteps(row);
  if (steps.length === 0) {
    return (
      <p className="text-xs text-muted-foreground">
        {row.unlocked ? "Шаги появятся после открытия модуля" : "Завершите предыдущий модуль"}
      </p>
    );
  }

  const done = steps.filter((s) => s.done).length;

  return (
    <div className="space-y-2">
      {!compact ? (
        <div className="flex items-center justify-between gap-2 text-xs">
          <span className="text-muted-foreground">Шаги внутри модуля</span>
          <span className="font-medium tabular-nums text-foreground">
            {done}/{steps.length}
          </span>
        </div>
      ) : null}
      <ol className={cn("flex flex-wrap gap-1.5", compact && "gap-1")} aria-label="Прогресс по шагам модуля">
        {steps.map((step) => (
          <li key={step.key}>
            <span
              className={cn(
                "inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-medium sm:text-[11px]",
                step.done
                  ? "border-success/35 bg-success/10 text-success"
                  : "border-border/80 bg-muted/30 text-muted-foreground",
              )}
            >
              {step.label}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function moduleStatusAccent(status: UiStatus): string {
  switch (status) {
    case "completed":
      return "border-success/30 bg-success/5";
    case "in_progress":
      return "border-primary/35 bg-primary/5";
    case "available":
      return "border-cyan/25 bg-card";
    case "pending_review":
      return "border-warning/30 bg-warning/5";
    case "needs_retry":
      return "border-danger/30 bg-danger/5";
    default:
      return "border-border/60 bg-muted/20 opacity-95";
  }
}
