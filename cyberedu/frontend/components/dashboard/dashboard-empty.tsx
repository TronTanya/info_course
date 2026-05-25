import { DashboardEmptyState } from "@/components/dashboard/dashboard-page-states";

/** Курс не настроен (stats = null). */
export function DashboardEmpty() {
  return <DashboardEmptyState kind="course_unavailable" />;
}
