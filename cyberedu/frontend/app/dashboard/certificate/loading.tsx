import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PageHeaderSkeleton } from "@/components/ui/page-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function CertificateLoading() {
  return (
    <DashboardShell>
      <div className="space-y-8" aria-busy="true" aria-label="Загрузка сертификата">
        <PageHeaderSkeleton />
        <Skeleton className="h-56 w-full rounded-2xl" />
        <Skeleton className="h-32 w-full max-w-md rounded-2xl" />
      </div>
    </DashboardShell>
  );
}
