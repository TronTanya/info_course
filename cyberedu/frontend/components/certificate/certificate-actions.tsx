"use client";

import Link from "next/link";
import { ArrowLeft, Check, Copy, Download, ExternalLink, Share2 } from "lucide-react";
import { useCertificateShare } from "@/components/certificate/use-certificate-share";
import { Button } from "@/components/ui/button";

export function CertificateActions({
  courseId,
  verifyUrl,
  downloadHref,
  showGenerate,
  courseCompleted,
  loading,
  onGenerate,
}: {
  courseId: string;
  verifyUrl: string | null;
  downloadHref: string | null;
  showGenerate: boolean;
  courseCompleted: boolean;
  loading?: boolean;
  onGenerate?: () => void;
}) {
  const share = useCertificateShare(verifyUrl ?? "");

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
      {downloadHref ? (
        <Button variant="primary" size="lg" className="gap-2" asChild>
          <a href={downloadHref}>
            <Download className="size-4" aria-hidden />
            Скачать PDF
          </a>
        </Button>
      ) : null}

      {showGenerate ? (
        <Button
          type="button"
          variant="primary"
          size="lg"
          className="gap-2"
          disabled={!courseCompleted || loading}
          title={!courseCompleted ? "Сначала выполните все требования" : undefined}
          onClick={onGenerate}
        >
          {loading ? "Генерация…" : "Получить сертификат"}
        </Button>
      ) : null}

      {verifyUrl ? (
        <>
          <Button variant="outline" size="lg" className="gap-2 border-primary/25" asChild>
            <a href={share.shareUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="size-4" aria-hidden />
              Открыть страницу проверки
            </a>
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
              <Copy className="size-4" aria-hidden />
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
        </>
      ) : null}

      <Button variant="ghost" size="lg" className="gap-2" asChild>
        <Link href={`/dashboard/course/${courseId}`}>
          <ArrowLeft className="size-4" aria-hidden />
          К курсу
        </Link>
      </Button>
    </div>
  );
}
