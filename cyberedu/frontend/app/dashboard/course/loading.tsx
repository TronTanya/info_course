import { CoursePathNav } from "@/components/course/course-path-nav";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Skeleton } from "@/components/ui/skeleton";

export default function CourseLoading() {
  return (
    <DashboardShell wide>
      <div className="space-y-8 overflow-x-hidden" aria-busy="true" aria-label="Загрузка курса">
        <CoursePathNav />
        <div className="ce-glass rounded-3xl p-6 sm:p-8 lg:grid lg:grid-cols-[1fr_auto] lg:gap-8">
          <div className="space-y-4">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-10 w-2/3 max-w-lg" />
            <Skeleton className="h-20 w-full max-w-xl rounded-2xl" />
            <Skeleton className="h-11 w-48 rounded-2xl" />
          </div>
          <Skeleton className="mx-auto h-48 w-full max-w-sm rounded-2xl lg:mx-0" />
        </div>
        <Skeleton className="h-24 rounded-2xl" />
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-2xl" />
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}
