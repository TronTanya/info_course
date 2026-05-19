import { DashboardShell } from "@/components/layout/dashboard-shell";
import { ProfilePageSkeleton } from "@/components/ui/page-skeleton";

export default function ProfileLoading() {
  return (
    <DashboardShell>
      <ProfilePageSkeleton />
    </DashboardShell>
  );
}
