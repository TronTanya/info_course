import type { AdminDashboardChartsData } from "@/lib/admin-dashboard-charts";
import type { AdminLmsDashboardData } from "@/lib/admin-lms-dashboard";
import type { AdminUserListRow } from "@/lib/admin-users-list";

export const emptyAdminLmsDashboard: AdminLmsDashboardData = {
  stats: {
    totalUsers: 0,
    activeStudents: 0,
    studentsCompletedCourse: 0,
    pendingWorkCount: 0,
    certificatesIssuedTotal: 0,
    publishedReviewsCount: 0,
  },
  overview: {
    totalStudents: 0,
    activeStudents: 0,
    averageProgressPercent: 0,
    averageTestPercent: null,
    practicesCompleted: 0,
    certificatesIssued: 0,
    pendingSubmissions: 0,
    studentsCompletedCourse: 0,
  },
  difficult: { questions: [], modules: [], practices: [] },
  submissionQueue: [],
  certificates: { issuedTotal: 0, eligibleWithoutCert: 0, recent: [] },
  auditEvents: [],
};

export const emptyAdminCharts: AdminDashboardChartsData = {
  submissions: [],
  progressBuckets: [],
};

export function emptyAdminUsers(): AdminUserListRow[] {
  return [];
}
