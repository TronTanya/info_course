import Link from "next/link";
import { cn } from "@/lib/utils";

function OsProgressBar({
  label,
  value,
  complete,
}: {
  label: string;
  value: number;
  complete?: boolean;
}) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono tabular-nums text-foreground">{pct}%</span>
      </div>
      <div className="ce-learn-os-progress-bar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
        <div
          className={cn("ce-learn-os-progress-fill", (complete || pct >= 100) && "ce-learn-os-progress-fill--complete")}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function LearningProgressStrip({
  courseTitle,
  courseProgressPercent,
  moduleTitle,
  moduleProgressPercent,
  moduleStepsLabel,
  className,
}: {
  courseTitle: string;
  courseProgressPercent: number;
  moduleTitle: string;
  moduleProgressPercent: number;
  moduleStepsLabel: string;
  className?: string;
}) {
  return (
    <div className={cn("ce-learn-os-progress grid grid-cols-1 gap-5 p-4 md:grid-cols-2 md:p-5", className)}>
      <div className="min-w-0 space-y-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="ce-learn-os-eyebrow">Прогресс курса</p>
          <Link href="/dashboard/course" className="font-mono text-2.5 font-medium text-primary hover:underline">
            карта курса →
          </Link>
        </div>
        <p className="truncate text-sm font-medium text-foreground">{courseTitle}</p>
        <OsProgressBar label="Прогресс курса" value={courseProgressPercent} complete={courseProgressPercent >= 100} />
      </div>
      <div className="min-w-0 space-y-3 border-t border-white/8 pt-5 md:border-t-0 md:border-l md:pl-5 md:pt-0">
        <p className="ce-learn-os-eyebrow text-muted-foreground">Текущий модуль</p>
        <p className="truncate text-sm font-medium text-foreground">{moduleTitle}</p>
        <OsProgressBar
          label={`Шаги: ${moduleStepsLabel}`}
          value={moduleProgressPercent}
          complete={moduleProgressPercent >= 100}
        />
      </div>
    </div>
  );
}
