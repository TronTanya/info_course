"use client";

import { motion, useReducedMotion } from "framer-motion";
import { DashboardAchievementsPreview } from "@/components/dashboard/dashboard-achievements-preview";
import { DashboardAiRecommendation } from "@/components/dashboard/dashboard-ai-recommendation";
import { DashboardCertificateProgress } from "@/components/dashboard/dashboard-certificate-progress";
import { DashboardCockpitHeader } from "@/components/dashboard/dashboard-cockpit-header";
import { DashboardContinueHero } from "@/components/dashboard/dashboard-continue-hero";
import { DashboardCourseProgress } from "@/components/dashboard/dashboard-course-progress";
import { DashboardEmpty } from "@/components/dashboard/dashboard-empty";
import { DashboardLastTestResult } from "@/components/dashboard/dashboard-last-test-result";
import { DashboardNextPractice } from "@/components/dashboard/dashboard-next-practice";
import { DashboardQuickActions } from "@/components/dashboard/dashboard-quick-actions";
import { DashboardMentorHost } from "@/components/dashboard/dashboard-mentor-host";
import { DashboardWeakTopics } from "@/components/dashboard/dashboard-weak-topics";
import {
  buildAiRecommendation,
  buildWeakTopicRecommendations,
  getLastTestResultView,
  getNextPracticeCard,
} from "@/lib/dashboard-ui";
import { motionPresets, motionWithReducedMotion } from "@/lib/design-system/motion";
import type { AchievementRow } from "@/lib/achievements";
import type { ProfileCourseStats } from "@/lib/profile-course-stats";
import type { CourseProgressModuleRow } from "@/lib/progress";

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

  const practiceCard = getNextPracticeCard(modules);
  const lastTest = getLastTestResultView(stats, modules);
  const weakTopics = buildWeakTopicRecommendations(stats, modules);
  const aiRecommendation = buildAiRecommendation(stats, modules);

  return (
    <motion.div
      className="min-w-0 space-y-5 overflow-x-clip pb-2 sm:space-y-6 sm:pb-4"
      {...motionWithReducedMotion(motionPresets.fadeIn, reduce)}
    >
      <DashboardCockpitHeader displayName={displayName} stats={stats} modules={modules} />

      <DashboardContinueHero stats={stats} modules={modules} />

      <div className="grid min-w-0 grid-cols-1 gap-5 xl:grid-cols-2 xl:gap-5">
        <DashboardCourseProgress stats={stats} modules={modules} />
        <DashboardCertificateProgress stats={stats} modules={modules} />
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-5 xl:grid-cols-2 xl:gap-5">
        <DashboardNextPractice card={practiceCard} />
        <DashboardLastTestResult result={lastTest} />
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-5 xl:grid-cols-2 xl:gap-5">
        <DashboardWeakTopics items={weakTopics} />
        <DashboardAiRecommendation recommendation={aiRecommendation} />
      </div>

      {achievements.length > 0 ? <DashboardAchievementsPreview rows={achievements} /> : null}

      <DashboardQuickActions modules={modules} stats={stats} />

      <DashboardMentorHost stats={stats} modules={modules} />
    </motion.div>
  );
}
