"use client";

import { useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { DashboardAchievementsPreview } from "@/components/dashboard/dashboard-achievements-preview";
import { DashboardCertificateProgress } from "@/components/dashboard/dashboard-certificate-progress";
import { DashboardContinueLearningCard } from "@/components/dashboard/dashboard-continue-learning-card";
import { OverallProgressPanel } from "@/components/dashboard/overall-progress-panel";
import { buildDashboardProgressFromStats } from "@/lib/overall-progress-panel";
import { DashboardEmpty } from "@/components/dashboard/dashboard-empty";
import { DashboardNotStartedBanner } from "@/components/dashboard/dashboard-page-states";
import {
  hasDashboardLearningProgress,
  shouldShowDashboardNotStarted,
} from "@/lib/dashboard-page-state-ui";
import { DashboardPendingPractices } from "@/components/dashboard/dashboard-pending-practices";
import { RecentActivityFeed } from "@/components/dashboard/recent-activity-feed";
import { buildRecentActivityFeedItems } from "@/lib/recent-activity-feed";
import { RoadmapPreview } from "@/components/dashboard/roadmap-preview";
import { buildRoadmapPreviewItems } from "@/lib/roadmap-preview";
import { DashboardWelcomeHeader } from "@/components/dashboard/dashboard-welcome-header";
import {
  DashboardMentorSection,
  DashboardMentorWidgetSlot,
} from "@/components/dashboard/dashboard-mentor-section";
import { StudentNavModuleSync } from "@/components/layout/student-nav-module-sync";
import { WeakTopicsPanel } from "@/components/course/weak-topics-panel";
import { getPendingPracticeReviews } from "@/lib/dashboard-ui";
import { buildWeakTopicPanelItems } from "@/lib/weak-topics-panel";
import { motionPresets, motionWithReducedMotion } from "@/lib/design-system/motion";
import type { AchievementRow } from "@/lib/achievements";
import type { ProfileCourseStats } from "@/lib/profile-course-stats";
import type { CourseProgressModuleRow } from "@/lib/progress";

export function DashboardHome({
  stats,
  displayName,
  achievements,
  modules,
  aiMentorConfigured = true,
}: {
  stats: ProfileCourseStats | null;
  displayName: string;
  achievements: AchievementRow[];
  modules: CourseProgressModuleRow[];
  aiMentorConfigured?: boolean;
}) {
  const reduce = useReducedMotion();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, []);

  if (!stats) {
    return (
      <motion.div className="space-y-8" {...motionWithReducedMotion(motionPresets.fadeIn, reduce)}>
        <DashboardEmpty />
      </motion.div>
    );
  }

  const pendingPractices = getPendingPracticeReviews(stats, modules);
  const recentActivity = buildRecentActivityFeedItems(stats, modules);
  const weakTopics = buildWeakTopicPanelItems(stats, modules);
  const learningStarted = hasDashboardLearningProgress(stats);
  const notStarted = shouldShowDashboardNotStarted(stats, modules);
  const courseComplete = stats.progressPercent >= 100 || stats.allModulesComplete;
  const showContinueCard = !(stats.allModulesComplete && stats.certificateIssued);

  return (
    <DashboardMentorSection stats={stats} modules={modules} aiConfigured={aiMentorConfigured}>
      <StudentNavModuleSync stats={stats} modules={modules} />
      <motion.div
        className="ce-dashboard-cockpit min-w-0 overflow-x-clip pb-2"
        {...motionWithReducedMotion(motionPresets.fadeIn, reduce)}
      >
        <div className="ce-dashboard-cockpit__layout flex flex-col gap-3 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(16.5rem,20rem)] lg:items-start lg:gap-4">
          <div className="flex min-w-0 flex-col gap-3">
            <DashboardWelcomeHeader displayName={displayName} stats={stats} modules={modules} />

            {notStarted ? <DashboardNotStartedBanner /> : null}

            {showContinueCard ? (
              <DashboardContinueLearningCard stats={stats} modules={modules} />
            ) : null}

            <OverallProgressPanel
              progress={buildDashboardProgressFromStats(stats, modules)}
              modulesUntilCertificate={stats.modulesUntilCertificate}
              learningStarted={learningStarted}
              compact={courseComplete}
            />

            <RoadmapPreview
              compact={courseComplete}
              items={buildRoadmapPreviewItems(modules, stats.currentModuleId)}
            />

            {pendingPractices.length > 0 ? (
              <DashboardPendingPractices items={pendingPractices} />
            ) : null}

            {weakTopics.length > 0 ? (
              <WeakTopicsPanel items={weakTopics} className="p-4 sm:p-5" />
            ) : null}

            {!courseComplete ? (
              <DashboardAchievementsPreview rows={achievements} stats={stats} modules={modules} />
            ) : null}
          </div>

          <aside
            aria-label="Сертификат, AI-наставник и недавняя активность"
            className="flex min-w-0 flex-col gap-3 lg:sticky lg:top-[calc(var(--header-height,4.5rem)+0.75rem)] lg:max-h-[calc(100dvh-var(--header-height,4.5rem)-1.5rem)] lg:overflow-y-auto lg:overscroll-contain"
          >
            <DashboardCertificateProgress stats={stats} modules={modules} compact={courseComplete} />
            <DashboardMentorWidgetSlot
              stats={stats}
              modules={modules}
              aiConfigured={aiMentorConfigured}
              compact={courseComplete}
            />
            {recentActivity.length > 0 ? <RecentActivityFeed items={recentActivity} compact /> : null}
          </aside>
        </div>
      </motion.div>
    </DashboardMentorSection>
  );
}
