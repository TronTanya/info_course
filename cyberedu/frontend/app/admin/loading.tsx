import { AdminShell } from "@/components/layout/admin-shell";
import { CardGridSkeleton, PageHeaderSkeleton } from "@/components/ui/page-skeleton";

export default function AdminLoading() {
  return (
    <AdminShell>
      <div className="space-y-8" aria-busy="true" aria-label="Загрузка админки">
        <PageHeaderSkeleton />
        <CardGridSkeleton count={6} />
      </div>
    </AdminShell>
  );
}
