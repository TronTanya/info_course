"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { BookOpen, ClipboardCheck, Clock, FlaskConical, Lock, Target } from "lucide-react";
import type { CourseProgressModuleRow } from "@/lib/progress";
import {
  getLockedUnlockHint,
  getModuleAction,
  getModuleContentMeta,
  getNextModuleRow,
  getRoadmapStatus,
  moduleDifficultyByOrder,
  moduleTimeEstimate,
  roadmapStatusBadge,
} from "@/lib/course-path-ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PremiumCard } from "@/components/ui/premium-card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { cn } from "@/lib/utils";

function nodeRing(status: ReturnType<typeof getRoadmapStatus>): string {
  switch (status) {
    case "completed":
      return "border-success/50 bg-success/15 text-success shadow-[0_0_16px_color-mix(in_oklab,var(--success)_25%,transparent)]";
    case "current":
      return "border-primary bg-primary/20 text-primary shadow-[0_0_20px_color-mix(in_oklab,var(--primary)_35%,transparent)]";
    case "in_progress":
      return "border-primary/50 bg-primary/12 text-primary";
    case "available":
      return "border-primary/35 bg-primary/8 text-primary";
    default:
      return "border-muted-foreground/35 bg-muted/40 text-muted-foreground";
  }
}

function MissionNode({
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
  const status = getRoadmapStatus(row, focusModuleId);
  const badge = roadmapStatusBadge[status];
  const action = getModuleAction(row);
  const meta = getModuleContentMeta(row);
  const desc = row.module.description?.trim() || "Лекция, тест и практический сценарий в учебной среде.";
  const estimate = moduleTimeEstimate(row.requirements);
  const difficulty = moduleDifficultyByOrder(row.module.orderNumber);
  const hubHref = `/dashboard/course/${row.module.id}`;
  const next = getNextModuleRow(modules, row.module.id);
  const lockedHint = getLockedUnlockHint(row, modules);

  return (
    <motion.li
      className="relative flex gap-4 sm:gap-5"
      initial={reduce ? false : { opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04, duration: 0.28 }}
    >
      <div className="flex flex-col items-center">
        <div
          className={cn(
            "relative z-[1] flex size-11 shrink-0 items-center justify-center rounded-xl border-2 font-mono text-sm font-bold tabular-nums sm:size-12",
            nodeRing(status),
          )}
          aria-hidden
        >
          {status === "locked" ? <Lock className="size-4" /> : row.module.orderNumber}
        </div>
        {!isLast ? (
          <div
            className={cn(
              "mt-1 w-0.5 flex-1 min-h-[2rem] rounded-full",
              row.moduleCompleted ? "bg-success/45" : row.unlocked ? "bg-primary/30" : "bg-border",
            )}
            aria-hidden
          />
        ) : null}
      </div>

      <PremiumCard
        variant={status === "current" ? "glow" : "default"}
        padding="md"
        className={cn(
          "mb-6 min-w-0 flex-1",
          status === "locked" && "opacity-90",
          status === "completed" && "border-success/25",
        )}
      >
        <div className="flex flex-wrap items-start justify-between gap-2">
          <Badge variant={badge.variant} className={cn("shrink-0 gap-1", badge.className)}>
            {status === "locked" ? <Lock className="size-3" aria-hidden /> : null}
            {badge.label}
          </Badge>
          {status === "current" ? (
            <span className="inline-flex items-center gap-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-primary">
              <Target className="size-3" aria-hidden />
              Mission active
            </span>
          ) : null}
        </div>

        <div className="mt-3 space-y-2">
          {row.unlocked ? (
            <Link href={hubHref} className="block rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <h3 className="font-display text-lg font-semibold leading-snug text-foreground hover:text-primary">
                {row.module.title}
              </h3>
            </Link>
          ) : (
            <h3 className="font-display text-lg font-semibold leading-snug text-foreground">{row.module.title}</h3>
          )}
          <p className="text-sm leading-relaxed text-pretty text-muted-foreground line-clamp-3">{desc}</p>
        </div>

        {status === "locked" ? (
          <p className="mt-3 rounded-lg border border-border/80 bg-muted/25 px-3 py-2 text-xs text-pretty text-muted-foreground">
            {lockedHint}
          </p>
        ) : null}

        <dl className="mt-4 flex flex-wrap gap-2">
          <MetaChip icon={BookOpen} label={meta.lessonsLabel} />
          <MetaChip icon={ClipboardCheck} label={meta.testsLabel} />
          <MetaChip icon={FlaskConical} label={meta.practicesLabel} />
          {estimate !== "—" ? <MetaChip icon={Clock} label={estimate} /> : null}
          <MetaChip label={difficulty} />
        </dl>

        <ProgressBar
          className="mt-4"
          label="Прогресс модуля"
          value={row.unlocked ? row.progressPercent : 0}
          max={100}
          tone={status === "completed" ? "success" : "default"}
        />

        {status === "completed" && row.score > 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">
            Результат: <span className="font-semibold tabular-nums text-success">{row.score} баллов</span>
          </p>
        ) : null}

        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          {action.disabled ? (
            <Button variant="outline" disabled className="w-full gap-2 sm:w-auto">
              <Lock className="size-4" aria-hidden />
              Закрыт
            </Button>
          ) : (
            <>
              <Button asChild variant={status === "completed" ? "outline" : "primary"} className="w-full sm:w-auto">
                <Link href={action.href}>{action.label}</Link>
              </Button>
              {status === "completed" && next?.unlocked ? (
                <Button asChild variant="ghost" className="w-full sm:w-auto">
                  <Link href={`/dashboard/course/${next.module.id}`}>Дальше → модуль {next.module.orderNumber}</Link>
                </Button>
              ) : (
                <Button asChild variant="ghost" className="w-full sm:w-auto">
                  <Link href={hubHref}>Обзор модуля</Link>
                </Button>
              )}
            </>
          )}
        </div>
      </PremiumCard>
    </motion.li>
  );
}

