import type { ReactNode } from "react";
import Link from "next/link";
import { Award, Ban, Clock, ShieldAlert, ShieldCheck } from "lucide-react";
import { BrandLogoMark } from "@/components/brand/brand-logo";
import type {
  CertificateVerifyPresentationModel,
  CertificateVerifyViewModel,
} from "@/types/certificate-view-model";
import { CertificatePublicNotFoundState } from "@/components/certificate/certificate-states";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type CertificateVerifyResult = CertificateVerifyPresentationModel;

export function CertificateVerifyView({ result }: { result: CertificateVerifyResult }) {
  if (result.status === "rate_limited") {
    return (
      <VerifyShell>
        <VerifySimpleCard
          tone="warning"
          icon={Clock}
          title="Слишком много запросов"
          message={result.verificationMessage}
          badge="ограничение"
        />
        <VerifyFooterActions />
      </VerifyShell>
    );
  }

  switch (result.status) {
    case "not_found":
      return (
        <VerifyShell>
          <CertificatePublicNotFoundState message={result.verificationMessage} />
          <VerifyFooterActions showLookup />
        </VerifyShell>
      );
    case "expired":
      return (
        <VerifyShell>
          <VerifySimpleCard
            tone="warning"
            icon={Clock}
            title="Срок действия сертификата истёк"
            message={result.verificationMessage}
            badge="истёк"
          />
          <VerifyFooterActions />
        </VerifyShell>
      );
    case "revoked":
      return (
        <VerifyShell>
          <VerifyRevokedCard result={result} />
          <VerifyFooterActions showLookup />
        </VerifyShell>
      );
    case "valid":
      return (
        <VerifyShell>
          <VerifyValidCard result={result} />
          <VerifyFooterActions />
        </VerifyShell>
      );
    default: {
      const _exhaustive: never = result;
      return _exhaustive;
    }
  }
}

function VerifyValidCard({ result }: { result: CertificateVerifyViewModel }) {
  return (
    <article className="ce-cert-verify-card w-full max-w-lg overflow-hidden rounded-2xl border border-emerald-500/35 bg-card shadow-(--shadow-card)">
      <header className="border-b border-emerald-500/25 bg-emerald-500/10 px-6 py-5">
        <VerifyBrandRow />
        <div className="mt-4 flex items-start gap-3">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="size-6" aria-hidden />
          </span>
          <div className="min-w-0">
            <h1 className="font-display text-xl font-semibold text-foreground">Сертификат подтверждён</h1>
            <p className="mt-1 text-sm text-pretty text-muted-foreground">{result.verificationMessage}</p>
          </div>
        </div>
        <Badge variant="success" className="mt-4 gap-1.5 px-3 py-1 font-mono text-[10px] uppercase">
          подтверждён
        </Badge>
      </header>

      <div className="space-y-4 px-6 py-5 text-sm">
        <dl className="space-y-3">
          {result.certificateNumber ? (
            <VerifyField label="ID сертификата" mono>
              {result.certificateNumber}
            </VerifyField>
          ) : null}
          {result.studentDisplayName ? (
            <VerifyField label="Владелец">{result.studentDisplayName}</VerifyField>
          ) : null}
          {result.courseTitle ? (
            <VerifyField label="Программа">{result.courseTitle}</VerifyField>
          ) : null}
          {result.issuedAt ? (
            <VerifyField label="Дата выдачи">{result.issuedAt}</VerifyField>
          ) : null}
        </dl>
        <p className="flex items-center gap-2 border-t border-border/60 pt-4 text-xs text-muted-foreground">
          <Award className="size-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden />
          Данные публикуются только из реестра CyberEdu Academy — без контактов и учётных записей.
        </p>
      </div>
    </article>
  );
}

