import type { Certificate } from "@prisma/client";

export type CertificateRecordStatus = "active" | "revoked";

export function certificateRecordStatus(
  cert: Pick<Certificate, "revokedAt">,
): CertificateRecordStatus {
  return cert.revokedAt ? "revoked" : "active";
}

export function certificateSupportsRevoke(): boolean {
  return true;
}

/** Причина отзыва сохраняется в audit metadata (поля в Certificate нет). */
export const REVOKE_REASON_MAX_LENGTH = 500;

export function certificateSupportsRevokeReason(): boolean {
  return certificateSupportsRevoke();
}

export function normalizeRevokeReason(raw: FormDataEntryValue | null | undefined): string | undefined {
  const s = String(raw ?? "").trim();
  if (!s) return undefined;
  return s.length > REVOKE_REASON_MAX_LENGTH ? s.slice(0, REVOKE_REASON_MAX_LENGTH) : s;
}
