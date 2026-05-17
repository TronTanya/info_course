"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { CourseProgressModuleRow } from "@/lib/progress";
import { getUiStatus } from "@/lib/course-path-ui";
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
    <svg className={cn("size-3.5 shrink-0", className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
      <path d="M5 12l5 5L20 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TrajectoryNode({ row, isLast, index }: { row: CourseProgressModuleRow; isLast: boolean; index: number }) {
  const reduce = useReducedMotion();
  const status = getUiStatus(row);
  const ring =
    status === "completed"
      ? "border-success/50 bg-success/15 text-success"
      : status === "in_progress"
        ? "border-sky-500/55 bg-sky-500/12 text-sky-800 dark:text-sky-200"
        : status === "available"
          ? "border-primary/50 bg-primary/10 text-primary"
          : "border-muted-foreground/35 bg-muted/50 text-muted-foreground";

  return (
    <motion.div
      className="flex min-w-0 flex-1 items-center"
      initial={reduce ? false : { opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.08, duration: 0.35 }}
    >
      <motion.div
        className="flex min-w-0 flex-1 flex-col items-center gap-1.5"
        whileHover={reduce ? undefined : { scale: 1.04 }}
      >
        <div
          className={cn(
            "relative flex size-11 shrink-0 items-center justify-center rounded-2xl border-2 text-sm font-bold tabular-nums shadow-sm sm:size-12 sm:text-base",
            ring,
          )}
          title={row.module.title}
        >
          {status === "locked" ? <LockIcon className="size-4" /> : <span>{row.module.orderNumber}</span>}
          {status === "completed" ? (
            <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-success text-white shadow ring-1 ring-success/40">
              <CheckIcon className="text-white" />
            </span>
          ) : null}
          {status === "in_progress" ? (
            <span className="absolute -bottom-0.5 left-1/2 h-1 w-6 -translate-x-1/2 rounded-full bg-sky-500/80 motion-safe:animate-pulse" aria-hidden />
          ) : null}
        </div>
        <span className="max-w-[4.5rem] truncate text-center text-[10px] font-semibold uppercase tracking-wide text-muted-foreground sm:max-w-[6rem] sm:text-[11px]">
          М{row.module.orderNumber}
        </span>
      </motion.div>
      {!isLast ? (
        <motion.div
          className={cn(
            "mx-0.5 h-0.5 min-w-[6px] flex-1 rounded-full sm:mx-1",
            row.moduleCompleted ? "bg-success/35" : row.unlocked ? "bg-primary/25" : "bg-border",
          )}
          initial={reduce ? false : { scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: index * 0.08 + 0.15, duration: 0.4 }}
          style={{ originX: 0 }}
          aria-hidden
        />
      ) : null}
    </motion.div>
  );
}

export function CourseTrajectoryAnimated({ modules }: { modules: CourseProgressModuleRow[] }) {
  if (modules.length === 0) {
    return <p className="text-sm text-muted-foreground">Модули появятся после настройки курса.</p>;
  }

  return (
    <div className="ce-learn-panel ce-border-beam ce-glass space-y-3 rounded-2xl p-4 shadow-(--shadow-card) sm:p-5">
      <p className="text-center font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan/90">Learning path</p>
      <div className="overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch] md:overflow-visible">
        <div className="flex min-w-min items-center px-1 md:min-w-0">
          {modules.map((row, index) => (
            <TrajectoryNode key={row.module.id} row={row} isLast={index === modules.length - 1} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
}
