"use client";

import { DashboardCertificateCard } from "@/components/dashboard/dashboard-certificate-card";
import { buildCertificateProgressCardModel } from "@/lib/certificate-progress-card";
import type { ProfileCourseStats } from "@/lib/profile-course-stats";
import type { CourseProgressModuleRow } from "@/lib/progress";

/** @deprecated Используйте {@link DashboardCertificateCard} + {@link buildCertificateProgressCardModel}. */
export function DashboardCertificateProgress({
  stats,
  modules,
  compact = false,
}: {
  stats: ProfileCourseStats;
  modules: CourseProgressModuleRow[];
  compact?: boolean;
}) {
  const model = buildCertificateProgressCardModel(stats, modules);
  return <DashboardCertificateCard model={model} compact={compact} />;
}
