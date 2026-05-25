"use client";

import Link from "next/link";
import { TrackableLink } from "@/components/analytics/trackable-link";
import { AnalyticsEvents } from "@/lib/analytics/events";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronDown, Lock, Play } from "lucide-react";
import { CourseModuleNodeIcon } from "@/components/course/course-module-node-icon";
import { CourseStepIcon } from "@/components/course/course-step-icon";
import {
  ROADMAP_STEP_ICON_KIND,
  type CourseStepIconKind,
  type CourseStepIconStatus,
} from "@/lib/course-step-icons";
import type { CourseProgressModuleRow } from "@/lib/progress";
import { CourseCertificateMilestone } from "@/components/course/course-certificate-milestone";
import {
  buildRoadmapInnerSteps,
  getCourseTrackSummary,
  getLockedUnlockHint,
  getModuleAction,
  getModuleSkillLine,
  getRoadmapDisplayStatus,
  isRoadmapFocusModule,
  moduleDifficultyByOrder,
  moduleTimeEstimate,
  roadmapModuleAnchorId,
  type RoadmapInnerStep,
} from "@/lib/course-path-ui";
import { getCourseStatusRailClass, getStatusBadgeConfig } from "@/lib/course-ui-status";
import type { CourseEntityUiStatus } from "@/types/course-ui-status";
import { CourseStatusBadge, CourseStatusFocusBadge } from "@/components/course/course-status-badge";
import { Button } from "@/components/ui/button";
import { CircularProgress } from "@/components/ui/circular-progress";
import { ProgressBar } from "@/components/ui/progress-bar";
import { cn } from "@/lib/utils";

function roadmapStepIconStatus(status: RoadmapInnerStep["status"]): CourseStepIconStatus {
  if (status === "locked") return "locked";
  if (status === "completed") return "completed";
  if (status === "in_progress") return "in_progress";
  if (status === "pending_review") return "pending_review";
  if (status === "needs_retry") return "needs_retry";
  return "available";
}

function useMinLg() {
  const [isLg, setIsLg] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const sync = () => setIsLg(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return isLg;
}

function connectorTone(row: CourseProgressModuleRow, next?: CourseProgressModuleRow): string {
  if (row.moduleCompleted) return getCourseStatusRailClass("completed");
  if (row.unlocked && next?.unlocked) return getCourseStatusRailClass("in_progress");
  return getCourseStatusRailClass("locked");
}

function RoadmapStepRow({ step, moduleLocked }: { step: RoadmapInnerStep; moduleLocked: boolean }) {
  const iconKind = ROADMAP_STEP_ICON_KIND[step.kind] as CourseStepIconKind;
  const clickable = Boolean(step.href) && !moduleLocked && step.status !== "locked";
  const badge = getStatusBadgeConfig(step.status);

  const content = (
    <div className="flex min-w-0 flex-1 items-center gap-3">
      <CourseStepIcon kind={iconKind} size="md" status={roadmapStepIconStatus(step.status)} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-foreground">{step.label}</p>
        <p className="text-xs text-muted-foreground">{step.blockedHint ?? badge.label}</p>
      </div>
      {clickable ? (
        <span className="hidden shrink-0 text-xs font-semibold text-primary sm:inline">Открыть →</span>
      ) : null}
    </div>
  );

  if (!clickable || !step.href) {
    return (
      <li
        className={cn(
          "rounded-xl border border-border/70 bg-muted/15 px-3 py-3",
          step.status === "locked" && "opacity-75",
        )}
      >
        {content}
      </li>
    );
  }

  return (
    <li>
      <Link
        href={step.href}
        className={cn(
          "flex min-h-12 items-center rounded-xl border px-3 py-3 transition-colors",
          "hover:border-primary/35 hover:bg-primary/5",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          step.status === "in_progress" ? "border-primary/35 bg-primary/8" : "border-border/80 bg-card/50",
        )}
      >
        {content}
      </Link>
    </li>
  );
}

function TimelineProgressSidebar({
  modules,
  focusModuleId,
  overallProgressPercent,
}: {
  modules: CourseProgressModuleRow[];
  focusModuleId?: string | null;
  overallProgressPercent: number;
}) {
  const track = getCourseTrackSummary(modules, focusModuleId);
  const tone = overallProgressPercent >= 100 ? "success" : "default";

  return (
    <aside
      className="ce-roadmap-timeline-sidebar ce-glass top-28 z-0 hidden h-fit max-h-[calc(100dvh-8rem)] overflow-y-auto overscroll-contain rounded-2xl border border-primary/15 p-5 lg:sticky lg:block"
      aria-label="Прогресс по карте курса"
    >
      <p className="typo-eyebrow text-primary">Трек</p>
      <p className="mt-1 font-display text-lg font-semibold text-foreground">Ваш маршрут</p>
      <div className="mt-4 flex items-center gap-4">
        <CircularProgress value={overallProgressPercent} size={72} strokeWidth={6} tone={tone} label="Курс" glow />
        <div>
          <p className="font-display text-3xl font-bold tabular-nums text-foreground">{overallProgressPercent}%</p>
          <p className="text-xs text-muted-foreground">
            {track.completedModules} / {track.totalModules} модулей
          </p>
        </div>
      </div>
      <ProgressBar className="mt-4" label="Программа" value={overallProgressPercent} max={100} tone={tone} />
      {track.focusTitle ? (
        <p className="mt-4 rounded-xl border border-primary/20 bg-primary/5 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
          <span className="font-semibold text-foreground">Сейчас: </span>
          {track.positionLabel}
        </p>
      ) : null}
      <p className="mt-3 text-xs text-pretty text-muted-foreground">{track.certificateHint}</p>
      <ul className="mt-5 space-y-2 border-t border-border/60 pt-4 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        {(
          [
            { key: "done", label: "Завершён", className: "bg-success" },
            { key: "current", label: "Текущий", className: "bg-primary" },
            { key: "open", label: "Доступен", className: "bg-primary/40" },
            { key: "lock", label: "Закрыт", className: "bg-muted-foreground/35" },
          ] as const
        ).map((item) => (
          <li key={item.key} className="flex items-center gap-2">
            <span className={cn("size-2 rounded-full", item.className)} aria-hidden />
            {item.label}
          </li>
        ))}
      </ul>
    </aside>
  );
}

