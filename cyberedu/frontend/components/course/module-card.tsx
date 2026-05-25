import { TrackableLink } from "@/components/analytics/trackable-link";
import { AnalyticsEvents } from "@/lib/analytics/events";
import { AlertCircle, Check, Clock, GraduationCap, Lock, Play } from "lucide-react";
import { CourseModuleNodeIcon } from "@/components/course/course-module-node-icon";
import { CourseStepIcon } from "@/components/course/course-step-icon";
import type { CourseStepIconKind, CourseStepIconStatus } from "@/lib/course-step-icons";
import type { CourseProgressModuleRow } from "@/lib/progress";
import {
  getModuleCardAction,
  getModuleCardBadge,
  getModuleCardStatus,
  getModuleContentItems,
  getModuleLockReason,
  moduleCardMeta,
  moduleCardShellClass,
  type ModuleContentItem,
  type ModuleCardStatus,
} from "@/lib/module-card-ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CircularProgress } from "@/components/ui/circular-progress";
import { ProgressBar } from "@/components/ui/progress-bar";
import { cn } from "@/lib/utils";

const CONTENT_ICON_KIND: Record<ModuleContentItem["kind"], CourseStepIconKind> = {
  lessons: "lesson",
  test: "test",
  practice: "practice",
};

function StatusIcon({
  status,
  orderNumber,
  progressPercent,
}: {
  status: ModuleCardStatus;
  orderNumber: number;
  progressPercent: number;
}) {
  if (status === "locked") {
    return <Lock className="size-5" strokeWidth={1.75} aria-hidden />;
  }
  if (status === "completed") {
    return <Check className="size-5" strokeWidth={2.5} aria-hidden />;
  }
  if (status === "pending_review") {
    return <Clock className="size-5 stroke-warning" strokeWidth={1.75} aria-hidden />;
  }
  if (status === "needs_retry") {
    return <AlertCircle className="size-5 text-danger" strokeWidth={1.75} aria-hidden />;
  }
  if (status === "in_progress") {
    return <CircularProgress value={progressPercent} size={44} strokeWidth={4} tone="default" label="" />;
  }
  return <span className="font-mono text-sm font-bold tabular-nums">{orderNumber}</span>;
}

function ContentItemRow({ item }: { item: ModuleContentItem }) {
  const done = item.stepStatus === "completed";
  const pending = item.stepStatus === "pending_review";
  const retry = item.stepStatus === "needs_retry";
  const locked = item.stepStatus === "locked";
  const iconStatus = item.stepStatus as CourseStepIconStatus;

  return (
    <li
      className={cn(
        "flex min-h-[3.25rem] items-center gap-3 rounded-xl border px-3 py-2.5",
        done && "border-success/25 bg-success/5",
        pending && "border-warning/25 bg-warning/5",
        retry && "border-danger/25 bg-danger/5",
        item.stepStatus === "in_progress" && "border-primary/25 bg-primary/5",
        locked && "border-border/60 bg-muted/15 opacity-80",
        item.stepStatus === "available" && "border-border/70 bg-background/50",
      )}
    >
      {retry && !done ? (
        <span
          className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-danger/35 bg-danger/10 text-danger"
          aria-hidden
        >
          <AlertCircle className="size-4" />
        </span>
      ) : (
        <CourseStepIcon kind={CONTENT_ICON_KIND[item.kind]} size="sm" status={iconStatus} />
      )}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-foreground">{item.label}</p>
        <p className="text-xs text-muted-foreground">{item.countLabel}</p>
      </div>
      <Badge
        variant={
          done
            ? "success"
            : pending
              ? "warning"
              : retry
                ? "danger"
                : item.stepStatus === "in_progress"
                  ? "primary"
                  : "outline"
        }
        className="shrink-0 text-[10px]"
      >
        {item.statusLabel}
      </Badge>
    </li>
  );
}

export type ModuleCardProps = {
  row: CourseProgressModuleRow;
  modules: CourseProgressModuleRow[];
  /** Текущий модуль в треке. */
  isCurrent?: boolean;
  /** @deprecated Используйте `isCurrent`. */
  isNext?: boolean;
  index?: number;
};

