/**
 * UI view models для сертификатов (только данные для отображения).
 *
 * Запрещено включать: signing secret, private key, raw hash salt, env,
 * internal token (verificationCode), private storage paths, полный profile,
 * password/session, скрытые детали оценивания.
 */

export type CertificateProgressStatus = "not_available" | "in_progress" | "ready" | "issued";

export type CertificateRequirement = {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  href?: string;
};

export type CertificateProgressViewModel = {
  status: CertificateProgressStatus;
  percentage: number;
  completedRequirements: CertificateRequirement[];
  remainingRequirements: CertificateRequirement[];
  canIssue: boolean;
  continueHref?: string;
  issueHref?: string;
};

export type CertificateDocumentStatus = "valid" | "revoked" | "expired";

export type CertificateViewModel = {
  id: string;
  certificateNumber: string;
  studentDisplayName: string;
  courseTitle: string;
  issuedAt: string;
  status: CertificateDocumentStatus;
  verifyUrl: string;
  pdfDownloadUrl?: string;
  /** Текст, если PDF пока недоступен (не revoked). */
  pdfDownloadNotice?: string;
  qrCodeDataUrl?: string;
  revokedAt?: string;
};

export type CertificateVerifyStatus = "valid" | "not_found" | "revoked" | "expired";

export type CertificateVerifyViewModel = {
  status: CertificateVerifyStatus;
  certificateNumber?: string;
  studentDisplayName?: string;
  courseTitle?: string;
  issuedAt?: string;
  revokedAt?: string;
  verificationMessage: string;
};

/** Rate limit — отдельно от основной verify-модели (нет в публичном реестре). */
export type CertificateVerifyRateLimitedView = {
  status: "rate_limited";
  verificationMessage: string;
};

export type CertificateVerifyPresentationModel =
  | CertificateVerifyViewModel
  | CertificateVerifyRateLimitedView;

export type AdminCertificateStatus = "ready" | "issued" | "revoked" | "expired";

export type AdminCertificateItem = {
  id: string;
  certificateNumber: string;
  studentDisplayName: string;
  courseTitle: string;
  issuedAt?: string;
  status: AdminCertificateStatus;
  verifyHref?: string;
  adminHref: string;
  /** Только для status=ready — server action выдачи */
  issueUserId?: string;
  issueCourseId?: string;
};

/** Ключи, которых не должно быть в сериализованных UI-моделях. */
export const CERTIFICATE_VIEW_MODEL_FORBIDDEN_KEYS = [
  "verificationCode",
  "signingSecret",
  "privateKey",
  "hashSalt",
  "pdfUrl",
  "password",
  "session",
  "email",
  "userEmail",
  "DATABASE_URL",
  "AUTH_SECRET",
  "OPENAI_API_KEY",
  "UPLOADS_DIR",
  "storagePath",
  "profile",
] as const;

export type CertificateViewModelForbiddenKey = (typeof CERTIFICATE_VIEW_MODEL_FORBIDDEN_KEYS)[number];
