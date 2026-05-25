"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import type { CertificateDashboardState } from "@/lib/certificate";
import type { CertificateProgressViewModel } from "@/types/certificate-view-model";
import { CertificateErrorState } from "@/components/certificate/certificate-states";
import { CertificateIssueSuccess } from "@/components/certificate/certificate-issue-success";
import { CertificatePreviewCard } from "@/components/certificate/certificate-preview-card";
import { CertificateRequirementsMet } from "@/components/certificate/certificate-requirements-met";
import { useCertificateIssue } from "@/components/certificate/use-certificate-issue";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/ui/section-card";

export function CertificateFlowReady({
  progress,
  courseId,
  previewState,
}: {
  progress: CertificateProgressViewModel;
  courseId: string;
  previewState: CertificateDashboardState;
}) {
  const canIssue = progress.canIssue && previewState.canGenerate && !previewState.certificate;
  const { phase, loading, errorMessage, successPayload, issue, resetError } = useCertificateIssue({
    courseId,
    canIssue,
  });

  if (phase === "success" && successPayload) {
    return <CertificateIssueSuccess payload={successPayload} />;
  }

  return (
    <div className="space-y-6">
      <SectionCard variant="lab" flushTitle className="border-primary/25 p-5 sm:p-6">
        <div className="flex flex-wrap items-start gap-3">
          <span className="flex size-11 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 text-primary">
            <Sparkles className="size-5" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="typo-eyebrow text-primary">Готово к выдаче</p>
            <h2 className="mt-1 font-display text-xl font-semibold text-foreground">
              Все условия выполнены
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Ниже — превью документа. Официальная запись и PDF создаются на сервере после нажатия кнопки.
            </p>
          </div>
          <Badge variant="primary">Готово</Badge>
        </div>
      </SectionCard>

      <CertificateRequirementsMet state={previewState} />

      <div>
        <h3 className="font-display text-base font-semibold text-foreground">Превью сертификата</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          После выдачи появятся номер реестра, QR и ссылка на публичную проверку.
        </p>
        <div className="mt-4">
          <CertificatePreviewCard state={previewState} />
        </div>
      </div>

      {errorMessage ? <CertificateErrorState kind="issue" compact message={errorMessage} /> : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Button
          type="button"
          variant="primary"
          size="lg"
          disabled={loading || !canIssue}
          aria-busy={loading}
          onClick={() => {
            resetError();
            void issue();
          }}
        >
          {loading ? "Выдача на сервере…" : "Получить сертификат"}
        </Button>
        {progress.continueHref ? (
          <Button asChild variant="outline" size="lg" disabled={loading}>
            <Link href={progress.continueHref}>Продолжить курс</Link>
          </Button>
        ) : null}
      </div>
    </div>
  );
}
