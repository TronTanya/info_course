import type { Metadata } from "next";
import Link from "next/link";
import { CertificatePanel } from "@/components/certificate/certificate-panel";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PageHeader } from "@/components/ui/page-header";
import { ProgressBar } from "@/components/ui/progress-bar";
import { SectionCard } from "@/components/ui/section-card";
import { getCertificateDashboardState } from "@/lib/certificate";
import { requireAuth } from "@/lib/permissions";

export const metadata: Metadata = {
  title: "Сертификат",
};

export default async function CertificatePage() {
  const session = await requireAuth();
  const state = await getCertificateDashboardState(session.user.id);

  return (
    <DashboardShell>
      <>
        <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-linear-to-br from-primary/[0.06] via-card to-cyan/[0.06] p-6 shadow-card ring-1 ring-secondary/10 sm:p-8">
          <div
            className="pointer-events-none absolute inset-0 opacity-30 [background:radial-gradient(600px_200px_at_80%_-20%,color-mix(in_oklab,var(--cyan)_18%,transparent),transparent)]"
            aria-hidden
          />
          <div className="relative">
            <PageHeader
              className="border-0 pb-0"
              eyebrow="Реестр"
              title="Сертификат"
              description="Электронный сертификат с QR-кодом и кодом проверки выдаётся после полного прохождения курса."
            />
          </div>
        </div>

        {!state ? (
          <SectionCard variant="muted" className="text-pretty typo-body-muted">
            Курс пока не настроен в системе.
          </SectionCard>
        ) : (
          <div className="space-y-6">
            <SectionCard
              title={state.courseTitle}
              description={`Объём программы: ${state.courseHours} ч.`}
              className="overflow-hidden"
            >
              <div className="mb-4 flex flex-wrap items-center gap-2">
                {state.courseCompleted ? (
                  <span className="w-fit rounded-full border border-success/30 bg-success/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-success">
                    Курс завершён
                  </span>
                ) : (
                  <span className="w-fit rounded-full border border-cyan/30 bg-cyan/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-cyan">
                    В процессе
                  </span>
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
              <SectionCard title="Осталось пройти">
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
      </>
    </DashboardShell>
  );
}
