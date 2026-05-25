import type { CertificateDashboardState } from "@/lib/certificate";
import type { CertificateVerifyPayload } from "@/lib/certificate-verify";
import type { CertificateRequirementRow } from "@/lib/certificate-eligibility";
import {
  buildCertificateRequirementRows,
  resolveCertificateLifecyclePhase,
} from "@/lib/certificate-eligibility";
import type { AdminCertificateEligibleRow } from "@/lib/admin-certificate-eligible";
import type { AdminCertificateRow } from "@/lib/admin-certificates-list";
import { certificateSupportsExpiry } from "@/lib/certificate-verify-policy";
import {
  CERTIFICATE_VIEW_MODEL_FORBIDDEN_KEYS,
  type AdminCertificateItem,
  type AdminCertificateStatus,
  type CertificateDocumentStatus,
  type CertificateProgressStatus,
  type CertificateProgressViewModel,
  type CertificateRequirement,
  type CertificateVerifyPresentationModel,
  type CertificateVerifyViewModel,
  type CertificateViewModel,
} from "@/types/certificate-view-model";

export const CERTIFICATE_PAGE_HREF = "/dashboard/certificate";
export const COURSE_MAP_HREF = "/dashboard/course";

export const VERIFY_PUBLIC_MESSAGES: Record<CertificateVerifyViewModel["status"], string> = {
  valid: "Запись найдена в официальном реестре CyberEdu Academy.",
  not_found: "Проверьте ID или ссылку.",
  revoked: "Документ недействителен для подтверждения прохождения программы.",
  expired: "Срок действия сертификата истёк.",
};

function lifecycleToProgressStatus(
  phase: ReturnType<typeof resolveCertificateLifecyclePhase>,
): CertificateProgressStatus {
  if (phase === "issued") return "issued";
  if (phase === "ready_to_issue") return "ready";
  if (phase === "in_progress") return "in_progress";
  return "not_available";
}

function requirementHref(
  rowId: CertificateRequirementRow["id"],
  courseId: string,
  incompleteModuleId?: string,
): string | undefined {
  if (rowId === "modules" && incompleteModuleId) {
    return `/dashboard/course/${incompleteModuleId}`;
  }
  return COURSE_MAP_HREF;
}

export function mapRequirementRowToCertificateRequirement(
  row: CertificateRequirementRow,
  courseId: string,
  firstIncompleteModuleId?: string,
): CertificateRequirement {
  return {
    id: row.id,
    title: row.label,
    description: row.detail,
    completed: row.met,
    href: requirementHref(row.id, courseId, firstIncompleteModuleId),
  };
}

export function mapDashboardStateToCertificateProgressViewModel(
  state: CertificateDashboardState,
): CertificateProgressViewModel {
  const rows = buildCertificateRequirementRows({
    completedModules: state.completedModules,
    totalModules: state.totalModules,
    courseCompleted: state.courseCompleted,
    metrics: state.stepMetrics,
  });
  const firstIncomplete = state.incompleteModules[0]?.id;
  const all = rows.map((r) => mapRequirementRowToCertificateRequirement(r, state.courseId, firstIncomplete));
  const completedRequirements = all.filter((r) => r.completed);
  const remainingRequirements = all.filter((r) => !r.completed);
  const status = lifecycleToProgressStatus(state.lifecyclePhase);

  return {
    status,
    percentage: state.progressPercent,
    completedRequirements,
    remainingRequirements,
    canIssue: state.canGenerate && !state.certificate,
    continueHref: COURSE_MAP_HREF,
    issueHref: status === "ready" ? CERTIFICATE_PAGE_HREF : undefined,
  };
}

function mapRegistryToDocumentStatus(registryStatus: "active" | "revoked"): CertificateDocumentStatus {
  if (registryStatus === "revoked") return "revoked";
  if (certificateSupportsExpiry()) return "expired";
  return "valid";
}

export function mapDashboardStateToCertificateViewModel(
  state: CertificateDashboardState,
): CertificateViewModel | null {
  const cert = state.certificate;
  if (!cert) return null;

  const revoked = cert.registryStatus === "revoked";
  const canDownloadPdf = !revoked && state.pdfInfrastructureReady;

  const pdfDownloadNotice =
    !revoked && !state.pdfInfrastructureReady
      ? "PDF-скачивание будет доступно после настройки генерации."
      : undefined;

  return {
    id: cert.id,
    certificateNumber: cert.certificateNumber,
    studentDisplayName: state.studentDisplayName,
    courseTitle: state.courseTitle,
    issuedAt: cert.issuedAt,
    status: mapRegistryToDocumentStatus(cert.registryStatus),
    verifyUrl: cert.verifyUrl,
    pdfDownloadUrl: canDownloadPdf ? `/api/certificates/download/${cert.id}` : undefined,
    pdfDownloadNotice,
    qrCodeDataUrl: cert.qrDataUrl || undefined,
    revokedAt: cert.revokedAt ?? undefined,
  };
}

export function mapVerifyPayloadToPresentationModel(
  payload: CertificateVerifyPayload,
): CertificateVerifyPresentationModel {
  if (payload.status === "rate_limited") {
    return {
      status: "rate_limited",
      verificationMessage: "Слишком много запросов. Повторите проверку позже.",
    };
  }

  const status = payload.status;
  const view: CertificateVerifyViewModel = {
    status,
    verificationMessage: VERIFY_PUBLIC_MESSAGES[status],
  };

  if (status === "not_found" || status === "expired") {
    return view;
  }

  if (status === "revoked") {
    view.certificateNumber = payload.certificateNumber;
    view.revokedAt = payload.revokedAtLabel;
    return view;
  }

  view.certificateNumber = payload.certificateNumber;
  view.courseTitle = payload.courseTitle;
  view.issuedAt = payload.issuedAtLabel;
  view.studentDisplayName = payload.holderName;

  return view;
}

export function mapAdminCertificateRowToItem(row: AdminCertificateRow): AdminCertificateItem {
  const status: AdminCertificateStatus = row.status === "revoked" ? "revoked" : "issued";
  return {
    id: row.id,
    certificateNumber: row.certificateNumber,
    studentDisplayName: row.fullName,
    courseTitle: row.courseTitle,
    issuedAt: row.issuedAt.toISOString(),
    status,
    verifyHref: row.verifyHref,
    adminHref: `/admin/users/${row.userId}`,
  };
}

export function mapEligibleRowToAdminCertificateItem(row: AdminCertificateEligibleRow): AdminCertificateItem {
  return {
    id: `eligible-${row.userId}`,
    certificateNumber: "—",
    studentDisplayName: row.studentLabel,
    courseTitle: row.courseTitle,
    status: "ready",
    adminHref: row.studentHref,
    issueUserId: row.userId,
    issueCourseId: row.courseId,
  };
}

/** Проверка, что объект не содержит запрещённых ключей (для тестов). */
export function assertNoForbiddenCertificateViewKeys(
  value: unknown,
  path = "",
): void {
  if (value === null || typeof value !== "object") return;
  if (Array.isArray(value)) {
    for (const item of value) assertNoForbiddenCertificateViewKeys(item, path);
    return;
  }
  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    const full = path ? `${path}.${key}` : key;
    if ((CERTIFICATE_VIEW_MODEL_FORBIDDEN_KEYS as readonly string[]).includes(key)) {
      throw new Error(`Forbidden key in certificate view model: ${full}`);
    }
    assertNoForbiddenCertificateViewKeys(child, full);
  }
}
