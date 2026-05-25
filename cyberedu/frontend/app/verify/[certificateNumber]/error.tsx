"use client";

import { CertificateErrorState } from "@/components/certificate/certificate-states";
import { logError } from "@/lib/log/structured";
import { useEffect } from "react";

export default function VerifyCertificateError({
  error,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logError("certificate_verify_page_error", {
      digest: error.digest,
      code: error.message?.slice(0, 120),
    });
  }, [error]);

  return (
    <div className="ce-cert-verify-page flex min-h-screen items-center justify-center px-4 py-16">
      <CertificateErrorState kind="verify" digest={error.digest} retryHref="/certificate/verify" />
    </div>
  );
}
