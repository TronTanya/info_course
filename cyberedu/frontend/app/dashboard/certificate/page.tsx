import { CertificatePageFlow } from "@/components/certificate/certificate-page-flow";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { LearnPageHeader } from "@/components/learn/learn-chrome";
import { LearnPageWrap } from "@/components/learn/learn-page-wrap";
import { CyberHero } from "@/components/cyber/cyber-hero";
import { CertificateEmptyState } from "@/components/certificate/certificate-states";
import Link from "next/link";
import { getCertificateDashboardState } from "@/lib/certificate";
import { buildCertificatePrivatePageMetadata } from "@/lib/certificate-metadata";
import { requireStudentAccess } from "@/lib/permissions";
import { CertificateProgressOpenedTracker } from "@/components/analytics/learn-screen-trackers";
import { Award, ShieldCheck } from "lucide-react";

export const metadata = buildCertificatePrivatePageMetadata();

export default async function CertificatePage() {
  const session = await requireStudentAccess();
  const state = await getCertificateDashboardState(session.user.id);

  return (
    <DashboardShell>
      <LearnPageWrap>
        <LearnPageHeader
          backHref="/dashboard"
          backLabel="← Dashboard"
          breadcrumbItems={[
            { href: "/dashboard", label: "Dashboard" },
            { label: "Сертификат" },
          ]}
          eyebrow="CyberEdu Academy"
          title={state?.userFlow === "issued" ? "Ваш сертификат" : "Официальный сертификат"}
          subtitle={
            state?.userFlow === "issued"
              ? "Скачайте PDF, передайте ссылку на проверку или откройте публичную verify-страницу."
              : "Электронный документ с номером реестра, QR-кодом и публичной проверкой подлинности."
          }
        />

        {!state ? (
          <CertificateEmptyState kind="not_available" />
        ) : (
          <div className="min-w-0 space-y-8 overflow-x-clip">
            <CertificateProgressOpenedTracker source="certificate_page" />
            {state.userFlow !== "issued" ? (
              <CyberHero className="border-primary/20" padding="compact">
                <div className="flex flex-wrap items-center gap-4">
                  <span className="flex size-12 items-center justify-center rounded-xl border border-primary/25 bg-primary/10 text-primary">
                    <Award className="size-6" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-cyan">Trusted credential</p>
                    <p className="mt-1 font-display text-lg font-semibold text-foreground">{state.courseTitle}</p>
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                      <ShieldCheck className="size-4 text-success" aria-hidden />
                      Реестр выдачи · проверка без раскрытия лишних персональных данных
                    </p>
                  </div>
                </div>
              </CyberHero>
            ) : null}

            <CertificatePageFlow state={state} />

            <p className="text-sm text-muted-foreground">
              <Link href="/certificate/verify" className="font-medium text-primary underline-offset-4 hover:underline">
                Публичная проверка (Certificate Verify)
              </Link>
              {" "}
              — valid / not found / revoked без входа в аккаунт.
            </p>
          </div>
        )}
      </LearnPageWrap>
    </DashboardShell>
  );
}
