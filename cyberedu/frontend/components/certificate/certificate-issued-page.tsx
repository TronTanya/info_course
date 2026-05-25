"use client";

import Link from "next/link";
import { Ban, ExternalLink, ShieldAlert, ShieldCheck } from "lucide-react";
import type { CertificateViewModel } from "@/types/certificate-view-model";
import { CertificatePreviewCard } from "@/components/certificate/certificate-preview-card";
import { CertificateShareActions } from "@/components/certificate/certificate-share-actions";
import { formatRuDateLongUtc } from "@/lib/datetime-stable";
import { Badge } from "@/components/ui/badge";
import { SectionCard } from "@/components/ui/section-card";
import { cn } from "@/lib/utils";
import { CertificatePdfDownloadNotice } from "@/components/certificate/certificate-pdf-download-notice";

function verifyLinkLabel(url: string): string {
  try {
    const u = new URL(url);
    return `${u.host}${u.pathname}`;
  } catch {
    return "Страница проверки";
  }
}

export function CertificateIssuedPage({ view }: { view: CertificateViewModel }) {
  const isRevoked = view.status === "revoked";

  return (
    <div className="space-y-6">
      <SectionCard
        variant="lab"
        flushTitle
        className={cn(
          "p-5 sm:p-6",
          isRevoked ? "border-danger/30 bg-danger/5" : "border-success/25 bg-success/5",
        )}
        aria-labelledby="cert-issued-status-heading"
      >
        <div className="flex flex-wrap items-start gap-3">
          <span
            className={cn(
              "flex size-11 shrink-0 items-center justify-center rounded-xl border",
              isRevoked
                ? "border-danger/30 bg-danger/10 text-danger"
                : "border-success/30 bg-success/10 text-success",
            )}
          >
            {isRevoked ? (
              <Ban className="size-5" aria-hidden />
            ) : (
              <ShieldCheck className="size-5" aria-hidden />
            )}
          </span>
          <div className="min-w-0 flex-1">
            <p className="typo-eyebrow text-muted-foreground">Статус документа</p>
            <h2 id="cert-issued-status-heading" className="mt-1 font-display text-xl font-semibold text-foreground">
              {isRevoked ? "Сертификат отозван" : "Сертификат действителен"}
            </h2>
            <p className="mt-1 text-sm text-pretty text-muted-foreground">
              {isRevoked
                ? "Запись в реестре сохранена, но документ недействителен для подтверждения прохождения. Скачивание PDF отключено."
                : "Документ зарегистрирован в реестре CyberEdu Academy. Передайте ссылку на публичную проверку — без email и внутренних токенов."}
            </p>
          </div>
          <Badge variant={isRevoked ? "danger" : "success"}>
            {isRevoked ? "revoked" : "valid"}
          </Badge>
        </div>

        <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">ID записи</dt>
            <dd className="mt-0.5 font-mono text-xs text-foreground">{view.id}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">Номер в реестре</dt>
            <dd className="mt-0.5 font-mono font-medium text-foreground">{view.certificateNumber}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">Дата выдачи</dt>
            <dd className="mt-0.5 font-medium text-foreground">{formatRuDateLongUtc(view.issuedAt)}</dd>
          </div>
          {isRevoked && view.revokedAt ? (
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">Отозван</dt>
              <dd className="mt-0.5 font-medium text-foreground">{formatRuDateLongUtc(view.revokedAt)}</dd>
            </div>
          ) : null}
          <div className="sm:col-span-2">
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">Ссылка на проверку</dt>
            <dd className="mt-0.5">
              <Link
                href={view.verifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-medium text-primary underline-offset-4 hover:underline"
              >
                {verifyLinkLabel(view.verifyUrl)}
                <ExternalLink className="size-3.5 shrink-0 opacity-80" aria-hidden />
              </Link>
            </dd>
          </div>
        </dl>
      </SectionCard>

      <div className="min-w-0">
        <h3 className="font-display text-base font-semibold text-foreground">Превью сертификата</h3>
        <p className="mt-1 text-sm text-muted-foreground">{view.courseTitle}</p>
        <div className="mt-4">
          <CertificatePreviewCard view={view} />
        </div>
      </div>

      {isRevoked ? (
        <p className="flex items-start gap-2 rounded-lg border border-danger/25 bg-danger/5 px-3 py-2 text-sm text-muted-foreground">
          <ShieldAlert className="mt-0.5 size-4 shrink-0 text-danger" aria-hidden />
          PDF недоступен для скачивания: сертификат отозван. Проверка по ссылке покажет статус revoked.
        </p>
      ) : view.pdfDownloadNotice ? (
        <CertificatePdfDownloadNotice message={view.pdfDownloadNotice} />
      ) : null}

      <CertificateShareActions
        verifyUrl={view.verifyUrl}
        certificateNumber={view.certificateNumber}
        pdfDownloadUrl={view.pdfDownloadUrl}
        pdfDownloadDisabled={isRevoked}
        pdfDisabledReason={
          isRevoked ? "Скачивание недоступно для отозванного сертификата" : undefined
        }
      />
    </div>
  );
}
