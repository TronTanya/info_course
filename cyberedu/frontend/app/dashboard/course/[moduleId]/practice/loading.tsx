import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PracticeLabSkeleton } from "@/components/practice/practice-lab-skeleton";

export default function PracticeLoading() {
  return (
    <DashboardShell wide>
      <div className="lab-shell ce-learn-lab overflow-hidden rounded-2xl border" aria-busy="true">
        <PracticeLabSkeleton />
      </div>
    </DashboardShell>
  );
}
