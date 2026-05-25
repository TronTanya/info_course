/** Данные только для визуального превью (без секретов и verificationCode). */
export type CertificatePreviewMode = "placeholder" | "issued";

export type CertificatePreviewStatus = "preview" | "valid" | "revoked";

export type CertificatePreviewModel = {
  mode: CertificatePreviewMode;
  status: CertificatePreviewStatus;
  studentName: string;
  courseTitle: string;
  courseHours?: number;
  issuedAtLabel: string;
  certificateIdLabel: string;
  verifyUrlDisplay: string | null;
  verifyHref: string | null;
  qrDataUrl: string | null;
};
