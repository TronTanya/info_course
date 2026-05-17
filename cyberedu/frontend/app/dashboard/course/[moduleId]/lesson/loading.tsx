import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PageHeaderSkeleton } from "@/components/ui/page-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function LessonLoading() {
  return (
    <DashboardShell wide>
      <div className="space-y-6" aria-busy="true" aria-label="Загрузка лекции">
        <PageHeaderSkeleton />
        <div className="lesson-layout grid gap-8 lg:grid-cols-[1fr_320px]">
          <Skeleton className="h-96 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </div>
    </DashboardShell>
  );
}
