"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  Award,
  BookOpen,
  Check,
  ClipboardCheck,
  FlaskConical,
  Lock,
  Play,
} from "lucide-react";
import type { CourseProgressModuleRow } from "@/lib/progress";
import { CourseCertificateMilestone } from "@/components/course/course-certificate-milestone";
import {
  buildRoadmapInnerSteps,
  getLockedUnlockHint,
  getModuleAction,
  getRoadmapDisplayStatus,
  getRoadmapStatus,
  isRoadmapFocusModule,
  moduleTimeEstimate,
  roadmapModuleAnchorId,
  roadmapStatusBadge,
  statusBadge,
  type RoadmapInnerStep,
  type UiStatus,
} from "@/lib/course-path-ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { cn } from "@/lib/utils";

const STEP_ICONS = {
  lesson: BookOpen,
  test: ClipboardCheck,
  practice: FlaskConical,
} as const;

function displayStatusBadge(status: UiStatus, isFocus: boolean) {
  if (isFocus) {
    return { label: "В процессе", variant: "primary" as const, className: "border-primary/40 bg-primary/15" };
  }
  return statusBadge[status];
}

function nodeStyles(status: UiStatus, isFocus: boolean): string {
  if (status === "completed") {
    return "border-success/50 bg-success/15 text-success shadow-[0_0_20px_color-mix(in_oklab,var(--success)_28%,transparent)]";
  }
  if (isFocus || status === "in_progress") {
    return "border-primary bg-primary/20 text-primary shadow-[0_0_24px_color-mix(in_oklab,var(--primary)_38%,transparent)]";
  }
  if (status === "available") {
    return "border-primary/35 bg-primary/8 text-primary";
  }
  return "border-muted-foreground/35 bg-muted/40 text-muted-foreground";
}

function connectorTone(row: CourseProgressModuleRow, next?: CourseProgressModuleRow): string {
  if (row.moduleCompleted) return "bg-success/50";
  if (row.unlocked && next?.unlocked) return "bg-primary/35";
  return "bg-border/80";
}

function InnerStepPill({ step, moduleLocked }: { step: RoadmapInnerStep; moduleLocked: boolean }) {
  const Icon = STEP_ICONS[step.kind];
  const clickable = Boolean(step.href) && !moduleLocked && step.status !== "locked";
  const badge = statusBadge[step.status === "in_progress" ? "in_progress" : step.status];

  const inner = (
    <>
      <span
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-lg border",
          step.status === "completed" && "border-success/40 bg-success/10 text-success",
          step.status === "in_progress" && "border-primary/40 bg-primary/10 text-primary",
          step.status === "available" && "border-border/80 bg-muted/25 text-muted-foreground",
          step.status === "locked" && "border-border/60 bg-muted/20 text-muted-foreground",
        )}
        aria-hidden
      >
        {step.status === "completed" ? <Check className="size-3.5" /> : <Icon className="size-3.5" />}
      </span>
      <span className="min-w-0 flex-1 text-left">
        <span className="block text-xs font-semibold text-foreground">{step.label}</span>
        <span className="block text-[10px] text-muted-foreground">
          {step.blockedHint ?? badge.label}
        </span>
      </span>
    </>
  );

  if (!clickable || !step.href) {
    return (
      <div
        className={cn(
          "ce-roadmap-step flex min-h-11 min-w-0 flex-1 items-center gap-2 rounded-xl border border-border/70 bg-muted/15 px-2.5 py-2",
          step.status === "locked" && "opacity-80",
        )}
        title={step.blockedHint}
      >
        {inner}
      </div>
    );
  }

  return (
    <Link
      href={step.href}
      className={cn(
        "ce-roadmap-step flex min-h-11 min-w-0 flex-1 items-center gap-2 rounded-xl border px-2.5 py-2",
        "transition-[transform,border-color,box-shadow,background-color] duration-200",
        "hover:-translate-y-0.5 hover:border-primary/35 hover:bg-primary/5 hover:shadow-sm",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        step.status === "in_progress" ? "border-primary/35 bg-primary/8" : "border-border/80 bg-card/60",
      )}
    >
      {inner}
    </Link>
  );
}

