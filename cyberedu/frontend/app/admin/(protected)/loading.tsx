import { AdminDashboardSkeleton } from "@/components/admin/admin-states";
import { AdminShell } from "@/components/layout/admin-shell";

export default function AdminLoading() {
  return (
    <AdminShell>
      <AdminDashboardSkeleton />
    </AdminShell>
  );
}
