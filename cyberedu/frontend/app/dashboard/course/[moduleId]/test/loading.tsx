import { LearnPageShell } from "@/components/learn/learn-chrome";
import { TestTakingSkeleton } from "@/components/test/test-taking-skeleton";
import { DashboardShell } from "@/components/layout/dashboard-shell";

export default function TestLoading() {
  return (
    <DashboardShell>
      <LearnPageShell>
        <TestTakingSkeleton />
      </LearnPageShell>
    </DashboardShell>
  );
}
