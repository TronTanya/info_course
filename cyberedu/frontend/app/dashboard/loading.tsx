import { DashboardLoadingState } from "@/components/dashboard/dashboard-page-states";
import { DashboardShell } from "@/components/layout/dashboard-shell";

export default function DashboardLoading() {
  return (
    <DashboardShell>
      <DashboardLoadingState />
    </DashboardShell>
  );
}
