"use client";

import Link from "next/link";
import { Check, ExternalLink, Link2 } from "lucide-react";
import { useCertificateShare } from "@/components/certificate/use-certificate-share";
import { Button } from "@/components/ui/button";

export function CertificatePreviewVerifyActions({ verifyUrl }: { verifyUrl: string }) {
  const { shareUrl, copying, copySucceeded, copyVerifyLink } = useCertificateShare(verifyUrl);

  return (
    <div className="ce-certificate-preview-actions mt-2 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
      <Button
        type="button"
        variant="outline"
        size="lg"
        className="min-h-12 gap-2 touch-manipulation sm:min-h-11 sm:size-sm"
        disabled={copying}
        onClick={() => void copyVerifyLink()}
      >
        {copySucceeded ? (
          <Check className="size-3.5 text-success" aria-hidden />
        ) : (
          <Link2 className="size-3.5" aria-hidden />
        )}
        {copying ? "Копирование…" : copySucceeded ? "Скопировано" : "Скопировать ссылку"}
      </Button>
      <Button
        variant="outline"
        size="lg"
        className="min-h-12 gap-2 touch-manipulation sm:min-h-11 sm:size-sm"
        asChild
      >
        <Link href={shareUrl} target="_blank" rel="noopener noreferrer">
          <ExternalLink className="size-3.5" aria-hidden />
          Открыть проверку
        </Link>
      </Button>
    </div>
  );
}
