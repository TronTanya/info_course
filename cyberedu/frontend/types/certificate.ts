/** @deprecated Используйте типы из `@/types/certificate-view-model`. */
export type CertificateRecord = {
  id: string;
  userId: string;
  courseId: string;
  issuedAt: Date;
  downloadUrl?: string;
};

export type {
  AdminCertificateItem,
  AdminCertificateStatus,
  CertificateDocumentStatus,
  CertificateProgressStatus,
  CertificateProgressViewModel,
  CertificateRequirement,
  CertificateVerifyPresentationModel,
  CertificateVerifyRateLimitedView,
  CertificateVerifyStatus,
  CertificateVerifyViewModel,
  CertificateViewModel,
  CertificateViewModelForbiddenKey,
} from "@/types/certificate-view-model";

export { CERTIFICATE_VIEW_MODEL_FORBIDDEN_KEYS } from "@/types/certificate-view-model";
