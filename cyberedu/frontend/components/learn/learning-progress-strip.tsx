import Link from "next/link";
import { ProgressBar } from "@/components/ui/progress-bar";
import { cn } from "@/lib/utils";

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
    <div
      className={cn(
        "ce-glass grid grid-cols-1 gap-4 rounded-2xl border border-border/60 p-4 md:grid-cols-2 md:p-5",
        className,
      )}
    >
      <div className="min-w-0 space-y-2">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="typo-eyebrow text-primary">Курс</p>
          <Link href="/dashboard/course" className="text-xs font-medium text-primary hover:underline">
            Карта
          </Link>
        </div>
        <p className="truncate text-sm font-medium text-foreground">{courseTitle}</p>
        <ProgressBar value={courseProgressPercent} max={100} label="Прогресс курса" />
      </div>
      <div className="min-w-0 space-y-2 border-t border-border/50 pt-4 md:border-t-0 md:border-l md:pl-5 md:pt-0">
        <p className="typo-eyebrow text-muted-foreground">Модуль</p>
        <p className="truncate text-sm font-medium text-foreground">{moduleTitle}</p>
        <ProgressBar value={moduleProgressPercent} max={100} label={`Шаги: ${moduleStepsLabel}`} />
      </div>
    </div>
  );
}
