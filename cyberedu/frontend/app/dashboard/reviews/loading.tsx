import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PageHeaderSkeleton } from "@/components/ui/page-skeleton";

export default function ReviewsLoading() {
  return (
    <DashboardShell>
      <div className="space-y-8" aria-busy="true" aria-label="Загрузка отзыва">
        <PageHeaderSkeleton />
        <div className="h-48 animate-pulse rounded-2xl border border-border/60 bg-muted/30" />
      </div>
    </DashboardShell>
  );
}
