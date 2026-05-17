import { DashboardHomeSkeleton } from "@/components/dashboard/dashboard-home-skeleton";
import { DashboardShell } from "@/components/layout/dashboard-shell";

export default function DashboardLoading() {
  return (
    <DashboardShell>
      <DashboardHomeSkeleton />
    </DashboardShell>
  );
}
