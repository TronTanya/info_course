"use client";

import { AchievementUnlockToasts, type AchievementUnlockNotice } from "@/components/achievements/achievement-unlock-toasts";
import { StudentOnboarding } from "@/components/onboarding/student-onboarding";

export function DashboardClientExtras({ achievementUnlocks = [] }: { achievementUnlocks?: AchievementUnlockNotice[] }) {
  return (
    <>
      <StudentOnboarding />
      <AchievementUnlockToasts unlocks={achievementUnlocks} />
    </>
  );
}