function TimelineModuleCard({
  row,
  modules,
  focusModuleId,
  isLast,
  index,
  nextStepHref,
  nextStepLabel,
}: {
  row: CourseProgressModuleRow;
  modules: CourseProgressModuleRow[];
  focusModuleId?: string | null;
  isLast: boolean;
  index: number;
  nextStepHref?: string;
  nextStepLabel?: string;
}) {
  const reduce = useReducedMotion();
  const isLg = useMinLg();
  const displayStatus = getRoadmapDisplayStatus(row, focusModuleId) as CourseEntityUiStatus;
  const isFocus = isRoadmapFocusModule(row, focusModuleId);
  const action = getModuleAction(row);
  const innerSteps = buildRoadmapInnerSteps(row);
  const lockedHint = getLockedUnlockHint(row, modules);
  const hubHref = `/dashboard/course/${row.module.id}`;
  const estimate = moduleTimeEstimate(row.requirements);
  const skillLine = getModuleSkillLine(row);
  const difficulty = moduleDifficultyByOrder(row.module.orderNumber);
  const next = modules[index + 1];
  const moduleLocked = displayStatus === "locked";
  const [mobileOpen, setMobileOpen] = useState(isFocus);
  const detailsOpen = isLg || mobileOpen;

  const cardBody = (
    <>
      {displayStatus === "locked" ? (
        <p
          className="rounded-xl border border-warning/25 bg-warning/5 px-3 py-2 text-xs leading-relaxed text-pretty text-muted-foreground"
          role="status"
        >
          <span className="font-medium text-foreground">Почему закрыто: </span>
          {lockedHint}
        </p>
      ) : null}

      {isFocus && nextStepHref && nextStepLabel ? (
        <div className="rounded-xl border border-primary/25 bg-primary/8 px-3 py-2.5">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-primary">Рекомендуемый шаг</p>
          <Button asChild size="lg" className="mt-2 min-h-12 w-full touch-manipulation">
            <TrackableLink
              href={nextStepHref}
              event={AnalyticsEvents.courseContinueClicked}
              analytics={{ source: "roadmap_focus_step" }}
            >
              {nextStepLabel}
            </TrackableLink>
          </Button>
        </div>
      ) : null}

      {innerSteps.length > 0 ? (
        <div className="space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Шаги модуля</p>
          <ul className="flex flex-col gap-2">
            {innerSteps.map((step) => (
              <RoadmapStepRow key={step.kind} step={step} moduleLocked={moduleLocked} />
            ))}
          </ul>
        </div>
      ) : null}

      <ProgressBar
        label="Прогресс модуля"
        value={row.unlocked ? row.progressPercent : 0}
        max={100}
        tone={displayStatus === "completed" ? "success" : "default"}
      />

      {displayStatus === "completed" && row.score > 0 ? (
        <p className="text-xs text-muted-foreground">
          Набрано <span className="font-semibold tabular-nums text-success">{row.score}</span> баллов
        </p>
      ) : null}

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        {action.disabled ? (
          <Button variant="outline" disabled className="min-h-12 w-full touch-manipulation gap-2 lg:w-auto">
            <Lock className="size-4" aria-hidden />
            Модуль закрыт
          </Button>
        ) : (
          <Button
            asChild
            variant={displayStatus === "completed" ? "outline" : "primary"}
            className="min-h-12 w-full touch-manipulation lg:w-auto"
          >
            <Link href={action.href}>
              {displayStatus === "completed" ? (
                action.label
              ) : (
                <>
                  <Play className="size-4" aria-hidden />
                  {action.label}
                </>
              )}
            </Link>
          </Button>
        )}
        {row.unlocked ? (
          <Button asChild variant="ghost" className="min-h-12 w-full touch-manipulation lg:w-auto">
            <Link href={hubHref}>Обзор модуля</Link>
          </Button>
        ) : null}
      </div>
    </>
  );

  return (
    <motion.li
      className="ce-roadmap-timeline-item relative grid min-w-0 max-w-full grid-cols-[2.5rem_minmax(0,1fr)] gap-x-2.5 sm:grid-cols-[3rem_minmax(0,1fr)] sm:gap-x-4"
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="flex flex-col items-center pt-2">
        <CourseModuleNodeIcon
          orderNumber={row.module.orderNumber}
          status={displayStatus}
          isFocus={isFocus}
          className="relative z-[1]"
        />
        {!isLast ? (
          <div
            className={cn("ce-roadmap-timeline-rail mt-2 w-0.5 flex-1 min-h-[2rem] rounded-full", connectorTone(row, next))}
            aria-hidden
          />
        ) : null}
      </div>

      <article
        id={isFocus ? roadmapModuleAnchorId(row.module.id) : undefined}
        className={cn(
          "ce-roadmap-timeline-card ce-glass mb-4 min-w-0 max-w-full scroll-mt-24 rounded-2xl border p-0 shadow-card sm:mb-6 sm:scroll-mt-28 lg:mb-8",
          moduleLocked && "border-border/60 bg-muted/20 opacity-90 saturate-[0.85]",
          displayStatus === "completed" && "border-success/25",
          isFocus && "border-primary/40 shadow-[0_0_40px_-12px_hsl(var(--primary)/0.35)]",
        )}
      >
        <details
          className="group ce-roadmap-timeline-details"
          open={detailsOpen}
          onToggle={(e) => {
            if (!isLg) setMobileOpen(e.currentTarget.open);
          }}
        >
          <summary
            className={cn(
              "flex min-h-12 cursor-pointer list-none items-start gap-3 rounded-2xl p-4 touch-manipulation sm:min-h-0 sm:p-5 lg:cursor-default",
              "[&::-webkit-details-marker]:hidden",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
            )}
          >
            <div className="min-w-0 flex-1 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                {isFocus ? (
                  <CourseStatusFocusBadge className="font-mono text-[10px] uppercase tracking-wider" />
                ) : (
                  <CourseStatusBadge status={displayStatus} />
                )}
              </div>
              {row.unlocked ? (
                <Link
                  href={hubHref}
                  onClick={(e) => e.stopPropagation()}
                  className="block rounded-sm font-display text-lg font-semibold leading-snug text-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:text-xl"
                >
                  {row.module.title}
                </Link>
              ) : (
                <h3 className="font-display text-lg font-semibold leading-snug text-foreground sm:text-xl">
                  {row.module.title}
                </h3>
              )}
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                {estimate !== "—" ? <span>{estimate}</span> : null}
                <span className="tabular-nums">{row.unlocked ? row.progressPercent : 0}% модуля</span>
              </div>
              {!isLg ? (
                <ProgressBar
                  className="max-lg:block lg:hidden"
                  label=""
                  value={row.unlocked ? row.progressPercent : 0}
                  max={100}
                  tone={displayStatus === "completed" ? "success" : "default"}
                />
              ) : null}
            </div>
            <ChevronDown
              className="size-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180 lg:hidden"
              aria-hidden
            />
          </summary>

          <div className="space-y-4 border-t border-border/60 px-4 pb-4 pt-0 sm:space-y-5 sm:px-5 sm:pb-5 lg:border-t-0 lg:px-5 lg:pb-5 lg:pt-0">
            {row.module.description ? (
              <p className="text-sm text-pretty leading-relaxed text-muted-foreground lg:-mt-1">{row.module.description}</p>
            ) : null}
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Навык: </span>
              {skillLine}
              <span className="mx-2 text-border">·</span>
              {difficulty}
            </p>
            {cardBody}
          </div>
        </details>
      </article>
    </motion.li>
  );
}

