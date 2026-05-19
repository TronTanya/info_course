import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PageHeaderSkeleton } from "@/components/ui/page-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileLoading() {
  return (
    <DashboardShell>
      <div className="space-y-8" aria-busy="true" aria-label="Загрузка профиля">
        <PageHeaderSkeleton />
        <Skeleton className="h-40 w-full rounded-2xl" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
      </div>
    </DashboardShell>
  );
}
