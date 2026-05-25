"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { CourseModuleNodeIcon } from "@/components/course/course-module-node-icon";
import type { CourseProgressModuleRow } from "@/lib/progress";
import { getUiStatus, statusBadge } from "@/lib/course-path-ui";
import type { CourseEntityUiStatus } from "@/types/course-ui-status";
import { cn } from "@/lib/utils";

function TrajectoryNode({
  row,
  isLast,
  index,
  isFocus,
}: {
  row: CourseProgressModuleRow;
  isLast: boolean;
  index: number;
  isFocus: boolean;
}) {
  const reduce = useReducedMotion();
  const status = getUiStatus(row);
  const badge = statusBadge[status];
  const href = `/dashboard/course/${row.module.id}`;
  const canOpen = row.unlocked;

  const node = (
    <CourseModuleNodeIcon
      orderNumber={row.module.orderNumber}
      status={status as CourseEntityUiStatus}
      isFocus={isFocus}
      className="size-10 sm:size-11"
    />
  );

  return (
    <motion.div
      className="flex min-w-[4.25rem] max-w-[5.5rem] shrink-0 flex-col items-center sm:min-w-[5rem] sm:max-w-[6.5rem]"
      initial={reduce ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      <div className="flex w-full items-center">
        {canOpen ? (
          <Link
            href={href}
            className="flex flex-1 flex-col items-center gap-1.5 rounded-lg p-1 transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={`${row.module.orderNumber}. ${row.module.title} — ${badge.label}`}
          >
            {node}
          </Link>
        ) : (
          <div className="flex flex-1 flex-col items-center gap-1.5 p-1" title="Завершите предыдущий модуль">
            {node}
          </div>
        )}
        {!isLast ? (
          <div
            className={cn(
              "h-0.5 min-w-[8px] flex-1 rounded-full",
              row.moduleCompleted ? "bg-success/40" : row.unlocked ? "bg-primary/25" : "bg-border",
            )}
            aria-hidden
          />
        ) : null}
      </div>
      <span className="mt-1 line-clamp-2 w-full text-center text-[9px] font-medium leading-tight text-muted-foreground sm:text-[10px]">
        {row.module.title}
      </span>
      {isFocus ? (
        <span className="mt-0.5 text-[9px] font-semibold uppercase tracking-wide text-primary">Сейчас</span>
      ) : (
        <span className="mt-0.5 text-[9px] text-muted-foreground/80">{badge.label}</span>
      )}
    </motion.div>
  );
}

export function CourseTrajectoryMap({
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
    <section
      className="rounded-2xl border border-border/80 bg-card/80 p-4 shadow-card sm:p-5"
      aria-labelledby="course-trajectory-heading"
    >
      <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 id="course-trajectory-heading" className="font-display text-base font-semibold text-foreground sm:text-lg">
            Карта курса
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
            Модули открываются по порядку. Нажмите на доступный блок, чтобы открыть обзор.
          </p>
        </div>
        <ul className="flex flex-wrap gap-3 text-[10px] uppercase tracking-wide text-muted-foreground sm:text-[11px]">
          <li className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-success" aria-hidden /> Завершён
          </li>
          <li className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-primary" aria-hidden /> В процессе
          </li>
          <li className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-muted-foreground/40" aria-hidden /> Закрыт
          </li>
        </ul>
      </div>
      <div className="ce-scroll-x-contained -mx-1 px-1 pb-1">
        <div className="flex min-w-min items-start">
          {modules.map((row, index) => (
            <TrajectoryNode
              key={row.module.id}
              row={row}
              isLast={index === modules.length - 1}
              index={index}
              isFocus={Boolean(focusModuleId && row.module.id === focusModuleId)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
