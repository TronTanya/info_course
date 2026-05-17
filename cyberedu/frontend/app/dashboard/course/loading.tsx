import { DashboardShell } from "@/components/layout/dashboard-shell";
import { CardGridSkeleton, PageHeaderSkeleton } from "@/components/ui/page-skeleton";

export default function CourseLoading() {
  return (
    <DashboardShell wide>
      <div className="space-y-8" aria-busy="true" aria-label="Загрузка курса">
        <PageHeaderSkeleton />
        <CardGridSkeleton count={4} />
      </div>
    </DashboardShell>
  );
}
