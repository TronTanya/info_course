"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Radar, Shield } from "lucide-react";
import type { ProfileCourseStats } from "@/lib/profile-course-stats";
import { getCoursePositionLabel } from "@/lib/dashboard-ui";
import type { CourseProgressModuleRow } from "@/lib/progress";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { MobileSnapRow } from "@/components/mobile";
import { cn } from "@/lib/utils";

export function CockpitHeader({
  displayName,
  stats,
  modules,
}: {
  displayName: string;
  stats: ProfileCourseStats;
  modules: CourseProgressModuleRow[];
}) {
  const reduce = useReducedMotion();
  const position = getCoursePositionLabel(stats, modules);

  return (
    <motion.header
      className="ce-cockpit-span-12 flex flex-col gap-4 sm:gap-6 lg:flex-row lg:items-end lg:justify-between"
      initial={reduce ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="flex min-w-0 gap-4">
        <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-primary/8 text-primary">
          <Radar className="size-7" strokeWidth={1.5} aria-hidden />
        </span>
        <div className="min-w-0 space-y-2">
          <p className="ce-cockpit-eyebrow">Обзор обучения</p>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-balance text-foreground sm:text-3xl lg:text-4xl">
            Привет, {displayName.split(" ")[0] ?? displayName}
          </h1>
          <p className="text-lg text-muted-foreground">{stats.courseTitle}</p>
          <p className="max-w-xl text-sm text-pretty text-muted-foreground">{position}</p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-2 rounded-full border border-success/25 bg-success/8 px-3 py-1.5 text-xs font-medium text-success">
          <Shield className="size-3.5" aria-hidden />
          Активная сессия
        </span>
        {stats.allModulesComplete ? (
          <StatusBadge status="completed" label="Курс завершён" />
        ) : (
          <StatusBadge status="in_progress" label={`${stats.progressPercent}% программы`} />
        )}
        <Button asChild size="sm" variant="outline" className="rounded-full border-white/10 bg-white/3">
          <Link href="/dashboard/course">Карта курса</Link>
        </Button>
      </div>
    </motion.header>
  );
}

export function CockpitStatsStrip({
  stats,
  modules,
  delay = 0,
}: {
  stats: ProfileCourseStats;
  modules: CourseProgressModuleRow[];
  delay?: number;
}) {
  const reduce = useReducedMotion();
  const steps = modules.reduce(
    (acc, row) => {
      const { requirements: req, progress: p } = row;
      if (req.lessonRequired) {
        acc.lessonsTotal++;
        if (p?.lessonCompleted) acc.lessonsDone++;
      }
      if (req.testRequired) {
        acc.testsTotal++;
        if (p?.testCompleted) acc.testsDone++;
      }
      if (req.practiceRequired) {
        acc.practiceTotal++;
        if (p?.practiceCompleted) acc.practiceDone++;
      }
      return acc;
    },
    { lessonsDone: 0, lessonsTotal: 0, testsDone: 0, testsTotal: 0, practiceDone: 0, practiceTotal: 0 },
  );

  const items = [
    { label: "Прогресс", value: `${stats.progressPercent}%`, accent: true },
    { label: "Модули", value: `${stats.completedModules}/${stats.totalModules}` },
    { label: "Уроки", value: steps.lessonsTotal ? `${steps.lessonsDone}/${steps.lessonsTotal}` : "—" },
    { label: "Тесты", value: steps.testsTotal ? `${steps.testsDone}/${steps.testsTotal}` : "—" },
  ];

  const statCard = (item: (typeof items)[number]) => (
    <div
      className={cn(
        "ce-cockpit-panel h-full min-h-22 rounded-2xl p-4",
        item.accent && "border-primary/15 bg-primary/4",
      )}
    >
      <p className="ce-cockpit-eyebrow">{item.label}</p>
      <p className="ce-cockpit-stat-value mt-2">
        {item.value}
      </p>
    </div>
  );

  return (
    <motion.div
      className="ce-cockpit-span-12"
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.16, 1, 0.3, 1] }}
      aria-label="Ключевые метрики"
    >
      <MobileSnapRow className="mb-0">
        {items.map((item) => (
          <div key={item.label} role="listitem">
            {statCard(item)}
          </div>
        ))}
      </MobileSnapRow>
      <ul className="mt-3 hidden list-none grid-cols-2 gap-3 p-0 lg:mt-0 lg:grid lg:grid-cols-4">
        {items.map((item) => (
          <li key={item.label}>{statCard(item)}</li>
        ))}
      </ul>
    </motion.div>
  );
}
