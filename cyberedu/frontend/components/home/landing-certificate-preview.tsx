import Link from "next/link";
import { Award, ExternalLink, QrCode, ShieldCheck } from "lucide-react";
import { BrandLogoMark } from "@/components/brand/brand-logo";
import {
  LANDING_CERTIFICATE_PREVIEW,
  LANDING_CERT_VERIFY_HREF,
} from "@/lib/landing-content";
import { cn } from "@/lib/utils";

export function LandingCertificatePreview({ className }: { className?: string }) {
  const cert = LANDING_CERTIFICATE_PREVIEW;

  return (
    <article
      className={cn(
        "ce-landing-cert-preview ce-cert-card ce-landing-glass-tile border-glow relative mx-auto w-full max-w-md overflow-hidden",
        className,
      )}
      aria-label="Образец сертификата CyberEdu"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/50 to-transparent"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-16 -top-12 size-40 rounded-full bg-primary/12 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-10 -left-10 size-32 rounded-full bg-cyan/10 blur-3xl"
        aria-hidden
      />

      <div className="relative p-6 sm:p-8">
        <header className="flex items-start justify-between gap-4 border-b border-border/60 pb-5">
          <div className="min-w-0">
            <p className="typo-eyebrow text-primary">{cert.title}</p>
            <p className="mt-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Практическая академия кибербезопасности
            </p>
          </div>
          <BrandLogoMark className="size-11 shrink-0 opacity-95" size={44} />
        </header>

        <div className="relative mt-6 space-y-1 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Настоящим подтверждается, что
          </p>
          <p className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-[1.65rem]">
            {cert.recipientName}
          </p>
          <p className="pt-2 text-sm text-muted-foreground">успешно завершила программу</p>
          <p className="font-display text-base font-semibold text-primary sm:text-lg">«{cert.courseTitle}»</p>
        </div>

        <dl className="mt-6 grid grid-cols-2 gap-4 rounded-xl border border-border/70 bg-background/40 p-4 text-left">
          <div>
            <dt className="text-[10px] font-semibold uppercase tracking-wider text-subtle-foreground">Дата</dt>
            <dd className="mt-1 text-sm font-medium tabular-nums text-foreground">{cert.issuedDateLabel}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-semibold uppercase tracking-wider text-subtle-foreground">ID</dt>
            <dd className="mt-1 font-mono text-xs font-semibold tracking-tight text-foreground sm:text-sm">
              {cert.certificateId}
            </dd>
          </div>
        </dl>

        <footer className="mt-6 flex items-end justify-between gap-4">
          <div
            className="flex flex-col items-center gap-1.5 rounded-xl border border-dashed border-border/80 bg-muted/15 p-3"
            aria-hidden
          >
            <QrCode className="size-11 text-primary/75" strokeWidth={1.25} />
            <span className="text-[9px] font-medium uppercase tracking-wider text-muted-foreground">QR</span>
          </div>

          <div className="min-w-0 flex-1 space-y-2 text-right">
            <p className="inline-flex items-center justify-end gap-1.5 rounded-full border border-success/25 bg-success/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-success">
              <ShieldCheck className="size-3.5" aria-hidden />
              Verified
            </p>
            <p className="text-[10px] text-muted-foreground">Проверка подлинности</p>
            <Link
              href={LANDING_CERT_VERIFY_HREF}
              className="inline-flex max-w-full items-center justify-end gap-1 font-mono text-[11px] font-medium text-primary underline-offset-4 transition-colors hover:text-cyan focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-sm"
            >
              <span className="truncate">{cert.verifyPathDisplay}</span>
              <ExternalLink className="size-3 shrink-0" aria-hidden />
            </Link>
          </div>
        </footer>

        <div
          className="pointer-events-none absolute bottom-20 right-6 flex size-16 items-center justify-center rounded-full border border-primary/25 bg-primary/8 text-primary/90 shadow-[0_0_32px_-8px_color-mix(in_oklab,var(--primary)_40%,transparent)]"
          aria-hidden
        >
          <Award className="size-8" strokeWidth={1.5} />
        </div>

        <p className="mt-5 text-center text-[10px] uppercase tracking-[0.2em] text-subtle-foreground">
          Образец · не является официальным документом
        </p>
      </div>
    </article>
  );
}
