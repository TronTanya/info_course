import { DashboardShell } from "@/components/layout/dashboard-shell";
import { CardGridSkeleton, PageHeaderSkeleton } from "@/components/ui/page-skeleton";

export default function DashboardLoading() {
  return (
    <DashboardShell>
      <div className="space-y-8" aria-busy="true" aria-label="Загрузка кабинета">
        <PageHeaderSkeleton />
        <CardGridSkeleton count={5} />
      </div>
    </DashboardShell>
  );
}
