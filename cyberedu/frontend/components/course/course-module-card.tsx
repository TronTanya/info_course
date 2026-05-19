import Link from "next/link";
import { BookOpen, ClipboardCheck, FlaskConical } from "lucide-react";
import type { CourseProgressModuleRow } from "@/lib/progress";
import { ModuleInlineProgress, moduleStatusAccent } from "@/components/course/module-inline-progress";
import {
  getModuleAction,
  getModuleContentMeta,
  getUiStatus,
  moduleDifficultyByOrder,
  moduleTimeEstimate,
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
  const meta = getModuleContentMeta(row);
  const desc = row.module.description?.trim() || "Модуль киберлаборатории: теория, проверка знаний и практический сценарий.";
  const difficulty = moduleDifficultyByOrder(row.module.orderNumber);
  const hubHref = `/dashboard/course/${row.module.id}`;
  const estimate = moduleTimeEstimate(row.requirements);

  const card = (
    <article
      className={cn(
        "ce-course-module-card group relative flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border shadow-card",
        "transition-[border-color,box-shadow,transform] duration-200",
        moduleStatusAccent(status),
        "hover:shadow-[var(--shadow-card-hover)] motion-safe:hover:-translate-y-0.5 motion-reduce:hover:translate-y-0",
        isNext && "ring-2 ring-primary/30",
      )}
      style={{ animationDelay: `${(index % 6) * 40}ms` }}
    >
      <div
        className={cn(
          "h-1 w-full",
          status === "locked" && "bg-muted-foreground/25",
          status === "available" && "bg-primary/35",
          status === "in_progress" && "bg-primary",
          status === "completed" && "bg-success",
        )}
        aria-hidden
      />

      {isNext ? (
        <span className="absolute right-3 top-3 z-[1] rounded-lg border border-primary/40 bg-primary/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary">
          Следующий шаг
        </span>
      ) : null}

      <div className="flex flex-1 flex-col gap-4 p-5 sm:p-6">
        <header className="space-y-3 pr-12">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-primary/90">
              Модуль {row.module.orderNumber}
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

          {row.unlocked ? (
            <Link
              href={hubHref}
              className="block rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <h2 className="font-display text-lg font-semibold leading-snug tracking-tight text-foreground transition-colors group-hover:text-primary sm:text-xl">
                {row.module.title}
              </h2>
            </Link>
          ) : (
            <h2 className="font-display text-lg font-semibold leading-snug tracking-tight text-foreground sm:text-xl">
              {row.module.title}
            </h2>
          )}

          <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">{desc}</p>
        </header>

        <dl className="grid grid-cols-3 gap-2 text-center">
          <ContentStat icon={BookOpen} label="Уроки" value={meta.lessons} caption={meta.lessonsLabel} />
          <ContentStat icon={ClipboardCheck} label="Тесты" value={meta.tests} caption={meta.testsLabel} />
          <ContentStat icon={FlaskConical} label="Практика" value={meta.practices} caption={meta.practicesLabel} />
        </dl>

        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="border-primary/20 bg-primary/5 text-xs font-normal">
            {difficulty}
          </Badge>
          {estimate !== "—" ? (
            <Badge variant="outline" className="text-xs font-normal text-muted-foreground">
              {estimate}
            </Badge>
          ) : null}
        </div>

        <ProgressBar
          value={row.unlocked ? row.progressPercent : 0}
          max={100}
          label="Прогресс модуля"
          tone={status === "completed" ? "success" : "default"}
        />

        <ModuleInlineProgress row={row} compact />

        {row.unlocked && row.score > 0 ? (
          <p className="text-xs text-muted-foreground">
            Баллы: <span className="font-semibold tabular-nums text-foreground">{row.score}</span>
          </p>
        ) : null}
      </div>

      <footer className="border-t border-border/70 bg-muted/10 px-5 py-4 sm:px-6">
        <div className="flex flex-col gap-2 sm:flex-row">
          {action.disabled ? (
            <Button variant="outline" className="w-full gap-2" type="button" disabled>
              <LockIcon className="opacity-70" />
              Закрыт
            </Button>
          ) : (
            <>
              <Button variant={status === "completed" ? "outline" : "primary"} className="w-full sm:flex-1" asChild>
                <Link href={action.href}>{action.label}</Link>
              </Button>
              <Button variant="ghost" className="w-full sm:w-auto" asChild>
                <Link href={hubHref}>Обзор</Link>
              </Button>
            </>
          )}
        </div>
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

function ContentStat({
  icon: Icon,
  label,
  value,
  caption,
}: {
  icon: typeof BookOpen;
  label: string;
  value: number;
  caption: string;
}) {
  return (
    <div className="rounded-xl border border-border/70 bg-background/60 px-2 py-2">
      <Icon className="mx-auto size-4 text-primary" aria-hidden />
      <dt className="mt-1 text-[10px] uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="text-sm font-bold tabular-nums text-foreground">{value}</dd>
      <dd className="mt-0.5 line-clamp-1 text-[9px] text-muted-foreground">{caption}</dd>
    </div>
  );
}
