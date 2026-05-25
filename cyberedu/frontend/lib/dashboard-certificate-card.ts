import {
  buildCertificateProgressCardModel,
  CERTIFICATE_PAGE_HREF,
  COURSE_MAP_HREF,
  DASHBOARD_CERTIFICATE_STATUS_LABELS,
  resolveDashboardCertificateStatus,
  type CertificateProgressCardCta,
  type CertificateProgressCardModel,
} from "@/lib/certificate-progress-card";
import type { DashboardCertificateRequirement } from "@/lib/dashboard-ui";
import type { ProfileCourseStats } from "@/lib/profile-course-stats";
import type { CourseProgressModuleRow } from "@/lib/progress";

export {
  CERTIFICATE_PAGE_HREF,
  COURSE_MAP_HREF,
  DASHBOARD_CERTIFICATE_STATUS_LABELS,
  buildCertificateProgressCardModel,
  resolveDashboardCertificateStatus,
};

export type DashboardCertificateCardCta = CertificateProgressCardCta;

/** @deprecated Используйте {@link CertificateProgressCardModel}. */
export type DashboardCertificateCardModel = CertificateProgressCardModel & {
  statusLabel: string;
  requirements: DashboardCertificateRequirement[];
  remainingRequirementLabels: string[];
  verifyCta?: DashboardCertificateCardCta;
};

/**
 * Модель карточки сертификата для дашборда (обёртка над {@link buildCertificateProgressCardModel}).
 */
export function buildDashboardCertificateCard(
  stats: ProfileCourseStats,
  modules: CourseProgressModuleRow[],
): DashboardCertificateCardModel {
  const card = buildCertificateProgressCardModel(stats, modules);
  const verifyCta =
    card.status === "issued" && card.secondaryCta?.external ? card.secondaryCta : undefined;

  return {
    ...card,
    statusLabel: DASHBOARD_CERTIFICATE_STATUS_LABELS[card.status],
    requirements: [...card.completedRequirements, ...card.remainingRequirements].map((r) => ({
      label: r.label,
      met: r.met,
    })),
    remainingRequirementLabels: card.remainingRequirements.map((r) => r.label),
    verifyCta,
  };
}
