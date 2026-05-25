/** Запись в реестре считается действующей, пока нет поля отзыва в схеме. */
export type CertificateRegistryStatus = "active" | "revoked";

export type CertificatesAdminPanelItem = {
  id: string;
  certificateNumber: string;
  studentLabel: string;
  studentHref: string | null;
  courseTitle: string;
  issuedAt: string;
  verifyHref: string;
  status: CertificateRegistryStatus;
  hasPdf: boolean;
};

export type CertificatesAdminEligibleCandidate = {
  userId: string;
  studentLabel: string;
  courseId: string;
};

export type CertificatesAdminPanelData = {
  issuedTotal: number;
  eligibleCount: number;
  /** Серверная выдача через admin action (не UI-only). */
  issueSupported: boolean;
  /** Отзыв в БД/API не реализован. */
  supportsRevoke: boolean;
  registryHref: string;
  /** Куда вести «Проверить сертификат» (первая запись или реестр). */
  verifyCtaHref: string;
  recent: CertificatesAdminPanelItem[];
  eligibleCandidates: CertificatesAdminEligibleCandidate[];
};

export const CERTIFICATES_ADMIN_REGISTRY_PATH = "/admin/certificates";

export function certificateRegistryStatus(hasRecord: boolean, revoked?: boolean): CertificateRegistryStatus {
  if (!hasRecord) return "active";
  return revoked ? "revoked" : "active";
}

export function studentAdminHref(userId: string): string {
  return `/admin/users/${userId}`;
}