/** Визуальная карта курса: вертикальный timeline с шагами урок → тест → практика. */
export function CourseRoadmapTimeline({
  modules,
  focusModuleId,
  overallProgressPercent = 0,
  nextStepHref,
  nextStepLabel,
  className,
}: {
  modules: CourseProgressModuleRow[];
  focusModuleId?: string | null;
  overallProgressPercent?: number;
  nextStepHref?: string;
  nextStepLabel?: string;
  className?: string;
}) {
  if (modules.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-border/80 bg-muted/20 px-4 py-8 text-center text-sm text-muted-foreground">
        Модули курса появятся после настройки программы администратором.
      </p>
    );
  }

  const track = getCourseTrackSummary(modules, focusModuleId);

  return (
    <section
      className={cn("ce-roadmap-timeline min-w-0 max-w-full", className)}
      aria-labelledby="course-roadmap-timeline-heading"
    >
      <div className="mb-6 flex flex-col gap-2 sm:mb-8">
        <p className="typo-eyebrow text-primary">Карта обучения</p>
        <h2 id="course-roadmap-timeline-heading" className="font-display text-xl font-semibold text-foreground sm:text-2xl">
          Маршрут по модулям
        </h2>
        <p className="max-w-2xl text-sm text-pretty text-muted-foreground">
          Идите сверху вниз: в каждом модуле — урок, тест и практика. Закрытые блоки откроются после предыдущего
          модуля. Подсвеченная карточка — где вы сейчас.
        </p>
        <p className="text-xs text-muted-foreground lg:hidden">Нажмите на модуль, чтобы раскрыть шаги и действия.</p>
      </div>

      <div className="grid min-w-0 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(200px,240px)] lg:items-start">
        <ol className="ce-roadmap-timeline-track relative min-w-0 list-none p-0">
          {modules.map((row, index) => (
            <TimelineModuleCard
              key={row.module.id}
              row={row}
              modules={modules}
              focusModuleId={focusModuleId}
              isLast={index === modules.length - 1}
              index={index}
              nextStepHref={isRoadmapFocusModule(row, focusModuleId) ? nextStepHref : undefined}
              nextStepLabel={isRoadmapFocusModule(row, focusModuleId) ? nextStepLabel : undefined}
            />
          ))}
          <CourseCertificateMilestone modules={modules} />
        </ol>

        <TimelineProgressSidebar
          modules={modules}
          focusModuleId={focusModuleId}
          overallProgressPercent={overallProgressPercent}
        />
      </div>

      {track.focusModuleId ? (
        <p className="mt-2 text-center text-xs text-muted-foreground lg:hidden">
          <Link href={`#${roadmapModuleAnchorId(track.focusModuleId)}`} className="font-medium text-primary hover:underline">
            Перейти к текущему модулю ↓
          </Link>
        </p>
      ) : null}
    </section>
  );
}
