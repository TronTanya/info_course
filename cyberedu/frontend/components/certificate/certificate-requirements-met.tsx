import { CheckCircle2 } from "lucide-react";
import type { CertificateDashboardState } from "@/lib/certificate";
import { buildCertificateRequirementRows } from "@/lib/certificate-eligibility";
import { SectionCard } from "@/components/ui/section-card";

export function CertificateRequirementsMet({ state }: { state: CertificateDashboardState }) {
  const rows = buildCertificateRequirementRows({
    completedModules: state.completedModules,
    totalModules: state.totalModules,
    courseCompleted: state.courseCompleted,
    metrics: state.stepMetrics,
  });

  return (
    <SectionCard
      variant="lab"
      flushTitle
      className="border-success/25 p-5 sm:p-6"
      aria-labelledby="cert-requirements-met-heading"
    >
      <h3 id="cert-requirements-met-heading" className="font-display text-base font-semibold text-foreground">
        Условия выполнены
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Сервер подтвердит eligibility при нажатии «Получить сертификат» — без выдачи только в браузере.
      </p>
      <ul className="mt-4 space-y-2" aria-label="Выполненные условия">
        {rows.map((row) => (
          <li
            key={row.id}
            className="flex items-start gap-3 rounded-xl border border-success/25 bg-success/5 px-3 py-2.5"
          >
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">{row.label}</p>
              <p className="text-xs text-muted-foreground">{row.detail}</p>
            </div>
          </li>
        ))}
      </ul>
    </SectionCard>
  );
}
