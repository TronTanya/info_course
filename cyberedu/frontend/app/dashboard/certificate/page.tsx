import type { Metadata } from "next";
import { CertificateEligibility } from "@/components/certificate/certificate-eligibility";
import { CertificatePanel } from "@/components/certificate/certificate-panel";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { LearnPageHeader } from "@/components/learn/learn-chrome";
import { LearnPageWrap } from "@/components/learn/learn-page-wrap";
import { CyberHero } from "@/components/cyber/cyber-hero";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getCertificateDashboardState } from "@/lib/certificate";
import { requireAuth } from "@/lib/permissions";
import { dashboardSectionBreadcrumbs } from "@/lib/student-nav";
import { Award, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Сертификат",
  description: "Официальный сертификат CyberEdu Academy с публичной проверкой подлинности.",
};

export default async function CertificatePage() {
  const session = await requireAuth();
  const state = await getCertificateDashboardState(session.user.id);

  return (
    <DashboardShell>
      <LearnPageWrap>
        <LearnPageHeader
          backHref="/dashboard"
          backLabel="← Кабинет"
          breadcrumbItems={dashboardSectionBreadcrumbs("Сертификат")}
          eyebrow="Официальный документ"
          title="Официальный сертификат"
          subtitle="Электронный документ с номером реестра, QR-кодом и публичной проверкой подлинности."
        />

        {!state ? (
          <EmptyState
            terminalLine="certificate --no-course"
            title="Программа курса не настроена"
            description="Когда курс будет доступен, здесь появятся требования и выдача сертификата."
            action={
              <Button asChild variant="primary">
                <Link href="/dashboard">В кабинет</Link>
              </Button>
            }
          />
        ) : (
          <div className="min-w-0 space-y-8 overflow-x-clip">
            <CyberHero className="border-primary/20" padding="compact">
              <div className="flex flex-wrap items-center gap-4">
                <span className="flex size-12 items-center justify-center rounded-xl border border-primary/25 bg-primary/10 text-primary">
                  <Award className="size-6" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-2.5 uppercase tracking-widest text-cyan">Trusted credential</p>
                  <p className="mt-1 font-display text-lg font-semibold text-foreground">{state.courseTitle}</p>
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                    <ShieldCheck className="size-4 text-success" aria-hidden />
                    Реестр выдачи · проверка без раскрытия лишних персональных данных
                  </p>
                </div>
              </div>
            </CyberHero>

            <CertificateEligibility state={state} />

            <section aria-labelledby="cert-document-heading" className="space-y-4">
              <div>
                <h2 id="cert-document-heading" className="font-display text-lg font-semibold text-foreground">
                  {state.certificate ? "Ваш сертификат" : "Превью сертификата"}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {state.certificate
                    ? "Скачайте PDF или передайте ссылку на публичную проверку."
                    : "После выполнения требований сгенерируйте официальный документ."}
                </p>
              </div>
              <CertificatePanel state={state} />
            </section>
          </div>
        )}
      </LearnPageWrap>
    </DashboardShell>
  );
}
