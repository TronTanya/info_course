"use client";

import { motion, useReducedMotion } from "framer-motion";
import { DashboardAchievementsPreview } from "@/components/dashboard/dashboard-achievements-preview";
import { DashboardContinueHero } from "@/components/dashboard/dashboard-continue-hero";
import { DashboardEmpty } from "@/components/dashboard/dashboard-empty";
import { DashboardLastTestResult } from "@/components/dashboard/dashboard-last-test-result";
import { DashboardNextPractice } from "@/components/dashboard/dashboard-next-practice";
import { DashboardProgressOverview } from "@/components/dashboard/dashboard-progress-overview";
import { DashboardMentorHost } from "@/components/dashboard/dashboard-mentor-host";
import { DashboardWeakTopics } from "@/components/dashboard/dashboard-weak-topics";
import { MentorDockedPanel } from "@/components/ai/mentor-docked-panel";
import {
  CockpitActivityFeed,
  CockpitHeader,
  CockpitLayout,
  CockpitProgressChart,
  CockpitStatsStrip,
} from "@/components/dashboard/cockpit";
import {
  buildRecentActivities,
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
  const activities = buildRecentActivities(stats);

  return (
    <motion.div
      className="min-w-0 overflow-x-clip pb-2 sm:pb-4"
      {...motionWithReducedMotion(motionPresets.fadeIn, reduce)}
    >
      <CockpitLayout
        aiPanel={<MentorDockedPanel stats={stats} modules={modules} />}
      >
        <CockpitHeader displayName={displayName} stats={stats} modules={modules} />

        <div className="ce-cockpit-span-12">
          <DashboardContinueHero stats={stats} modules={modules} />
        </div>

        <CockpitStatsStrip stats={stats} modules={modules} delay={0.04} />

        <div className="ce-cockpit-span-12">
          <DashboardProgressOverview stats={stats} modules={modules} />
        </div>

        <div className="ce-cockpit-span-12 lg:ce-cockpit-span-8">
          <CockpitProgressChart modules={modules} delay={0.06} />
        </div>
        <div className="ce-cockpit-span-12 lg:ce-cockpit-span-4">
          <CockpitActivityFeed items={activities} delay={0.08} />
        </div>

        <div className="ce-cockpit-span-12 lg:ce-cockpit-span-6">
          <DashboardNextPractice card={practiceCard} />
        </div>
        <div className="ce-cockpit-span-12 lg:ce-cockpit-span-6">
          <DashboardLastTestResult result={lastTest} />
        </div>

        {weakTopics.length > 0 ? (
          <div className="ce-cockpit-span-12">
            <DashboardWeakTopics items={weakTopics} />
          </div>
        ) : null}

        {achievements.length > 0 ? (
          <div className="ce-cockpit-span-12">
            <DashboardAchievementsPreview rows={achievements} />
          </div>
        ) : null}
      </CockpitLayout>

      <div className="xl:hidden">
        <DashboardMentorHost stats={stats} modules={modules} />
      </div>
    </motion.div>
  );
}
