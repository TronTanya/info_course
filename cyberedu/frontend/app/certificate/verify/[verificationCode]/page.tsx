import Link from "next/link";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { Alert } from "@/components/ui/alert";
import { SectionCard } from "@/components/ui/section-card";
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
    return (
      <div className="ce-app-auth-main flex min-h-screen items-center justify-center px-4 py-16">
          <div className="mx-auto max-w-lg">
          <SectionCard variant="lab" title="Проверка сертификата" description="Слишком много запросов. Попробуйте позже.">
            <Link href="/" className="text-sm font-medium text-primary underline-offset-4 hover:underline">
              На главную
            </Link>
          </SectionCard>
        </div>
      </div>
    );
  }

  const cert = await prisma.certificate.findUnique({
    where: { verificationCode },
    include: {
      course: { select: { title: true, hours: true } },
      user: {
        select: {
          profile: {
            select: { lastName: true, firstName: true, middleName: true },
          },
        },
      },
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
    return (
      <div className="ce-app-auth-main flex min-h-screen items-center justify-center px-4 py-16">
        <div className="mx-auto max-w-lg">
          <SectionCard variant="lab" title="Проверка сертификата" description="Запись с таким кодом не найдена.">
            <Link href="/" className="text-sm font-medium text-primary underline-offset-4 hover:underline">
              На главную
            </Link>
          </SectionCard>
        </div>
      </div>
    );
  }

  const fio = cert.user.profile
    ? [cert.user.profile.lastName, cert.user.profile.firstName, cert.user.profile.middleName].filter(Boolean).join(" ")
    : "Участник";

  return (
    <div className="ce-app-auth-main flex min-h-screen items-center justify-center px-4 py-16">
      <div className="mx-auto max-w-lg">
        <SectionCard
          variant="lab"
          title="Проверка сертификата"
          description="Запись найдена в реестре выданных сертификатов."
          className="space-y-3 text-sm"
        >
            <Alert variant="success" title="Статус: действителен">
              Сертификат найден в реестре платформы CyberEdu.
            </Alert>
            <p>
              <span className="text-muted-foreground">ФИО: </span>
              <span className="font-medium text-foreground">{fio}</span>
            </p>
            <p>
              <span className="text-muted-foreground">Курс: </span>
              <span className="font-medium text-foreground">{cert.course.title}</span>
            </p>
            <p>
              <span className="text-muted-foreground">Объём: </span>
              {cert.course.hours} ч.
            </p>
            <p>
              <span className="text-muted-foreground">Номер сертификата: </span>
              <span className="font-mono text-xs text-foreground">{cert.certificateNumber}</span>
            </p>
            <p>
              <span className="text-muted-foreground">Дата выдачи: </span>
              {formatRuDate(cert.issuedAt)}
            </p>
            <p className="pt-2 text-xs text-muted-foreground">
              Код проверки: <span className="font-mono">{cert.verificationCode}</span>
            </p>
            <Link href="/" className="inline-block pt-4 text-sm font-medium text-primary underline-offset-4 hover:underline">
              На главную
            </Link>
        </SectionCard>
      </div>
    </div>
  );
}
