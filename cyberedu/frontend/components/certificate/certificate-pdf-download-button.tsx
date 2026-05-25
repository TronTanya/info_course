"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Download } from "lucide-react";
import { CertificateErrorState, CertificateUnauthorizedState } from "@/components/certificate/certificate-states";
import {
  CERTIFICATE_ERROR_COPY,
  mapCertificatePdfDownloadError,
  sanitizeCertificateUserMessage,
  type CertificatePdfDownloadErrorKind,
} from "@/lib/certificate-ui-states";
import { Button } from "@/components/ui/button";

export function CertificatePdfDownloadButton({
  href,
  disabled,
  label = "Скачать PDF",
}: {
  href: string;
  disabled?: boolean;
  label?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorKind, setErrorKind] = useState<CertificatePdfDownloadErrorKind | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function download() {
    if (disabled || loading) return;
    setErrorKind(null);
    setErrorMessage(null);
    setLoading(true);
    try {
      const res = await fetch(href);
      if (!res.ok) {
        const body = await res.text().catch(() => "");
        setErrorKind(mapCertificatePdfDownloadError(res.status));
        setErrorMessage(
          sanitizeCertificateUserMessage(body, CERTIFICATE_ERROR_COPY.pdf_download.description),
        );
        return;
      }
      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition");
      const filenameMatch = disposition?.match(/filename="([^"]+)"/i);
      const filename = filenameMatch?.[1] ?? "certificate.pdf";
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      anchor.rel = "noopener";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      router.refresh();
    } catch {
      setErrorKind("pdf_download");
      setErrorMessage(CERTIFICATE_ERROR_COPY.pdf_download.description);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        type="button"
        variant="primary"
        size="lg"
        className="gap-2"
        disabled={disabled || loading}
        loading={loading}
        onClick={() => void download()}
      >
        <Download className="size-4" aria-hidden />
        {loading ? "Подготовка PDF…" : label}
      </Button>
      {errorKind === "unauthorized" ? <CertificateUnauthorizedState compact /> : null}
      {errorKind === "pdf_download" ? (
        <CertificateErrorState kind="pdf_download" compact message={errorMessage ?? undefined} />
      ) : null}
    </div>
  );
}
