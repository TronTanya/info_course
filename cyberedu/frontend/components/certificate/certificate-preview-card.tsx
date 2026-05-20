import { Award, QrCode, ShieldCheck } from "lucide-react";
import type { CertificateDashboardState } from "@/lib/certificate";
import { formatRuDateLongUtc } from "@/lib/datetime-stable";
import { Badge } from "@/components/ui/badge";

export function CertificatePreviewCard({
  state,
}: {
  state: CertificateDashboardState;
}) {
  const cert = state.certificate;
  const issuedLabel = cert ? formatRuDateLongUtc(cert.issuedAt) : "—";
  const number = cert?.certificateNumber ?? "CE-····-····";
  const verifyUrl = cert?.verifyUrl ?? null;

  return (
    <article
      className="ce-cert-preview relative mx-auto max-w-2xl overflow-hidden rounded-sm border-2 border-amber-600/50 bg-[#fffef8] p-6 shadow-md sm:p-8"
      aria-label="Превью сертификата"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-linear-to-r from-amber-600/80 via-cyan to-amber-600/80"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-3 rounded-sm border border-slate-300/80"
        aria-hidden
      />

      <div className="relative space-y-6">
        <header className="flex flex-wrap items-start justify-between gap-4 border-b border-amber-900/10 bg-amber-50/60 px-3 py-4 pb-5">
          <div>
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-700">
              Официальный документ
            </p>
            <p className="mt-1 font-display text-lg font-semibold tracking-wide text-slate-900 sm:text-xl">Сертификат</p>
            <p className="mt-0.5 text-xs text-slate-600">об успешном прохождении программы</p>
          </div>
          <Award className="size-10 text-primary/80" aria-hidden />
        </header>

        <div className="space-y-3 text-center sm:text-left">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Настоящим подтверждается, что
          </p>
          <p className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {state.studentDisplayName}
          </p>
          <p className="text-sm text-muted-foreground">успешно завершил(а) программу</p>
          <p className="text-lg font-semibold text-primary">«{state.courseTitle}»</p>
          <p className="text-xs text-muted-foreground">Объём программы: {state.courseHours} академических часов</p>
        </div>

        <dl className="grid gap-4 border-y border-border/50 py-5 sm:grid-cols-2">
          <div>
            <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Дата выдачи</dt>
            <dd className="mt-1 text-sm font-medium text-foreground">{issuedLabel}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Регистрационный номер
            </dt>
            <dd className="mt-1 font-mono text-sm font-semibold tracking-tight text-foreground">{number}</dd>
          </div>
        </dl>

        <footer className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="size-4 text-success" aria-hidden />
            <span>Официальный реестр CyberEdu</span>
          </div>
          {cert ? (
            <Badge variant="success" className="gap-1">
              <ShieldCheck className="size-3" aria-hidden />
              Действителен
            </Badge>
          ) : (
            <Badge variant="secondary">Превью</Badge>
          )}
          {verifyUrl ? (
            <p className="w-full truncate font-mono text-[10px] text-muted-foreground sm:w-auto sm:max-w-[14rem]">
              <QrCode className="mr-1 inline size-3" aria-hidden />
              {verifyUrl.replace(/^https?:\/\//, "")}
            </p>
          ) : null}
        </footer>
      </div>
    </article>
  );
}
