import { DashboardShell } from "@/components/layout/dashboard-shell";
import { LessonPageSkeleton } from "@/components/lesson/lesson-page-skeleton";

export default function LessonLoading() {
  return (
    <DashboardShell wide>
      <LessonPageSkeleton />
    </DashboardShell>
  );
}
