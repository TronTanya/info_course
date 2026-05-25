import Link from "next/link";
import { Download, FileCheck, ListChecks, Share2, ShieldCheck } from "lucide-react";
import type { CertificateDashboardState } from "@/lib/certificate";
import { CERTIFICATE_ELIGIBILITY_RULE } from "@/lib/certificate-eligibility";
import { SectionCard } from "@/components/ui/section-card";
import { cn } from "@/lib/utils";

type StepState = "done" | "current" | "upcoming";

const STEPS = [
  {
    icon: ListChecks,
    title: "Условия программы",
    body: CERTIFICATE_ELIGIBILITY_RULE,
  },
  {
    icon: FileCheck,
    title: "Прогресс и остаток",
    body: "В блоке «Требования» видно, сколько модулей, лекций, тестов и практик осталось до финиша.",
  },
  {
    icon: ShieldCheck,
    title: "Получение документа",
    body: "После завершения всех модулей нажмите «Получить сертификат» — запись и PDF создаются на сервере.",
  },
  {
    icon: Download,
    title: "Скачивание PDF",
    body: "Официальный файл с номером реестра и QR доступен только владельцу (или администратору) через защищённую ссылку.",
  },
  {
    icon: Share2,
    title: "Проверка и обмен",
    body: "Передайте публичную ссылку проверки — на странице verify отображаются только данные реестра, без лишних персональных сведений.",
  },
] as const;

function currentStepIndex(phase: CertificateDashboardState["lifecyclePhase"]): number {
  if (phase === "issued") return STEPS.length;
  if (phase === "ready_to_issue") return 2;
  if (phase === "in_progress") return 1;
  return 0;
}

function stepStateForIndex(
  index: number,
  phase: CertificateDashboardState["lifecyclePhase"],
): StepState {
  if (phase === "issued") return "done";
  const current = currentStepIndex(phase);
  if (index < current) return "done";
  if (index === current) return "current";
  return "upcoming";
}

export function CertificateJourneyGuide({ state }: { state: CertificateDashboardState }) {
  return (
    <SectionCard variant="muted" flushTitle className="p-5 sm:p-6" aria-labelledby="cert-journey-heading">
      <h2 id="cert-journey-heading" className="font-display text-lg font-semibold text-foreground">
        Как работает сертификат
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Пять шагов от старта курса до публичной проверки подлинности.
      </p>
      <ol className="mt-5 space-y-3">
        {STEPS.map((step, index) => {
          const Icon = step.icon;
          const status = stepStateForIndex(index, state.lifecyclePhase);
          return (
            <li
              key={step.title}
              className={cn(
                "flex gap-3 rounded-xl border px-3 py-3",
                status === "done" && "border-success/25 bg-success/5",
                status === "current" && "border-primary/30 bg-primary/5",
                status === "upcoming" && "border-border/70 bg-muted/10",
              )}
            >
              <span
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-lg border",
                  status === "done" && "border-success/30 text-success",
                  status === "current" && "border-primary/30 text-primary",
                  status === "upcoming" && "border-border/60 text-muted-foreground",
                )}
                aria-hidden
              >
                <Icon className="size-4" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">{step.title}</p>
                <p className="mt-0.5 text-xs text-pretty text-muted-foreground">{step.body}</p>
              </div>
            </li>
          );
        })}
      </ol>
      {state.certificate?.verifyUrl ? (
        <p className="mt-4 text-xs text-muted-foreground">
          Публичная проверка:{" "}
          <Link
            href={state.certificate.verifyUrl}
            className="font-medium text-primary underline-offset-4 hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            открыть страницу verify
          </Link>
        </p>
      ) : null}
    </SectionCard>
  );
}
