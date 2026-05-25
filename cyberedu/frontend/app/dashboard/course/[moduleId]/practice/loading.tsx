import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PracticePageLoadingState } from "@/components/practice/practice-page-states";

export default function PracticeLoading() {
  return (
    <DashboardShell wide>
      <PracticePageLoadingState />
    </DashboardShell>
  );
}
