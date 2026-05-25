"use client";

import { CertificateErrorState } from "@/components/certificate/certificate-states";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { LearnPageWrap } from "@/components/learn/learn-page-wrap";
import { logError } from "@/lib/log/structured";
import { useEffect } from "react";

export default function CertificatePageError({
  error,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logError("certificate_page_error", {
      digest: error.digest,
      code: error.message?.slice(0, 120),
    });
  }, [error]);

  return (
    <DashboardShell>
      <LearnPageWrap>
        <CertificateErrorState kind="load" digest={error.digest} retryHref="/dashboard/certificate" />
      </LearnPageWrap>
    </DashboardShell>
  );
}
