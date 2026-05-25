import type { CertificateDashboardState } from "@/lib/certificate";
import { formatRuDateLongUtc } from "@/lib/datetime-stable";
import type { CertificateViewModel } from "@/types/certificate-view-model";
import type { CertificatePreviewModel } from "@/types/certificate-preview";

export const CERTIFICATE_PREVIEW_PLACEHOLDERS = {
  studentName: "Ваше имя",
  certificateId: "ID будет создан после выдачи",
  issuedAt: "После выдачи",
  verifyUrl: "Ссылка появится после выдачи",
} as const;

function verifyUrlDisplay(url: string | null | undefined): string | null {
  if (!url?.trim()) return null;
  try {
    const u = new URL(url);
    return `${u.host}${u.pathname}`;
  } catch {
    return url.replace(/^https?:\/\//, "").slice(0, 48);
  }
}

export function mapCertificatePreviewFromDashboardState(
  state: CertificateDashboardState,
): CertificatePreviewModel {
  const cert = state.certificate;
  if (!cert) {
    return {
      mode: "placeholder",
      status: "preview",
      studentName: state.studentDisplayName || CERTIFICATE_PREVIEW_PLACEHOLDERS.studentName,
      courseTitle: state.courseTitle,
      courseHours: state.courseHours,
      issuedAtLabel: CERTIFICATE_PREVIEW_PLACEHOLDERS.issuedAt,
      certificateIdLabel: CERTIFICATE_PREVIEW_PLACEHOLDERS.certificateId,
      verifyUrlDisplay: CERTIFICATE_PREVIEW_PLACEHOLDERS.verifyUrl,
      verifyHref: null,
      qrDataUrl: null,
    };
  }

  const revoked = cert.registryStatus === "revoked";
  return {
    mode: "issued",
    status: revoked ? "revoked" : "valid",
    studentName: state.studentDisplayName,
    courseTitle: state.courseTitle,
    courseHours: state.courseHours,
    issuedAtLabel: formatRuDateLongUtc(cert.issuedAt),
    certificateIdLabel: cert.certificateNumber,
    verifyUrlDisplay: verifyUrlDisplay(cert.verifyUrl),
    verifyHref: cert.verifyUrl,
    qrDataUrl: cert.qrDataUrl || null,
  };
}

export function mapCertificatePreviewFromViewModel(view: CertificateViewModel): CertificatePreviewModel {
  const revoked = view.status === "revoked";
  return {
    mode: "issued",
    status: revoked ? "revoked" : view.status === "valid" ? "valid" : "preview",
    studentName: view.studentDisplayName,
    courseTitle: view.courseTitle,
    issuedAtLabel: formatRuDateLongUtc(view.issuedAt),
    certificateIdLabel: view.certificateNumber,
    verifyUrlDisplay: verifyUrlDisplay(view.verifyUrl),
    verifyHref: view.verifyUrl,
    qrDataUrl: view.qrCodeDataUrl ?? null,
  };
}
