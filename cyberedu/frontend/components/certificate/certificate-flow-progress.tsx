import Link from "next/link";
import { ListChecks } from "lucide-react";
import { CERTIFICATE_ELIGIBILITY_RULE } from "@/lib/certificate-eligibility";
import type { CertificateProgressViewModel } from "@/types/certificate-view-model";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { SectionCard } from "@/components/ui/section-card";
import { cn } from "@/lib/utils";

const STATUS_LABELS: Record<CertificateProgressViewModel["status"], string> = {
  not_available: "Пока недоступен",
  in_progress: "В процессе",
  ready: "Готов к получению",
  issued: "Выдан",
};

export function CertificateFlowProgress({ progress }: { progress: CertificateProgressViewModel }) {
  return (
    <div className="space-y-5">
      <SectionCard variant="lab" flushTitle className="p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="typo-eyebrow text-primary">Certificate Progress</p>
            <h2 className="mt-1 font-display text-lg font-semibold text-foreground">Прогресс к сертификату</h2>
            <p className="mt-1 text-sm text-pretty text-muted-foreground">{CERTIFICATE_ELIGIBILITY_RULE}</p>
          </div>
          <Badge variant="secondary">{STATUS_LABELS[progress.status]}</Badge>
        </div>

        <div className="mt-5 max-w-lg">
          <ProgressBar value={progress.percentage} label="До сертификата (модули)" />
          <p className="typo-caption mt-2">
            {progress.completedRequirements.length} из{" "}
            {progress.completedRequirements.length + progress.remainingRequirements.length} условий выполнено
          </p>
        </div>
      </SectionCard>

      <div className="grid gap-5 lg:grid-cols-2">
        <RequirementList title="Выполнено" items={progress.completedRequirements} empty="Пока нет закрытых условий." />
        <RequirementList
          title="Осталось"
          items={progress.remainingRequirements}
          empty="Все условия закрыты."
          icon
        />
      </div>

      {progress.continueHref ? (
        <Button asChild variant="primary" size="lg" className="w-full sm:w-auto">
          <Link href={progress.continueHref}>Продолжить курс</Link>
        </Button>
      ) : null}
    </div>
  );
}

function RequirementList({
  title,
  items,
  empty,
  icon,
}: {
  title: string;
  items: CertificateProgressViewModel["completedRequirements"];
  empty: string;
  icon?: boolean;
}) {
  return (
    <SectionCard variant="default" flushTitle className="p-5 sm:p-6" title={title}>
      <ul className="mt-3 space-y-2">
        {items.length > 0 ? (
          items.map((req) => (
            <li
              key={req.id}
              className={cn(
                "rounded-xl border px-3 py-2 text-sm",
                req.completed ? "border-success/25 bg-success/5" : "border-border/70",
              )}
            >
              {req.href ? (
                <Link href={req.href} className="font-medium text-foreground hover:text-primary">
                  {req.title}
                </Link>
              ) : (
                <span className="font-medium text-foreground">{req.title}</span>
              )}
              {req.description ? <p className="text-xs text-muted-foreground">{req.description}</p> : null}
            </li>
          ))
        ) : (
          <li className="flex gap-2 text-sm text-muted-foreground">
            {icon ? <ListChecks className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden /> : null}
            {empty}
          </li>
        )}
      </ul>
    </SectionCard>
  );
}
