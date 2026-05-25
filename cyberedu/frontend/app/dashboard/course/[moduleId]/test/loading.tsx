import { LearnPageShell } from "@/components/learn/learn-chrome";
import { TestPageSkeleton } from "@/components/test/test-page-skeleton";
import { DashboardShell } from "@/components/layout/dashboard-shell";

export default function TestLoading() {
  return (
    <DashboardShell>
      <LearnPageShell>
        <TestPageSkeleton />
      </LearnPageShell>
    </DashboardShell>
  );
}
