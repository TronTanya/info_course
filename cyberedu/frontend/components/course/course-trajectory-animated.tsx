"use client";

import { motion, useReducedMotion } from "framer-motion";
import { CourseModuleNodeIcon } from "@/components/course/course-module-node-icon";
import type { CourseProgressModuleRow } from "@/lib/progress";
import { getUiStatus } from "@/lib/course-path-ui";
import type { CourseEntityUiStatus } from "@/types/course-ui-status";
import { cn } from "@/lib/utils";

function TrajectoryNode({ row, isLast, index }: { row: CourseProgressModuleRow; isLast: boolean; index: number }) {
  const reduce = useReducedMotion();
  const status = getUiStatus(row);
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
        <div className="relative" title={row.module.title}>
          <CourseModuleNodeIcon
            orderNumber={row.module.orderNumber}
            status={status as CourseEntityUiStatus}
            className="size-11 sm:size-12 sm:text-base"
          />
          {status === "in_progress" ? (
            <span
              className="absolute -bottom-0.5 left-1/2 h-1 w-6 -translate-x-1/2 rounded-full bg-primary/80 motion-safe:animate-pulse"
              aria-hidden
            />
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
    <div className="ce-learn-panel ce-glass space-y-3 rounded-2xl p-4 shadow-(--shadow-card) sm:p-5">
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