function RoadmapModuleCard({
  row,
  modules,
  focusModuleId,
  isLast,
  index,
}: {
  row: CourseProgressModuleRow;
  modules: CourseProgressModuleRow[];
  focusModuleId?: string | null;
  isLast: boolean;
  index: number;
}) {
  const reduce = useReducedMotion();
  const displayStatus = getRoadmapDisplayStatus(row, focusModuleId);
  const isFocus = isRoadmapFocusModule(row, focusModuleId);
  const badge = displayStatusBadge(displayStatus, isFocus);
  const action = getModuleAction(row);
  const innerSteps = buildRoadmapInnerSteps(row);
  const lockedHint = getLockedUnlockHint(row, modules);
  const hubHref = `/dashboard/course/${row.module.id}`;
  const estimate = moduleTimeEstimate(row.requirements);
  const next = modules[index + 1];

  return (
    <motion.li
      className="ce-roadmap-module relative grid grid-cols-[auto_1fr] gap-3 sm:gap-5"
      initial={reduce ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="flex flex-col items-center pt-1">
        <div
          className={cn(
            "relative z-[1] flex size-11 shrink-0 items-center justify-center rounded-2xl border-2 font-mono text-sm font-bold tabular-nums sm:size-12",
            "transition-[box-shadow,transform] duration-200 motion-safe:group-hover:scale-[1.02]",
            nodeStyles(displayStatus, isFocus),
            isFocus && "motion-safe:animate-pulse motion-reduce:animate-none",
          )}
          aria-hidden
        >
          {displayStatus === "locked" ? <Lock className="size-4" /> : row.module.orderNumber}
        </div>
        {!isLast ? (
          <div
            className={cn("ce-roadmap-rail mt-2 w-0.5 flex-1 min-h-[1.5rem] rounded-full", connectorTone(row, next))}
            aria-hidden
          />
        ) : null}
      </div>

      <article
        id={isFocus ? roadmapModuleAnchorId(row.module.id) : undefined}
        className={cn(
          "ce-roadmap-module-card group mb-5 min-w-0 scroll-mt-28 rounded-2xl border bg-card/85 p-4 shadow-card backdrop-blur-sm sm:p-5",
          "transition-[border-color,box-shadow,transform] duration-200",
          "motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-[var(--shadow-card-hover)]",
          "focus-within:ring-2 focus-within:ring-ring/60 focus-within:ring-offset-2 focus-within:ring-offset-background",
          displayStatus === "locked" && "border-border/70 bg-muted/15 opacity-95",
          displayStatus === "completed" && "border-success/25",
          isFocus && "border-primary/35 shadow-[var(--shadow-glow)]",
          displayStatus === "available" && "border-border/80",
        )}
      >
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={badge.variant} className={cn("gap-1", badge.className)}>
              {displayStatus === "locked" ? <Lock className="size-3" aria-hidden /> : null}
              {badge.label}
            </Badge>
            {isFocus ? (
              <Badge variant="primary" className="gap-1 border-primary/40 bg-primary/15 font-mono text-[10px] uppercase">
                Вы здесь
              </Badge>
            ) : null}
          </div>
          {estimate !== "—" ? (
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{estimate}</span>
          ) : null}
        </div>

        <div className="mt-3 space-y-1">
          {row.unlocked ? (
            <Link
              href={hubHref}
              className="inline-block rounded-sm font-display text-lg font-semibold leading-snug text-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {row.module.title}
            </Link>
          ) : (
            <h3 className="font-display text-lg font-semibold leading-snug text-foreground">{row.module.title}</h3>
          )}
          {row.module.description ? (
            <p className="line-clamp-2 text-sm text-pretty text-muted-foreground">{row.module.description}</p>
          ) : null}
        </div>

        {displayStatus === "locked" ? (
          <p
            className="mt-3 rounded-xl border border-warning/25 bg-warning/5 px-3 py-2 text-xs leading-relaxed text-pretty text-muted-foreground"
            role="status"
          >
            <span className="font-medium text-foreground">Почему закрыто: </span>
            {lockedHint}
          </p>
        ) : null}

        {innerSteps.length > 0 ? (
          <div className="mt-4 space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Внутри модуля</p>
            <ul className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              {innerSteps.map((step) => (
                <li key={step.kind} className="min-w-0 flex-1 sm:min-w-[7.5rem] sm:max-w-[11rem]">
                  <InnerStepPill step={step} moduleLocked={displayStatus === "locked"} />
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <ProgressBar
          className="mt-4"
          label="Прогресс модуля"
          value={row.unlocked ? row.progressPercent : 0}
          max={100}
          tone={displayStatus === "completed" ? "success" : "default"}
        />

        {displayStatus === "completed" && row.score > 0 ? (
          <p className="mt-2 text-xs text-muted-foreground">
            Набрано <span className="font-semibold tabular-nums text-success">{row.score}</span> баллов
          </p>
        ) : null}

        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          {action.disabled ? (
            <Button variant="outline" disabled className="w-full gap-2 sm:w-auto">
              <Lock className="size-4" aria-hidden />
              Модуль закрыт
            </Button>
          ) : (
            <Button
              asChild
              variant={displayStatus === "completed" ? "outline" : "primary"}
              className="w-full sm:w-auto"
            >
              <Link href={action.href}>
                {displayStatus === "completed" ? (
                  "Повторить модуль"
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
            <Button asChild variant="ghost" className="w-full sm:w-auto">
              <Link href={hubHref}>Обзор модуля</Link>
            </Button>
          ) : null}
        </div>
      </article>
    </motion.li>
  );
}

function RoadmapLegend() {
  const items: { status: UiStatus; label: string; className: string }[] = [
    { status: "completed", label: "Завершён", className: "bg-success" },
    { status: "in_progress", label: "В процессе", className: "bg-primary" },
    { status: "available", label: "Доступен", className: "bg-primary/40" },
    { status: "locked", label: "Закрыт", className: "bg-muted-foreground/35" },
  ];

  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-2 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
      {items.map((item) => (
        <li key={item.status} className="flex items-center gap-1.5">
          <span className={cn("size-2 rounded-full", item.className)} aria-hidden />
          {item.label}
        </li>
      ))}
    </ul>
  );
}

/** @deprecated Используйте `CourseRoadmapTimeline`. */
export function CourseLearningRoadmap({
  modules,
  focusModuleId,
}: {
  modules: CourseProgressModuleRow[];
  focusModuleId?: string | null;
}) {
  if (modules.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-border/80 bg-muted/20 px-4 py-8 text-center text-sm text-muted-foreground">
        Модули курса появятся после настройки программы администратором.
      </p>
    );
  }

  return (
    <section className="ce-learning-roadmap space-y-5" aria-labelledby="course-roadmap-heading">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="typo-eyebrow text-primary">Карта обучения</p>
          <h2 id="course-roadmap-heading" className="font-display text-xl font-semibold text-foreground sm:text-2xl">
            Карта модулей
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-pretty text-muted-foreground">
            Зелёные узлы — завершённые модули, подсвеченный — текущий. Закрытые блоки откроются после предыдущего модуля.
            Внутри: урок → тест → практика (без ответов на карте).
          </p>
        </div>
        <RoadmapLegend />
      </div>

      <div className="ce-scroll-x-contained -mx-1 px-1 pb-2 lg:hidden">
        <ol className="flex min-w-min list-none gap-0 p-0">
          {modules.map((row, index) => {
            const status = getRoadmapDisplayStatus(row, focusModuleId);
            const isFocus = isRoadmapFocusModule(row, focusModuleId);
            const badge = roadmapStatusBadge[getRoadmapStatus(row, focusModuleId)];
            const href = row.unlocked ? `/dashboard/course/${row.module.id}` : undefined;
            return (
              <li key={row.module.id} className="flex items-center">
                {href ? (
                  <Link
                    href={href}
                    className="flex min-w-[4.5rem] flex-col items-center gap-1 rounded-xl p-2 transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label={`Модуль ${row.module.orderNumber}: ${row.module.title}, ${badge.label}`}
                  >
                    <span
                      className={cn(
                        "flex size-10 items-center justify-center rounded-xl border-2 font-mono text-xs font-bold",
                        nodeStyles(status, isFocus),
                      )}
                    >
                      {status === "locked" ? <Lock className="size-3.5" /> : row.module.orderNumber}
                    </span>
                    <span className="line-clamp-2 max-w-[5rem] text-center text-[9px] text-muted-foreground">
                      {row.module.title}
                    </span>
                  </Link>
                ) : (
                  <div className="flex min-w-[4.5rem] flex-col items-center gap-1 p-2" title={getLockedUnlockHint(row, modules)}>
                    <span
                      className={cn(
                        "flex size-10 items-center justify-center rounded-xl border-2",
                        nodeStyles(status, false),
                      )}
                    >
                      <Lock className="size-3.5" />
                    </span>
                  </div>
                )}
                {index < modules.length - 1 ? (
                  <div className={cn("h-0.5 w-6 shrink-0 rounded-full sm:w-10", connectorTone(row, modules[index + 1]))} aria-hidden />
                ) : null}
              </li>
            );
          })}
          <li className="flex items-center pl-1" aria-hidden>
            <span className="flex size-10 items-center justify-center rounded-xl border border-dashed border-border/80 bg-muted/20 text-muted-foreground">
              <Award className="size-4" />
            </span>
          </li>
        </ol>
      </div>

      <ol className="list-none p-0 lg:max-w-4xl">
        {modules.map((row, index) => (
          <RoadmapModuleCard
            key={row.module.id}
            row={row}
            modules={modules}
            focusModuleId={focusModuleId}
            isLast={index === modules.length - 1}
            index={index}
          />
        ))}
        <CourseCertificateMilestone modules={modules} />
      </ol>
    </section>
  );
}
