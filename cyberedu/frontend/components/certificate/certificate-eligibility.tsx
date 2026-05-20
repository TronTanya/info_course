import Link from "next/link";
import { CheckCircle2, Circle, ListChecks } from "lucide-react";
import type { CertificateDashboardState } from "@/lib/certificate";
import {
  buildCertificateRemainingItems,
  buildCertificateRequirements,
  type CertificateRequirementRow,
} from "@/lib/certificate-ui";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { SectionCard } from "@/components/ui/section-card";
import { cn } from "@/lib/utils";

export function CertificateEligibility({ state }: { state: CertificateDashboardState }) {
  const requirements = buildCertificateRequirements(
    state,
    state.stepMetrics,
    state.scoreSuccessPercent,
    state.maxPossiblePoints,
  );
  const remaining = buildCertificateRemainingItems(state, requirements);
  const allMet = requirements.every((r) => r.met);
  const progressTone = state.courseCompleted ? "success" : "default";

  return (
    <div className="space-y-5">
      <SectionCard variant="lab" flushTitle className="p-5 sm:p-6" aria-labelledby="cert-eligibility-heading">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="typo-eyebrow text-primary">Eligibility</p>
            <h2 id="cert-eligibility-heading" className="mt-1 font-display text-lg font-semibold text-foreground">
              Требования для получения
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Сертификат выдаётся после полного прохождения программы CyberEdu Academy.
            </p>
          </div>
          <Badge variant={state.certificate ? "success" : allMet ? "primary" : "secondary"}>
            {state.certificate ? "Выдан" : allMet ? "Готово к выдаче" : "В процессе"}
          </Badge>
        </div>

        <div className="mt-5 max-w-lg">
          <ProgressBar
            value={state.progressPercent}
            label="Прогресс по модулям"
            tone={progressTone}
          />
          <p className="typo-caption mt-2">
            {state.completedModules} из {state.totalModules} модулей · {state.scoreSuccessPercent}% баллов
            {state.maxPossiblePoints > 0 ? ` (${state.totalPoints}/${state.maxPossiblePoints})` : ""}
          </p>
        </div>

        <ul className="mt-6 space-y-2" aria-label="Чеклист требований">
          {requirements.map((req) => (
            <RequirementRow key={req.id} req={req} />
          ))}
        </ul>
      </SectionCard>

      {remaining.length > 0 && !state.certificate ? (
        <SectionCard variant="default" flushTitle className="p-5 sm:p-6" aria-labelledby="cert-remaining-heading">
          <h3 id="cert-remaining-heading" className="flex items-center gap-2 font-display text-base font-semibold text-foreground">
            <ListChecks className="size-4 text-warning" aria-hidden />
            Что осталось сделать
          </h3>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            {remaining.map((item) => (
              <li key={item} className="flex gap-2 text-pretty">
                <span className="text-warning" aria-hidden>
                  ·
                </span>
                {item}
              </li>
            ))}
          </ul>
        </SectionCard>
      ) : null}

      {!state.courseCompleted && state.incompleteModules.length > 0 ? (
        <SectionCard variant="muted" flushTitle className="p-5 sm:p-6" title="Незавершённые модули">
          <ul className="mt-3 space-y-2">
            {state.incompleteModules.map((m) => (
              <li key={m.id}>
                <Link
                  href={`/dashboard/course/${m.id}`}
                  className="flex items-center gap-2 rounded-xl border border-transparent px-2 py-2 text-sm text-foreground transition-colors hover:border-primary/20 hover:bg-primary/5"
                >
                  <Circle className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                  <span className="font-medium">{m.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </SectionCard>
      ) : null}
    </div>
  );
}

function RequirementRow({ req }: { req: CertificateRequirementRow }) {
  return (
    <li
      className={cn(
        "flex items-start gap-3 rounded-xl border px-3 py-2.5",
        req.met ? "border-success/25 bg-success/5" : "border-border/70 bg-muted/15",
      )}
    >
      {req.met ? (
        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
      ) : (
        <Circle className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
      )}
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{req.label}</p>
        <p className="text-xs text-muted-foreground">{req.detail}</p>
      </div>
    </li>
  );
}
