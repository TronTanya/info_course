import { CoursePageShell } from "@/components/course/course-page-shell";
import { CoursePageSkeleton } from "@/components/course/course-page-skeleton";
import { DashboardShell } from "@/components/layout/dashboard-shell";

export default function CourseLoading() {
  return (
    <DashboardShell wide>
      <CoursePageShell>
        <CoursePageSkeleton />
      </CoursePageShell>
    </DashboardShell>
  );
}
