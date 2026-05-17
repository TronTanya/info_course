import Link from "next/link";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
          <Card className="border-border/80">
            <CardHeader>
              <CardTitle className="text-xl">Проверка сертификата</CardTitle>
              <p className="text-sm text-muted-foreground">Слишком много запросов. Попробуйте позже.</p>
            </CardHeader>
            <CardContent>
              <Link href="/" className="text-sm font-medium text-primary underline-offset-4 hover:underline">
                На главную
              </Link>
            </CardContent>
          </Card>
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
          <Card className="border-border/80">
            <CardHeader>
              <CardTitle className="text-xl">Проверка сертификата</CardTitle>
              <p className="text-sm text-muted-foreground">Запись с таким кодом не найдена.</p>
            </CardHeader>
            <CardContent>
              <Link href="/" className="text-sm font-medium text-primary underline-offset-4 hover:underline">
                На главную
              </Link>
            </CardContent>
          </Card>
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
        <Card className="border-border/80">
          <CardHeader>
            <CardTitle className="text-xl">Проверка сертификата</CardTitle>
            <p className="text-sm text-muted-foreground">Запись найдена в реестре выданных сертификатов.</p>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-emerald-800 dark:text-emerald-200">
              Статус: действителен
            </div>
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
