import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PageHeaderSkeleton } from "@/components/ui/page-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsLoading() {
  return (
    <DashboardShell>
      <div className="mx-auto max-w-2xl space-y-8" aria-busy="true" aria-label="Загрузка настроек">
        <PageHeaderSkeleton />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    </DashboardShell>
  );
}
