"use client";

import Link from "next/link";
import { Check, Download, ExternalLink, Link2, Share2, ShieldCheck } from "lucide-react";
import { useCertificateShare } from "@/components/certificate/use-certificate-share";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/ui/section-card";
import { formatRuDateLongUtc } from "@/lib/datetime-stable";

export type CertificateIssuedGuideProps = {
  certificateId: string;
  certificateNumber: string;
  issuedAt: string;
  verifyUrl: string;
};

export function CertificateIssuedGuide({
  certificateId,
  certificateNumber,
  issuedAt,
  verifyUrl,
}: CertificateIssuedGuideProps) {
  const downloadHref = `/api/certificates/download/${certificateId}`;
  const share = useCertificateShare(verifyUrl, certificateNumber);

  return (
    <SectionCard variant="lab" flushTitle className="p-5 sm:p-6" aria-labelledby="cert-issued-guide-heading">
      <div className="flex flex-wrap items-start gap-3">
        <span className="flex size-10 items-center justify-center rounded-xl border border-success/30 bg-success/10 text-success">
          <ShieldCheck className="size-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="typo-eyebrow text-success">Документ в реестре</p>
          <h2 id="cert-issued-guide-heading" className="mt-1 font-display text-lg font-semibold text-foreground">
            Сертификат готов
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            № <span className="font-mono font-medium text-foreground">{certificateNumber}</span>
            {" · "}
            выдан {formatRuDateLongUtc(issuedAt)}
          </p>
        </div>
      </div>

      <ol className="mt-5 space-y-3 text-sm" aria-label="Что можно сделать с сертификатом">
        <li className="flex gap-3 rounded-xl border border-border/70 bg-muted/10 px-3 py-2.5">
          <Download className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
          <div>
            <p className="font-medium text-foreground">Скачать PDF</p>
            <p className="text-xs text-muted-foreground">Официальный документ с QR-кодом для проверки.</p>
          </div>
        </li>
        <li className="flex gap-3 rounded-xl border border-border/70 bg-muted/10 px-3 py-2.5">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
          <div>
            <p className="font-medium text-foreground">Проверить подлинность</p>
            <p className="text-xs text-pretty text-muted-foreground">
              Любой может открыть публичную страницу — без email и лишних персональных данных.
            </p>
          </div>
        </li>
        <li className="flex gap-3 rounded-xl border border-border/70 bg-muted/10 px-3 py-2.5">
          <Share2 className="mt-0.5 size-4 shrink-0 text-cyan" aria-hidden />
          <div>
            <p className="font-medium text-foreground">Поделиться</p>
            <p className="text-xs text-muted-foreground">Передайте ссылку на проверку работодателю или в портфолио.</p>
          </div>
        </li>
      </ol>

      <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <Button variant="primary" size="lg" className="gap-2" asChild>
          <a href={downloadHref}>
            <Download className="size-4" aria-hidden />
            Скачать PDF
          </a>
        </Button>
        <Button variant="outline" size="lg" className="gap-2 border-primary/25" asChild>
          <Link href={share.shareUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="size-4" aria-hidden />
            Открыть страницу проверки
          </Link>
        </Button>
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="gap-2"
          disabled={share.copying}
          onClick={() => void share.copyVerifyLink()}
        >
          {share.copySucceeded ? (
            <Check className="size-4 text-success" aria-hidden />
          ) : (
            <Link2 className="size-4" aria-hidden />
          )}
          {share.copying ? "Копирование…" : share.copySucceeded ? "Скопировано" : "Скопировать ссылку проверки"}
        </Button>
        {share.canNativeShare ? (
          <Button
            type="button"
            variant="ghost"
            size="lg"
            className="gap-2"
            disabled={share.sharing}
            onClick={() => void share.shareVerifyLink()}
          >
            <Share2 className="size-4" aria-hidden />
            Поделиться
          </Button>
        ) : null}
      </div>
    </SectionCard>
  );
}
