"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { CyberHero } from "@/components/cyber/cyber-hero";
import type { ProfileCourseStats } from "@/lib/profile-course-stats";
import { getContinueTarget, welcomeStatusLabel } from "@/lib/dashboard-ui";
import type { CourseProgressModuleRow } from "@/lib/progress";
import { Button } from "@/components/ui/button";
import { ProgressRing } from "@/components/ui/progress-ring";
import { StatusBadge } from "@/components/ui/status-badge";
import { motionPresets } from "@/lib/design-system/motion";

export function DashboardWelcome({
  displayName,
  stats,
  modules,
}: {
  displayName: string;
  stats: ProfileCourseStats;
  modules: CourseProgressModuleRow[];
}) {
  const reduce = useReducedMotion();
  const continueTarget = getContinueTarget(stats, modules);
  const tone = stats.progressPercent >= 100 ? "success" : "default";

  return (
    <CyberHero className="ce-dashboard-hero" padding="default">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <motion.div className="space-y-4" {...motionPresets.slideUp}>
          <div className="flex flex-wrap items-center gap-2">
            <span className="ce-hud-chip">security lab</span>
            <span className="font-mono text-2.75 text-muted-foreground">learner session</span>
          </div>
          <p className="typo-eyebrow text-primary">Личный кабинет</p>
          <h1 className="typo-h1 text-balance">Здравствуйте, {displayName}</h1>
          <p className="typo-body-muted max-w-prose">{welcomeStatusLabel(stats)}</p>
          <motion.div className="flex flex-wrap items-center gap-2" {...motionPresets.slideUp}>
            {stats.allModulesComplete ? (
              <StatusBadge status="completed" label="Курс завершён" />
            ) : (
              <StatusBadge status="in_progress" label="Активное обучение" />
            )}
            <StatusBadge
              status="pending"
              label={`${stats.completedModules} / ${stats.totalModules} модулей`}
            />
          </motion.div>
          <div className="pt-1">
            <Button asChild size="lg" className="w-full shadow-card sm:w-auto sm:min-w-55">
              <Link href={continueTarget.href}>
                {continueTarget.label}
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Button>
          </div>
        </motion.div>
        <motion.div
          className="flex justify-center lg:justify-end"
          initial={reduce ? false : { opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
        >
          <ProgressRing value={stats.progressPercent} size={132} strokeWidth={9} tone={tone} label="Прогресс курса" />
        </motion.div>
      </div>
    </CyberHero>
  );
}
