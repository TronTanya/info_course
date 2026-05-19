import type { Metadata } from "next";
import Link from "next/link";
import { CertificatePanel } from "@/components/certificate/certificate-panel";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { LearnPageHeader } from "@/components/learn/learn-chrome";
import { LearnPageWrap } from "@/components/learn/learn-page-wrap";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { SectionCard } from "@/components/ui/section-card";
import { getCertificateDashboardState } from "@/lib/certificate";
import { requireAuth } from "@/lib/permissions";
import { dashboardSectionBreadcrumbs } from "@/lib/student-nav";

export const metadata: Metadata = {
  title: "Сертификат",
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
          eyebrow="Реестр"
          title="Сертификат"
          subtitle="Электронный сертификат с QR-кодом и кодом проверки выдаётся после полного прохождения курса."
        />

        {!state ? (
          <SectionCard variant="lab" className="text-pretty typo-body-muted">
            Курс пока не настроен в системе.
          </SectionCard>
        ) : (
          <div className="space-y-6">
            <SectionCard
              variant="lab"
              title={state.courseTitle}
              description={`Объём программы: ${state.courseHours} ч.`}
              className="overflow-hidden"
            >
              <div className="mb-4 flex flex-wrap items-center gap-2">
                {state.courseCompleted ? (
                  <Badge variant="success">Курс завершён</Badge>
                ) : (
                  <Badge variant="primary">В процессе</Badge>
                )}
              </div>
              <div className="max-w-md">
                <ProgressBar
                  value={state.progressPercent}
                  label="Прогресс по модулям"
                  tone={state.courseCompleted ? "success" : "default"}
                />
                <p className="typo-caption mt-2">
                  Завершено модулей: {state.completedModules} из {state.totalModules}
                </p>
              </div>
            </SectionCard>

            {!state.courseCompleted && state.incompleteModules.length > 0 ? (
              <SectionCard variant="lab" title="Осталось пройти">
                <ul className="space-y-2">
                  {state.incompleteModules.map((m) => (
                    <li key={m.id}>
                      <Link
                        href={`/dashboard/course/${m.id}`}
                        className="group flex items-center gap-2 rounded-xl border border-transparent px-2 py-2 text-sm text-muted-foreground transition-colors hover:border-primary/15 hover:bg-primary/[0.04] hover:text-foreground"
                      >
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-secondary/15 text-secondary ring-1 ring-secondary/20">
                          <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
                            <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                        <span className="font-medium text-foreground group-hover:underline group-hover:underline-offset-4">
                          {m.title}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </SectionCard>
            ) : null}

            <SectionCard
              variant="accent"
              title="Ваш сертификат"
              description="Генерация и скачивание PDF доступны после завершения курса."
            >
              <CertificatePanel
                courseId={state.courseId}
                courseCompleted={state.courseCompleted}
                certificate={state.certificate}
              />
            </SectionCard>
          </div>
        )}
      </LearnPageWrap>
    </DashboardShell>
  );
}
