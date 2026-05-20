import type { Metadata } from "next";
import { headers } from "next/headers";
import { CertificateVerifyView, type CertificateVerifyResult } from "@/components/certificate/certificate-verify-view";
import { prisma } from "@/lib/db";
import { SECURITY_ACTIONS } from "@/lib/security/audit-actions";
import { logSecurityEvent } from "@/lib/security/audit";
import { enforceRateLimit, RATE_LIMIT_POLICIES } from "@/lib/security/rate-limit";
import { clientIpFromHeaders } from "@/lib/security/request-ip";

type Props = { params: Promise<{ verificationCode: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { verificationCode } = await params;
  return {
    title: `Проверка сертификата ${verificationCode.slice(0, 8)}…`,
    robots: { index: false, follow: false },
  };
}

function formatRuDate(iso: Date) {
  return new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long", year: "numeric" }).format(iso);
}

export default async function VerifyCertificatePage({ params }: Props) {
  const raw = (await params).verificationCode;
  const verificationCode = decodeURIComponent(raw);

  const h = await headers();
  const clientIp = clientIpFromHeaders(h);
  const certPolicy = RATE_LIMIT_POLICIES.certVerify;
  const certRl = await enforceRateLimit({
    scope: certPolicy.scope,
    clientIp,
    max: certPolicy.max,
    windowMs: certPolicy.windowMs,
  });

  if (!certRl.allowed) {
    logSecurityEvent({
      action: SECURITY_ACTIONS.CERTIFICATE_VERIFY_ABUSE,
      severity: "warn",
      ip: clientIp,
      path: "/certificate/verify",
      metadata: { reason: "rate_limited" },
    });
    const result: CertificateVerifyResult = { status: "rate_limited" };
    return <CertificateVerifyView result={result} />;
  }

  const cert = await prisma.certificate.findUnique({
    where: { verificationCode },
    include: {
      course: { select: { title: true, hours: true } },
    },
  });

  if (!cert) {
    logSecurityEvent({
      action: SECURITY_ACTIONS.CERTIFICATE_VERIFY_FAILED,
      severity: "info",
      ip: clientIp,
      path: "/certificate/verify",
      metadata: { reason: "not_found", codePrefix: verificationCode.slice(0, 8) },
    });
    const result: CertificateVerifyResult = { status: "invalid" };
    return <CertificateVerifyView result={result} />;
  }

  const result: CertificateVerifyResult = {
    status: "valid",
    courseTitle: cert.course.title,
    courseHours: cert.course.hours,
    certificateNumber: cert.certificateNumber,
    issuedAtLabel: formatRuDate(cert.issuedAt),
  };

  return <CertificateVerifyView result={result} />;
}