export function ModuleCard({ row, modules, isCurrent, isNext = false, index = 0 }: ModuleCardProps) {
  const isFocus = isCurrent ?? isNext;
  const status = getModuleCardStatus(row);
  const badge = getModuleCardBadge(status);
  const action = getModuleCardAction(row, modules);
  const meta = moduleCardMeta(row);
  const contentItems = getModuleContentItems(row);
  const lockReason = getModuleLockReason(row, modules);
  const hubHref = `/dashboard/course/${row.module.id}`;
  const progressValue = row.unlocked ? row.progressPercent : 0;

  return (
    <article
      className={cn(
        "ce-module-card group relative flex h-full min-w-0 flex-col overflow-hidden rounded-2xl shadow-card",
        moduleCardShellClass(status, isFocus),
        isFocus && "ring-2 ring-primary/30 ring-offset-2 ring-offset-background",
      )}
      style={{ animationDelay: `${(index % 6) * 40}ms` }}
      aria-labelledby={`module-card-title-${row.module.id}`}
    >
      <div
        className={cn(
          "h-1 w-full shrink-0",
          status === "locked" && "bg-muted-foreground/25",
          status === "available" && "bg-primary/30",
          status === "in_progress" && "bg-primary",
          status === "pending_review" && "bg-warning/70",
          status === "needs_retry" && "bg-danger/70",
          status === "completed" && "bg-success",
        )}
        aria-hidden
      />

      {isFocus ? (
        <span className="absolute right-3 top-3 z-[1] rounded-lg border border-primary/40 bg-primary/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary">
          Текущий
        </span>
      ) : null}

      <header className="space-y-4 p-5 pb-0 sm:p-6 sm:pb-0">
        <div className="flex gap-4 pr-10">
          {status === "in_progress" ? (
            <div className="shrink-0" aria-hidden>
              <StatusIcon status={status} orderNumber={row.module.orderNumber} progressPercent={progressValue} />
            </div>
          ) : (
            <CourseModuleNodeIcon orderNumber={row.module.orderNumber} status={status} isFocus={isFocus} />
          )}
          <div className="min-w-0 flex-1 space-y-2">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-primary/90">
              Модуль {row.module.orderNumber}
            </p>
            {row.unlocked ? (
              <TrackableLink
                id={`module-card-title-${row.module.id}`}
                href={hubHref}
                event={AnalyticsEvents.moduleOpened}
                analytics={{ moduleId: row.module.id, source: "module_card_title" }}
                className="block rounded-sm font-display text-lg font-semibold leading-snug text-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:text-xl"
              >
                {row.module.title}
              </TrackableLink>
            ) : (
              <h2
                id={`module-card-title-${row.module.id}`}
                className="font-display text-lg font-semibold leading-snug text-foreground sm:text-xl"
              >
                {row.module.title}
              </h2>
            )}
            <Badge variant={badge.variant} className={cn("gap-1", badge.className)}>
              {status === "locked" ? <Lock className="size-3" aria-hidden /> : null}
              {status === "completed" ? <Check className="size-3" aria-hidden /> : null}
              {badge.label}
            </Badge>
          </div>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-5 sm:gap-5 sm:p-6">
        <div className="space-y-3">
          <p className="line-clamp-3 text-sm leading-relaxed text-pretty text-muted-foreground">{meta.description}</p>
          <div className="flex items-start gap-2 rounded-xl border border-primary/15 bg-primary/5 px-3 py-2.5">
            <GraduationCap className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
            <p className="text-xs leading-relaxed text-pretty text-muted-foreground">
              <span className="font-medium text-foreground">Навык: </span>
              {meta.skill}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="border-primary/20 bg-primary/5 text-xs font-normal">
              {meta.difficulty}
            </Badge>
            {meta.estimate !== "—" ? (
              <Badge variant="outline" className="gap-1 text-xs font-normal text-muted-foreground">
                <Clock className="size-3" aria-hidden />
                {meta.estimate}
              </Badge>
            ) : null}
          </div>
        </div>

        <ProgressBar
          value={progressValue}
          max={100}
          label="Прогресс модуля"
          tone={status === "completed" ? "success" : "default"}
        />

        {contentItems.length > 0 ? (
          <div className="space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Содержание</p>
            <ul className="flex flex-col gap-2">
              {contentItems.map((item) => (
                <ContentItemRow key={item.kind} item={item} />
              ))}
            </ul>
          </div>
        ) : null}

        {status === "locked" ? (
          <p
            className="rounded-xl border border-warning/25 bg-warning/5 px-3 py-2.5 text-sm leading-relaxed text-pretty text-muted-foreground"
            role="status"
          >
            {lockReason}
          </p>
        ) : null}

        {status === "completed" && row.score > 0 ? (
          <p className="text-xs text-muted-foreground">
            Набрано <span className="font-semibold tabular-nums text-success">{row.score}</span> баллов
          </p>
        ) : null}
      </div>

      <footer className="mt-auto shrink-0 border-t border-border/70 bg-muted/10 px-5 py-4 sm:px-6">
        <div className="flex min-h-12 flex-col gap-2 sm:flex-row">
          {action.disabled ? (
            <Button
              variant="outline"
              type="button"
              disabled
              className="min-h-12 w-full gap-2"
              aria-label="Модуль заблокирован"
            >
              <Lock className="size-4 opacity-70" aria-hidden />
              {action.label}
            </Button>
          ) : (
            <Button
              asChild
              variant={status === "completed" || status === "pending_review" ? "outline" : "primary"}
              className="min-h-12 w-full focus-visible:ring-2 focus-visible:ring-ring sm:flex-1"
            >
              <TrackableLink
                href={action.href}
                event={
                  action.href === hubHref
                    ? AnalyticsEvents.moduleOpened
                    : AnalyticsEvents.courseContinueClicked
                }
                analytics={{
                  moduleId: row.module.id,
                  source: action.href === hubHref ? "module_card_cta" : "module_card_continue",
                }}
              >
                {status !== "completed" && status !== "pending_review" ? (
                  <Play className="size-4" aria-hidden />
                ) : null}
                {action.label}
              </TrackableLink>
            </Button>
          )}
          {row.unlocked ? (
            <Button
              asChild
              variant="ghost"
              className="min-h-12 w-full focus-visible:ring-2 focus-visible:ring-ring sm:w-auto"
            >
              <TrackableLink
                href={hubHref}
                event={AnalyticsEvents.moduleOpened}
                analytics={{ moduleId: row.module.id, source: "module_card_overview" }}
              >
                Обзор
              </TrackableLink>
            </Button>
          ) : (
            <span className="hidden min-h-12 sm:block sm:min-w-[5.5rem]" aria-hidden />
          )}
        </div>
      </footer>
    </article>
  );
}
