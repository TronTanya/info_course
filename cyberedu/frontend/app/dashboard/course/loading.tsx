import { CoursePathNav } from "@/components/course/course-path-nav";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Skeleton } from "@/components/ui/skeleton";

export default function CourseLoading() {
  return (
    <DashboardShell wide>
      <div className="space-y-8 overflow-x-hidden" aria-busy="true" aria-label="Загрузка курса">
        <CoursePathNav />
        <Skeleton className="h-72 rounded-3xl" />
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <div className="responsive-card-grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-80 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
