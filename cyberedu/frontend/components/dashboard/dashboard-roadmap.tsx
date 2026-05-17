"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Lock } from "lucide-react";
import type { CourseProgressModuleRow } from "@/lib/progress";
import { getUiStatus } from "@/lib/dashboard-ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { SectionHeader } from "@/components/ui/section-header";
import { getModuleAction, statusBadge } from "@/lib/course-path-ui";
import { cn } from "@/lib/utils";

export function DashboardRoadmap({
  modules,
  currentModuleId,
}: {
  modules: CourseProgressModuleRow[];
  currentModuleId: string | null;
}) {
  const reduce = useReducedMotion();

  return (
    <section className="space-y-5" aria-labelledby="dash-roadmap-heading">
      <SectionHeader
        title="Карта курса"
        description="Модули по порядку: завершённые, текущий и заблокированные."
        actions={
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/course">Полная карта</Link>
          </Button>
        }
      />
      <h2 id="dash-roadmap-heading" className="sr-only">
        Карта курса
      </h2>
      <ol className="grid list-none gap-3 p-0 sm:grid-cols-2">
        {modules.map((row, index) => {
          const status = getUiStatus(row);
          const badge = statusBadge[status];
          const action = getModuleAction(row);
          const isCurrent = row.module.id === currentModuleId;
          const clickable = row.unlocked && !action.disabled;

          const inner = (
            <>
              <motion.div
                className={cn(
                  "flex size-10 shrink-0 items-center justify-center rounded-xl border-2 text-sm font-bold tabular-nums",
                  status === "completed" && "border-success/40 bg-success/12 text-success",
                  status === "in_progress" && "border-primary/45 bg-primary/12 text-primary",
                  status === "available" && "border-primary/30 bg-primary/8 text-primary",
                  status === "locked" && "border-border bg-muted/40 text-muted-foreground",
                  isCurrent && "ring-2 ring-primary/35 ring-offset-2 ring-offset-background",
                )}
                animate={
                  isCurrent && !reduce
                    ? { boxShadow: ["0 0 0 0 transparent", "0 0 20px -4px color-mix(in oklab, var(--primary) 45%, transparent)", "0 0 0 0 transparent"] }
                    : undefined
                }
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              >
                {status === "locked" ? <Lock className="size-4" aria-hidden /> : row.module.orderNumber}
              </motion.div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium text-foreground">{row.module.title}</p>
                  <Badge variant={badge.variant} className={badge.className}>
                    {badge.label}
                  </Badge>
                  {isCurrent ? (
                    <span className="rounded-md bg-primary/12 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                      Сейчас
                    </span>
                  ) : null}
                </div>
                {row.unlocked && row.requirements.totalSteps > 0 ? (
                  <ProgressBar className="mt-2" value={row.progressPercent} max={100} label={`Шаги: ${row.progressPercent}%`} />
                ) : null}
              </div>
            </>
          );

          return (
            <motion.li
              key={row.module.id}
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04, duration: 0.3 }}
              className={cn(
                "ce-glass ce-card-glow rounded-2xl p-4 transition-[transform,box-shadow] duration-200",
                clickable && "hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-hover)] motion-reduce:hover:translate-y-0",
                !clickable && "opacity-95",
              )}
            >
              {clickable ? (
                <Link href={action.href} className="flex gap-3 outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl">
                  {inner}
                </Link>
              ) : (
                <div className="flex gap-3">{inner}</div>
              )}
            </motion.li>
          );
        })}
      </ol>
    </section>
  );
}
