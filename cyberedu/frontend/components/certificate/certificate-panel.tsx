"use client";

import type { CertificateDashboardState } from "@/lib/certificate";
import { CertificateActions } from "@/components/certificate/certificate-actions";
import { CertificateFlowReady } from "@/components/certificate/certificate-flow-ready";
import { CertificateIssuedGuide } from "@/components/certificate/certificate-issued-guide";
import { CertificateIssueSuccess } from "@/components/certificate/certificate-issue-success";
import { CertificatePreviewCard } from "@/components/certificate/certificate-preview-card";
import { useCertificateIssue } from "@/components/certificate/use-certificate-issue";
import { mapDashboardStateToCertificateProgressViewModel } from "@/lib/certificate-view-model";

export type CertificatePanelProps = {
  state: CertificateDashboardState;
  generateButtonText?: string;
};

/**
 * Панель документа на странице сертификата.
 * В состоянии ready делегирует выдачу в {@link CertificateFlowReady}.
 */
export function CertificatePanel({ state }: CertificatePanelProps) {
  const cert = state.certificate;
  const isReady = state.userFlow === "ready" && !cert;

  if (isReady) {
    const progress = mapDashboardStateToCertificateProgressViewModel(state);
    return (
      <CertificateFlowReady
        progress={progress}
        courseId={state.courseId}
        previewState={state}
      />
    );
  }

  return <CertificatePanelIssuedOrProgress state={state} cert={cert} />;
}

function CertificatePanelIssuedOrProgress({
  state,
  cert,
}: {
  state: CertificateDashboardState;
  cert: CertificateDashboardState["certificate"];
}) {
  const downloadHref =
    cert?.pdfReady && cert.registryStatus !== "revoked"
      ? `/api/certificates/download/${cert.id}`
      : null;
  const canIssue = state.canGenerate && !cert;
  const { phase, loading, errorMessage, successPayload, issue, resetError } = useCertificateIssue({
    courseId: state.courseId,
    canIssue,
  });

  if (phase === "success" && successPayload) {
    return (
      <div className="space-y-6">
        <CertificateIssueSuccess payload={successPayload} />
        <CertificatePreviewCard state={state} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {cert ? (
        <CertificateIssuedGuide
          certificateId={cert.id}
          certificateNumber={cert.certificateNumber}
          issuedAt={cert.issuedAt}
          verifyUrl={cert.verifyUrl}
        />
      ) : null}

      <CertificatePreviewCard state={state} />

      {errorMessage ? (
        <p className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger" role="alert">
          {errorMessage}
        </p>
      ) : null}

      {!state.courseCompleted && !cert ? (
        <p className="text-sm text-muted-foreground">
          Выполните все требования — после этого откроется выдача официального PDF с QR-кодом проверки.
        </p>
      ) : null}

      <CertificateActions
        courseId={state.courseId}
        verifyUrl={cert?.verifyUrl ?? null}
        downloadHref={downloadHref}
        showGenerate={!cert && state.userFlow !== "ready"}
        courseCompleted={state.canGenerate}
        loading={loading}
        onGenerate={() => {
          resetError();
          void issue();
        }}
      />
    </div>
  );
}
