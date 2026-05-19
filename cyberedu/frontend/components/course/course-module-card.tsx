import Link from "next/link";
import type { CourseProgressModuleRow } from "@/lib/progress";
import {
  formatLessonCount,
  formatPracticeCount,
  getModuleAction,
  getUiStatus,
  moduleDifficultyByOrder,
  statusBadge,
} from "@/lib/course-path-ui";
import { CompletedBadge } from "@/components/ui/completed-badge";
import { InProgressBadge } from "@/components/ui/in-progress-badge";
import { LockedCard } from "@/components/ui/locked-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { cn } from "@/lib/utils";

function LockIcon({ className }: { className?: string }) {
  return (
    <svg className={cn("size-3.5 shrink-0", className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M7 11V8a5 5 0 0110 0v3" />
    </svg>
  );
}

export type CourseModuleCardProps = {
  row: CourseProgressModuleRow;
  isNext?: boolean;
  index?: number;
};

export function CourseModuleCard({ row, isNext = false, index = 0 }: CourseModuleCardProps) {
  const status = getUiStatus(row);
  const badge = statusBadge[status];
  const action = getModuleAction(row);
  const desc = row.module.description?.trim() || "Модуль киберлаборатории: теория, проверка знаний и практический сценарий.";
  const difficulty = moduleDifficultyByOrder(row.module.orderNumber);
  const { lessons, practices } = row.contentCounts;

  const card = (
    <article
      className={cn(
        "ce-course-module-card group relative flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border bg-card/90 shadow-card",
        "transition-[border-color,box-shadow,transform] duration-200",
        "hover:border-primary/40 hover:shadow-[var(--shadow-glow)] hover:-translate-y-0.5 motion-reduce:hover:translate-y-0",
        status === "locked" && "border-border/60 opacity-90",
        status !== "locked" && "border-border",
        status === "in_progress" && "border-primary/35 ring-1 ring-primary/15",
        status === "completed" && "border-success/30",
        isNext && "border-primary/50 ring-2 ring-primary/25 shadow-[var(--shadow-glow)]",
      )}
      style={{ animationDelay: `${(index % 6) * 40}ms` }}
    >
      <div
        className={cn(
          "h-0.5 w-full",
          status === "locked" && "bg-muted-foreground/20",
          status === "available" && "bg-primary/30",
          status === "in_progress" && "bg-primary",
          status === "completed" && "bg-success",
        )}
        aria-hidden
      />

      {isNext ? (
        <span className="absolute right-3 top-3 z-[1] rounded-lg border border-primary/40 bg-primary/15 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-primary">
          Далее
        </span>
      ) : null}

      <div className="flex flex-1 flex-col gap-4 p-5 sm:p-6">
        <header className="space-y-3 pr-14">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-primary/90">
              MOD-{String(row.module.orderNumber).padStart(2, "0")}
            </span>
            {status === "completed" ? (
              <CompletedBadge />
            ) : status === "in_progress" ? (
              <InProgressBadge />
            ) : status === "locked" ? (
              <Badge variant={badge.variant} className={cn("shrink-0 gap-1", badge.className)}>
                <LockIcon />
                {badge.label}
              </Badge>
            ) : (
              <Badge variant={badge.variant} className={cn("shrink-0", badge.className)}>
                {badge.label}
              </Badge>
            )}
          </div>

          <h2 className="font-display text-lg font-semibold leading-snug tracking-tight text-foreground sm:text-xl">
            {row.module.title}
          </h2>

          <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">{desc}</p>
        </header>

        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="border-primary/20 bg-primary/5 text-xs font-normal">
            {difficulty}
          </Badge>
          <Badge variant="outline" className="text-xs font-normal tabular-nums">
            {formatLessonCount(lessons)}
          </Badge>
          <Badge variant="outline" className="text-xs font-normal tabular-nums">
            {formatPracticeCount(practices)}
          </Badge>
        </div>

        <ProgressBar
          value={row.unlocked ? row.progressPercent : 0}
          max={100}
          label="Прогресс"
          tone={status === "completed" ? "success" : "default"}
        />

        {row.unlocked && row.score > 0 ? (
          <p className="font-mono text-[11px] text-subtle-foreground">
            score: <span className="font-semibold text-foreground">{row.score}</span> pts
          </p>
        ) : null}
      </div>

      <footer className="border-t border-border/70 bg-muted/15 px-5 py-4 sm:px-6">
        {action.disabled ? (
          <Button variant="outline" className="w-full gap-2" type="button" disabled>
            <LockIcon className="opacity-70" />
            Закрыт
          </Button>
        ) : (
          <Button
            variant={status === "completed" ? "outline" : "primary"}
            className="w-full"
            asChild
          >
            <Link href={action.href}>{action.label}</Link>
          </Button>
        )}
      </footer>
    </article>
  );

  if (status === "locked") {
    return (
      <LockedCard
        locked
        title="Модуль закрыт"
        description="Завершите предыдущий модуль в треке, чтобы открыть доступ к лаборатории и тестам."
      >
        {card}
      </LockedCard>
    );
  }

  return card;
}
