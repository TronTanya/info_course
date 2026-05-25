"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Download,
  ExternalLink,
  Link2,
  Share2,
} from "lucide-react";
import { CertificatePdfDownloadButton } from "@/components/certificate/certificate-pdf-download-button";
import { Button } from "@/components/ui/button";
import { useCertificateShare } from "@/components/certificate/use-certificate-share";
import { cn } from "@/lib/utils";

export type CertificateShareActionsProps = {
  verifyUrl: string;
  certificateNumber: string;
  pdfDownloadUrl?: string;
  pdfDownloadDisabled?: boolean;
  pdfDisabledReason?: string;
  showDashboardBack?: boolean;
  className?: string;
};

/**
 * Безопасный шаринг: только публичный verify URL (не dashboard, без query).
 */
export function CertificateShareActions({
  verifyUrl,
  certificateNumber,
  pdfDownloadUrl,
  pdfDownloadDisabled = false,
  pdfDisabledReason,
  showDashboardBack = true,
  className,
}: CertificateShareActionsProps) {
  const {
    shareUrl,
    canNativeShare,
    copying,
    sharing,
    copySucceeded,
    copyVerifyLink,
    shareVerifyLink,
  } = useCertificateShare(verifyUrl, certificateNumber);

  const canDownload = Boolean(pdfDownloadUrl) && !pdfDownloadDisabled;

  return (
    <section
      className={cn("space-y-3", className)}
      aria-labelledby="cert-share-actions-heading"
    >
      <div>
        <h3 id="cert-share-actions-heading" className="font-display text-base font-semibold text-foreground">
          Поделиться и скачать
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Передавайте ссылку на публичную проверку — не ссылку на личный кабинет.
        </p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="gap-2"
          disabled={copying}
          onClick={() => void copyVerifyLink()}
        >
          {copySucceeded ? (
            <Check className="size-4 text-success" aria-hidden />
          ) : (
            <Link2 className="size-4" aria-hidden />
          )}
          {copying ? "Копирование…" : copySucceeded ? "Скопировано" : "Скопировать ссылку проверки"}
        </Button>

        <Button variant="outline" size="lg" className="gap-2" asChild>
          <Link href={shareUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="size-4" aria-hidden />
            Открыть страницу проверки
          </Link>
        </Button>

        {canDownload && pdfDownloadUrl ? (
          <CertificatePdfDownloadButton href={pdfDownloadUrl} />
        ) : (
          <Button
            variant="primary"
            size="lg"
            className="gap-2"
            disabled
            title={pdfDisabledReason ?? "Скачивание недоступно"}
          >
            <Download className="size-4" aria-hidden />
            Скачать PDF
          </Button>
        )}

        {canNativeShare ? (
          <Button
            type="button"
            variant="ghost"
            size="lg"
            className="gap-2"
            disabled={sharing}
            onClick={() => void shareVerifyLink()}
          >
            <Share2 className="size-4" aria-hidden />
            {sharing ? "Открытие…" : "Поделиться"}
          </Button>
        ) : null}

        {showDashboardBack ? (
          <Button variant="ghost" size="lg" className="gap-2" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="size-4" aria-hidden />
              Вернуться в dashboard
            </Link>
          </Button>
        ) : null}
      </div>
    </section>
  );
}
