"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import type { CourseProgressModuleRow } from "@/lib/progress";
import {
  buildModuleTrackSteps,
  getModuleAction,
  getUiStatus,
  moduleDifficultyLabel,
  moduleTimeEstimate,
  statusBadge,
} from "@/lib/course-path-ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { cn } from "@/lib/utils";

function LockIcon({ className }: { className?: string }) {
  return (
    <svg className={cn("size-4 shrink-0", className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M7 11V8a5 5 0 0110 0v3" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={cn("size-4 shrink-0", className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
      <path d="M5 12l5 5L20 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BookIcon({ className }: { className?: string }) {
  return (
    <svg className={cn("size-4 shrink-0", className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20" strokeLinecap="round" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2Z" strokeLinejoin="round" />
    </svg>
  );
}

function TrackSteps({ row }: { row: CourseProgressModuleRow }) {
  const locked = !row.unlocked;
  const steps = buildModuleTrackSteps(row);

  if (steps.length === 0) {
    return <p className="text-xs text-muted-foreground">В модуле нет пошагового трека.</p>;
  }

  return (
    <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4" aria-label="Шаги модуля">
      {steps.map((s, i) => (
        <motion.li
          key={s.key}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.05, duration: 0.25 }}
          className={cn(
            "flex min-w-0 items-center gap-2 rounded-xl border px-3 py-2.5 text-xs shadow-sm",
            "border-border/70 bg-linear-to-br from-muted/25 to-card/90",
            locked && "border-dashed opacity-90",
            !locked && s.done && "border-success/35 bg-success/10 ring-1 ring-inset ring-success/15",
            !locked && !s.done && "border-sky-500/30 bg-sky-500/8 ring-1 ring-inset ring-sky-500/10",
          )}
        >
          {s.done ? (
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-success/20 text-success">
              <CheckIcon className="size-3.5" />
            </span>
          ) : (
            <span className="size-6 shrink-0 rounded-full border-2 border-muted-foreground/30" aria-hidden />
          )}
          <span className="font-semibold text-foreground">{s.label}</span>
        </motion.li>
      ))}
    </ul>
  );
}

export function CourseModuleCard({ row, index = 0 }: { row: CourseProgressModuleRow; index?: number }) {
  const reduce = useReducedMotion();
  const status = getUiStatus(row);
  const badge = statusBadge[status];
  const action = getModuleAction(row);
  const desc = row.module.description?.trim() || "Описание модуля можно дополнить в админ-панели.";
  const diff = moduleDifficultyLabel(row.requirements);
  const time = moduleTimeEstimate(row.requirements);

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 20 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: (index % 6) * 0.06, ease: [0.22, 1, 0.36, 1] }}
      whileHover={reduce ? undefined : { y: -4 }}
      className="h-full"
    >
      <Card
        className={cn(
          "ce-card-glow ce-learn-panel relative flex h-full w-full min-w-0 max-w-full flex-col overflow-hidden shadow-card transition-shadow duration-300",
          status === "locked" && "border-muted-foreground/30 bg-muted/40 opacity-[0.97]",
          status === "available" && "border-success/35 bg-linear-to-br from-card via-emerald-500/[0.04] to-card ring-1 ring-inset ring-success/10",
          status === "in_progress" && "border-sky-500/40 bg-linear-to-br from-card via-sky-500/[0.06] to-card ring-1 ring-inset ring-sky-500/15",
          status === "completed" && "border-success/40 bg-linear-to-br from-success/[0.07] via-card to-card ring-1 ring-inset ring-success/15",
        )}
      >
        <div
          className={cn(
            "absolute inset-x-0 top-0 h-1",
            status === "locked" && "bg-muted-foreground/25",
            status === "available" && "bg-linear-to-r from-success via-emerald-400 to-success/70",
            status === "in_progress" && "bg-linear-to-r from-sky-500 via-primary to-sky-400",
            status === "completed" && "bg-linear-to-r from-success via-emerald-300 to-success",
          )}
          aria-hidden
        />
        <CardHeader className="space-y-3 pb-2 pt-4 sm:pt-5">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="flex min-w-0 items-start gap-2">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-border/80 bg-muted/40 text-muted-foreground sm:size-10">
                <BookIcon className="size-4 sm:size-[1.125rem]" />
              </span>
              <div className="min-w-0 space-y-1">
                <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-cyan/80">
                  Module {row.module.orderNumber}
                </p>
                <CardTitle className="text-base leading-snug text-foreground sm:text-lg">{row.module.title}</CardTitle>
              </div>
            </div>
            <Badge variant={badge.variant} className={cn("shrink-0 gap-1", badge.className)}>
              {status === "locked" ? <LockIcon className="size-3.5 opacity-80" /> : null}
              {status === "completed" ? <CheckIcon className="size-3.5" /> : null}
              {badge.label}
            </Badge>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="font-normal text-muted-foreground">
              Сложность: <span className="font-medium text-foreground">{diff}</span>
            </Badge>
            <Badge variant="outline" className="font-normal tabular-nums text-muted-foreground">
              Время: <span className="font-medium text-foreground">{time}</span>
            </Badge>
          </div>
          <CardDescription className="text-sm leading-relaxed text-pretty text-muted-foreground">{desc}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col gap-4 pt-0">
          <ProgressBar
            value={row.unlocked ? row.progressPercent : 0}
            max={100}
            tone={status === "completed" ? "success" : status === "available" ? "success" : "default"}
            label={row.unlocked ? "Шаги модуля" : "Модуль закрыт"}
          />
          <TrackSteps row={row} />
          <Badge variant="outline" className="w-fit font-normal tabular-nums">
            Баллы: <span className="font-semibold text-foreground">{row.score}</span>
          </Badge>
        </CardContent>
        <div className="mt-auto border-t border-border/60 bg-linear-to-r from-muted/20 via-card to-muted/15 px-4 py-3.5 sm:px-6 sm:py-4">
          {action.disabled ? (
            <Button className="inline-flex w-full items-center justify-center gap-2 text-xs sm:text-sm" variant="outline" type="button" disabled>
              <LockIcon className="size-4 shrink-0 opacity-70" />
              <span className="text-left leading-snug">{action.label}</span>
            </Button>
          ) : (
            <Button className="w-full" variant={status === "completed" ? "outline" : "primary"} asChild>
              <Link href={action.href}>{action.label}</Link>
            </Button>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
