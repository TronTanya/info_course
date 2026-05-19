import { DashboardShell } from "@/components/layout/dashboard-shell";
import { CardGridSkeleton, PageHeaderSkeleton } from "@/components/ui/page-skeleton";

export default function ModuleHubLoading() {
  return (
    <DashboardShell>
      <div className="space-y-8" aria-busy="true" aria-label="Загрузка модуля">
        <PageHeaderSkeleton />
        <CardGridSkeleton count={3} />
      </div>
    </DashboardShell>
  );
}