function VerifyRevokedCard({ result }: { result: CertificateVerifyViewModel }) {
  return (
    <article className="ce-cert-verify-card w-full max-w-lg overflow-hidden rounded-2xl border border-amber-500/40 bg-card shadow-(--shadow-card)">
      <header className="border-b border-amber-500/30 bg-amber-500/10 px-6 py-5">
        <VerifyBrandRow />
        <div className="mt-4 flex items-start gap-3">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-400">
            <Ban className="size-6" aria-hidden />
          </span>
          <div className="min-w-0">
            <h1 className="font-display text-xl font-semibold text-foreground">Сертификат отозван</h1>
            <p className="mt-1 text-sm text-pretty text-muted-foreground">{result.verificationMessage}</p>
          </div>
        </div>
        <Badge variant="warning" className="mt-4 gap-1.5 px-3 py-1 font-mono text-[10px] uppercase">
          отозван
        </Badge>
      </header>

      <div className="px-6 py-5 text-sm">
        <dl className="space-y-3">
          {result.revokedAt ? (
            <VerifyField label="Дата отзыва">{result.revokedAt}</VerifyField>
          ) : null}
        </dl>
      </div>
    </article>
  );
}

function VerifySimpleCard({
  tone,
  icon: Icon,
  title,
  message,
  badge,
}: {
  tone: "neutral" | "warning";
  icon: typeof ShieldAlert;
  title: string;
  message: string;
  badge: string;
}) {
  const headerTone =
    tone === "warning"
      ? "border-amber-500/30 bg-amber-500/10"
      : "border-border/80 bg-muted/30";
  const iconTone =
    tone === "warning"
      ? "bg-amber-500/15 text-amber-700 dark:text-amber-400"
      : "bg-muted text-muted-foreground";

  return (
    <article
      className={cn(
        "ce-cert-verify-card w-full max-w-lg overflow-hidden rounded-2xl border bg-card shadow-(--shadow-card)",
        tone === "warning" ? "border-amber-500/35" : "border-border/80",
      )}
    >
      <header className={cn("border-b px-6 py-5", headerTone)}>
        <VerifyBrandRow />
        <div className="mt-4 flex items-start gap-3">
          <span className={cn("flex size-12 shrink-0 items-center justify-center rounded-xl", iconTone)}>
            <Icon className="size-6" aria-hidden />
          </span>
          <div className="min-w-0">
            <h1 className="font-display text-xl font-semibold text-foreground">{title}</h1>
            <p className="mt-1 text-sm text-pretty text-muted-foreground">{message}</p>
          </div>
        </div>
        <Badge variant={tone === "warning" ? "warning" : "secondary"} className="mt-4 font-mono text-[10px] uppercase">
          {badge}
        </Badge>
      </header>
    </article>
  );
}

function VerifyBrandRow() {
  return (
    <div className="flex items-center gap-3">
      <BrandLogoMark className="size-10 shrink-0 opacity-95" size={40} />
      <div>
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">CyberEdu Academy</p>
        <p className="text-xs text-muted-foreground">Публичная проверка реестра</p>
      </div>
    </div>
  );
}

function VerifyField({
  label,
  children,
  mono,
}: {
  label: string;
  children: ReactNode;
  mono?: boolean;
}) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd
        className={cn(
          "mt-0.5 font-medium text-foreground",
          mono && "font-mono text-sm font-semibold tracking-tight",
        )}
      >
        {children}
      </dd>
    </div>
  );
}

function VerifyShell({ children }: { children: ReactNode }) {
  return (
    <div className="ce-cert-verify-page flex min-h-screen flex-col items-center justify-center px-4 py-16">
      <div
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_center,color-mix(in_oklab,var(--primary)_8%,transparent),transparent_70%)]"
        aria-hidden
      />
      <div className="relative z-10 flex w-full max-w-lg flex-col items-center gap-6">{children}</div>
    </div>
  );
}

function VerifyFooterActions({ showLookup }: { showLookup?: boolean }) {
  return (
    <div className="flex w-full max-w-lg flex-col gap-2 sm:flex-row sm:justify-center">
      {showLookup ? (
        <Button variant="outline" className="w-full sm:w-auto" asChild>
          <Link href="/certificate/verify">Проверить другой ID</Link>
        </Button>
      ) : null}
      <Button variant="ghost" className="w-full sm:w-auto" asChild>
        <Link href="/">На главную CyberEdu</Link>
      </Button>
    </div>
  );
}
