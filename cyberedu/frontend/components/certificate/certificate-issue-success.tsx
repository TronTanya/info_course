import Link from "next/link";
import { CheckCircle2, Download } from "lucide-react";
import type { CertificateIssueSuccessPayload } from "@/lib/certificate-issue-client";
import { formatRuDateLongUtc } from "@/lib/datetime-stable";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/ui/section-card";

export function CertificateIssueSuccess({
  payload,
}: {
  payload: CertificateIssueSuccessPayload;
}) {
  const downloadHref = `/api/certificates/download/${payload.certificateId}`;

  return (
    <SectionCard
      variant="lab"
      className="border-success/30 bg-success/5 p-5 sm:p-6"
      aria-live="polite"
      aria-labelledby="cert-issue-success-heading"
    >
      <div className="flex items-start gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-success/15 text-success">
          <CheckCircle2 className="size-6" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="typo-eyebrow text-success">Успешно</p>
          <h3 id="cert-issue-success-heading" className="mt-1 font-display text-lg font-semibold text-foreground">
            Сертификат получен
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Запись создана на сервере. Номер в реестре:{" "}
            <span className="font-mono font-medium text-foreground">{payload.certificateNumber}</span>
            {payload.issuedAt ? (
              <>
                {" "}
                · {formatRuDateLongUtc(payload.issuedAt)}
              </>
            ) : null}
          </p>
        </div>
      </div>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <Button variant="primary" size="lg" className="gap-2" asChild>
          <a href={downloadHref}>
            <Download className="size-4" aria-hidden />
            Скачать PDF
          </a>
        </Button>
        <Button variant="outline" size="lg" asChild>
          <Link href="/dashboard/certificate">Открыть сертификат</Link>
        </Button>
      </div>
    </SectionCard>
  );
}
