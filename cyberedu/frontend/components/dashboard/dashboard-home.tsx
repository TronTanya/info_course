"use client";

import { motion, useReducedMotion } from "framer-motion";
import { DashboardContinueHero } from "@/components/dashboard/dashboard-continue-hero";
import { DashboardCourseSnapshot } from "@/components/dashboard/dashboard-course-snapshot";
import { DashboardEmpty } from "@/components/dashboard/dashboard-empty";
import { DashboardNextStepCard } from "@/components/dashboard/dashboard-next-step-card";
import { DashboardQuickActions } from "@/components/dashboard/dashboard-quick-actions";
import { DashboardWeakTopics } from "@/components/dashboard/dashboard-weak-topics";
import {
  buildWeakTopicRecommendations,
  getNextLessonCard,
  getNextPracticeCard,
  welcomeStatusLabel,
} from "@/lib/dashboard-ui";
import { motionPresets, motionWithReducedMotion } from "@/lib/design-system/motion";
import type { AchievementRow } from "@/lib/achievements";
import type { ProfileCourseStats } from "@/lib/profile-course-stats";
import type { CourseProgressModuleRow } from "@/lib/progress";
import { StatusBadge } from "@/components/ui/status-badge";

export function DashboardHome({
  stats,
  displayName,
  achievements,
  modules,
}: {
  stats: ProfileCourseStats | null;
  displayName: string;
  achievements: AchievementRow[];
  modules: CourseProgressModuleRow[];
}) {
  const reduce = useReducedMotion();

  if (!stats) {
    return (
      <motion.div className="space-y-8" {...motionWithReducedMotion(motionPresets.fadeIn, reduce)}>
        <DashboardEmpty />
      </motion.div>
    );
  }

  const achievementsUnlocked = achievements.filter((a) => a.unlocked).length;
  const lessonCard = getNextLessonCard(modules);
  const practiceCard = getNextPracticeCard(modules);
  const weakTopics = buildWeakTopicRecommendations(stats, modules);

  return (
    <motion.div className="space-y-5 overflow-x-hidden pb-2 sm:space-y-8 sm:pb-4" {...motionWithReducedMotion(motionPresets.fadeIn, reduce)}>
      <header className="space-y-2">
        <p className="typo-eyebrow text-primary">Личный кабинет</p>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0">
            <h1 className="font-display text-2xl font-semibold text-balance text-foreground sm:text-3xl">
              Здравствуйте, {displayName}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground sm:text-base">{welcomeStatusLabel(stats)}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {stats.allModulesComplete ? (
              <StatusBadge status="completed" label="Курс завершён" />
            ) : (
              <StatusBadge status="in_progress" label={`${stats.progressPercent}% курса`} />
            )}
          </div>
        </div>
      </header>

      <DashboardContinueHero stats={stats} modules={modules} />

      <DashboardCourseSnapshot
        stats={stats}
        modules={modules}
        achievementsUnlocked={achievementsUnlocked}
        achievementsTotal={achievements.length}
      />

      {(lessonCard || practiceCard) && (
        <section aria-labelledby="dash-next-steps-heading" className="space-y-3">
          <h2 id="dash-next-steps-heading" className="font-display text-lg font-semibold text-foreground">
            Следующие шаги
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {lessonCard ? <DashboardNextStepCard card={lessonCard} /> : null}
            {practiceCard ? <DashboardNextStepCard card={practiceCard} /> : null}
          </div>
        </section>
      )}

      <DashboardWeakTopics items={weakTopics} />

      <DashboardQuickActions modules={modules} stats={stats} />
    </motion.div>
  );
}