function MetaChip({
  icon: Icon,
  label,
}: {
  icon?: typeof BookOpen;
  label: string;
}) {
  return (
    <div className="inline-flex items-center gap-1.5 rounded-lg border border-border/70 bg-muted/20 px-2 py-1 text-[11px] text-muted-foreground">
      {Icon ? <Icon className="size-3 shrink-0 text-primary" aria-hidden /> : null}
      <span>{label}</span>
    </div>
  );
}

export function CourseMissionRoadmap({
  modules,
  focusModuleId,
}: {
  modules: CourseProgressModuleRow[];
  focusModuleId?: string | null;
}) {
  if (modules.length === 0) {
    return <p className="text-sm text-muted-foreground">Модули появятся после настройки курса.</p>;
  }

  return (
    <section className="space-y-4" aria-labelledby="course-mission-roadmap-heading">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="typo-eyebrow text-primary">Mission map</p>
          <h2 id="course-mission-roadmap-heading" className="font-display text-xl font-semibold text-foreground sm:text-2xl">
            Cyber mission roadmap
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-pretty text-muted-foreground">
            Модули открываются по порядку. Текущая миссия подсвечена — закрытый контент недоступен до разблокировки.
          </p>
        </div>
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          <li className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-success" aria-hidden /> Завершён
          </li>
          <li className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-primary" aria-hidden /> Текущий
          </li>
          <li className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-primary/40" aria-hidden /> Доступен
          </li>
          <li className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-muted-foreground/40" aria-hidden /> Закрыт
          </li>
        </ul>
      </div>

      <ol className="list-none p-0 lg:max-w-3xl">
        {modules.map((row, index) => (
          <MissionNode
            key={row.module.id}
            row={row}
            modules={modules}
            focusModuleId={focusModuleId}
            isLast={index === modules.length - 1}
            index={index}
          />
        ))}
      </ol>

      <div className="hidden lg:block">
        <p className="typo-caption text-muted-foreground">
          На широком экране детали каждого модуля также доступны в карточках ниже.
        </p>
      </div>
    </section>
  );
}
