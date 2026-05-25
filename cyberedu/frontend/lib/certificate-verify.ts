import type { Certificate } from "@prisma/client";
import {
  certificateVerifyUrl,
  normalizeLegacyVerificationCode,
  normalizePublicCertificateNumber,
} from "@/lib/certificate-verify-url";
import { certificateRecordStatus } from "@/lib/certificate-registry";
import { certificateSupportsExpiry, certificateVerifyShowsHolderName } from "@/lib/certificate-verify-policy";
import { prisma } from "@/lib/db";

export type CertificateVerifyStatus =
  | "valid"
  | "not_found"
  | "revoked"
  | "expired"
  | "rate_limited";

export type CertificateVerifyPayload = {
  status: CertificateVerifyStatus;
  courseTitle?: string;
  courseHours?: number;
  certificateNumber?: string;
  certificateId?: string;
  issuedAtLabel?: string;
  revokedAtLabel?: string;
  holderName?: string;
};

function formatRuDate(iso: Date): string {
  return new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long", year: "numeric" }).format(iso);
}

function holderNameFromProfile(p: {
  lastName: string | null;
  firstName: string | null;
  middleName: string | null;
} | null): string | undefined {
  if (!p) return undefined;
  const s = [p.lastName, p.firstName, p.middleName].filter(Boolean).join(" ").trim();
  return s || undefined;
}

async function loadCertificateForVerify(
  where: { certificateNumber: string } | { verificationCode: string },
): Promise<
  | (Certificate & {
      course: { title: string; hours: number };
      user: {
        profile: {
          lastName: string | null;
          firstName: string | null;
          middleName: string | null;
        } | null;
      };
    })
  | null
> {
  return prisma.certificate.findUnique({
    where,
    include: {
      course: { select: { title: true, hours: true } },
      user: { select: { profile: { select: { lastName: true, firstName: true, middleName: true } } } },
    },
  });
}

function payloadFromCertificate(
  cert: NonNullable<Awaited<ReturnType<typeof loadCertificateForVerify>>>,
): CertificateVerifyPayload {
  if (certificateRecordStatus(cert) === "revoked") {
    return {
      status: "revoked",
      courseTitle: cert.course.title,
      certificateNumber: cert.certificateNumber,
      certificateId: cert.id,
      issuedAtLabel: formatRuDate(cert.issuedAt),
      revokedAtLabel: cert.revokedAt ? formatRuDate(cert.revokedAt) : formatRuDate(cert.issuedAt),
      holderName: certificateVerifyShowsHolderName()
        ? holderNameFromProfile(cert.user.profile)
        : undefined,
    };
  }

  if (certificateSupportsExpiry()) {
    return { status: "expired" };
  }

  return {
    status: "valid",
    courseTitle: cert.course.title,
    courseHours: cert.course.hours,
    certificateNumber: cert.certificateNumber,
    certificateId: cert.id,
    issuedAtLabel: formatRuDate(cert.issuedAt),
    holderName: certificateVerifyShowsHolderName()
      ? holderNameFromProfile(cert.user.profile)
      : undefined,
  };
}

/**
 * Публичная проверка: сначала номер реестра (CE-…), иначе legacy verificationCode из старых QR.
 */
export async function resolveCertificateVerifyPayload(identifier: string): Promise<CertificateVerifyPayload> {
  const certNumber = normalizePublicCertificateNumber(identifier);
  if (certNumber) {
    const cert = await loadCertificateForVerify({ certificateNumber: certNumber });
    if (!cert) return { status: "not_found" };
    return payloadFromCertificate(cert);
  }

  const legacyCode = normalizeLegacyVerificationCode(identifier);
  if (legacyCode) {
    const cert = await loadCertificateForVerify({ verificationCode: legacyCode });
    if (!cert) return { status: "not_found" };
    return payloadFromCertificate(cert);
  }

  return { status: "not_found" };
}

/** @deprecated Используйте resolveCertificateVerifyPayload с номером CE-… */
export async function resolveCertificateVerifyPayloadByCode(
  verificationCode: string,
): Promise<CertificateVerifyPayload> {
  const cert = await loadCertificateForVerify({ verificationCode });

  if (!cert) {
    return { status: "not_found" };
  }

  return payloadFromCertificate(cert);
}

/** Публичный путь verify по номеру реестра. */
export function publicVerifyPathForNumber(certificateNumber: string): string {
  return certificateVerifyUrl(certificateNumber);
}
