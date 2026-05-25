import type { ReactNode } from "react";
import Link from "next/link";
import {
  Award,
  FileQuestion,
  FileWarning,
  Inbox,
  LogIn,
  Search,
  ShieldAlert,
  ShieldOff,
} from "lucide-react";
import {
  CERTIFICATE_EMPTY_COPY,
  CERTIFICATE_ERROR_COPY,
  CERTIFICATE_PUBLIC_NOT_FOUND_COPY,
  CERTIFICATE_UNAUTHORIZED_COPY,
  type CertificateEmptyKind,
  type CertificateErrorKind,
  certificateSafeDigestRef,
  sanitizeCertificateUserMessage,
} from "@/lib/certificate-ui-states";
import { guestAuthLinks } from "@/lib/design-system/nav-config";
import { DashboardPageRetryButton } from "@/components/dashboard/dashboard-page-retry-button";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorCard } from "@/components/ui/error-card";
import { PageHeaderSkeleton } from "@/components/ui/page-skeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const EMPTY_ICONS: Record<CertificateEmptyKind, ReactNode> = {
  not_available: <Award className="size-5 opacity-70" aria-hidden />,
  not_issued_yet: <FileQuestion className="size-5 opacity-70" aria-hidden />,
  admin_no_issued: <Inbox className="size-5 opacity-70" aria-hidden />,
  admin_no_ready: <Search className="size-5 opacity-70" aria-hidden />,
};

function StateFrame({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-[40vh] items-center justify-center px-4 py-10">{children}</div>
  );
}

/** Скелетон блока прогресса к сертификату. */
export function CertificateProgressSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("space-y-5 rounded-2xl border border-border/70 bg-card/40 p-5 sm:p-6", className)}
      aria-busy="true"
      aria-label="Загрузка прогресса к сертификату"
    >
      <div className="flex flex-wrap justify-between gap-3">
        <div className="space-y-2">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-6 w-56 max-w-full" />
          <Skeleton className="h-4 w-full max-w-md" />
        </div>
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>
      <Skeleton className="h-3 w-full max-w-lg rounded-full" />
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-36 rounded-xl" />
        <Skeleton className="h-36 rounded-xl" />
      </div>
    </div>
  );
}

/** Скелетон превью сертификата. */
export function CertificatePreviewSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-2xl overflow-hidden rounded-2xl border border-primary/15 bg-card/50 p-6 sm:p-8",
        className,
      )}
      aria-busy="true"
      aria-label="Загрузка превью сертификата"
    >
      <div className="flex justify-between gap-4 border-b border-border/60 pb-5">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-40" />
          <Skeleton className="h-7 w-full max-w-sm" />
          <Skeleton className="h-4 w-3/4 max-w-xs" />
        </div>
        <Skeleton className="size-12 shrink-0 rounded-xl" />
      </div>
      <div className="mt-8 space-y-2 text-center sm:text-left">
        <Skeleton className="mx-auto h-3 w-48 sm:mx-0" />
        <Skeleton className="mx-auto h-9 w-64 max-w-full sm:mx-0" />
        <Skeleton className="mx-auto h-5 w-56 max-w-full sm:mx-0" />
      </div>
      <div className="mt-6 grid gap-3 rounded-xl border border-border/50 p-4 sm:grid-cols-2">
        <Skeleton className="h-12" />
        <Skeleton className="h-12" />
      </div>
      <div className="mt-6 flex gap-4 border-t border-border/60 pt-5">
        <Skeleton className="size-20 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-full max-w-xs" />
        </div>
      </div>
    </div>
  );
}

/** Полная загрузка страницы /dashboard/certificate. */
export function CertificatePageLoading() {
  return (
    <div className="min-w-0 space-y-8" aria-busy="true" aria-label="Загрузка раздела сертификата">
      <PageHeaderSkeleton />
      <Skeleton className="h-28 w-full rounded-2xl" />
      <CertificateProgressSkeleton />
      <CertificatePreviewSkeleton />
    </div>
  );
}

/** Скелетон публичной verify-страницы. */
export function CertificateVerifyPageSkeleton() {
  return (
    <div
      className="ce-cert-verify-page flex min-h-screen flex-col items-center justify-center px-4 py-16"
      aria-busy="true"
      aria-label="Загрузка проверки сертификата"
    >
      <div className="relative z-10 w-full max-w-lg space-y-4">
        <Skeleton className="mx-auto h-3 w-32" />
        <Skeleton className="mx-auto h-8 w-64 max-w-full" />
        <Skeleton className="h-[22rem] w-full rounded-2xl" />
        <Skeleton className="mx-auto h-10 w-40 rounded-xl" />
      </div>
    </div>
  );
}

export function CertificateEmptyState({
  kind,
  compact = false,
  className,
  action,
}: {
  kind: CertificateEmptyKind;
  compact?: boolean;
  className?: string;
  action?: ReactNode;
}) {
  const copy = CERTIFICATE_EMPTY_COPY[kind];
  const defaultAction =
    kind === "not_available" || kind === "not_issued_yet" ? (
      <Button asChild variant="primary" className="min-h-10">
        <Link href="/dashboard">В кабинет</Link>
      </Button>
    ) : kind === "admin_no_issued" || kind === "admin_no_ready" ? (
      <Button asChild variant="outline" className="min-h-10">
        <Link href="/admin">В админ-панель</Link>
      </Button>
    ) : undefined;

  return (
    <EmptyState
      compact={compact}
      className={className}
      terminalLine={copy.terminalLine}
      icon={EMPTY_ICONS[kind]}
      title={copy.title}
      description={copy.description}
      action={action ?? defaultAction}
    />
  );
}

function CertificateErrorActions({ retryHref }: { retryHref?: string }) {
  return (
    <div className="flex flex-wrap justify-center gap-3">
      {retryHref ? (
        <Button asChild variant="primary" className="min-h-10">
          <Link href={retryHref}>Обновить</Link>
        </Button>
      ) : (
        <DashboardPageRetryButton />
      )}
      <Button asChild variant="outline" className="min-h-10">
        <Link href="/dashboard">В кабинет</Link>
      </Button>
    </div>
  );
}

export function CertificateErrorState({
  kind,
  compact = false,
  message,
  digest,
  retryHref,
  action,
}: {
  kind: CertificateErrorKind;
  compact?: boolean;
  /** Доп. текст после санитизации (например, из server action). */
  message?: string;
  digest?: string;
  retryHref?: string;
  action?: ReactNode;
}) {
  const copy = CERTIFICATE_ERROR_COPY[kind];
  const safeMessage = message
    ? sanitizeCertificateUserMessage(message, copy.description)
    : copy.description;
  const ref = certificateSafeDigestRef(digest);

  if (compact) {
    return (
      <p
        className="flex items-start gap-2 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2.5 text-sm text-danger"
        role="alert"
      >
        <FileWarning className="mt-0.5 size-4 shrink-0" aria-hidden />
        <span>
          <span className="font-medium">{copy.title}.</span> {safeMessage}
        </span>
      </p>
    );
  }

  return (
    <StateFrame>
      <ErrorCard
        className="max-w-lg w-full"
        server={kind === "load" || kind === "verify"}
        title={copy.title}
        description={safeMessage}
        code={ref}
        action={action ?? <CertificateErrorActions retryHref={retryHref} />}
      />
    </StateFrame>
  );
}

export function CertificateUnauthorizedState({
  compact = false,
  className,
}: {
  compact?: boolean;
  className?: string;
}) {
  const copy = CERTIFICATE_UNAUTHORIZED_COPY;
  if (compact) {
    return (
      <EmptyState
        compact
        className={className}
        terminalLine={copy.terminalLine}
        icon={<ShieldOff className="size-5 opacity-70" aria-hidden />}
        title={copy.title}
        description={copy.description}
        action={
          <Button asChild variant="outline" size="sm" className="min-h-9">
            <Link href="/dashboard/certificate">Мой сертификат</Link>
          </Button>
        }
      />
    );
  }
  return (
    <StateFrame>
      <EmptyState
        className={cn("max-w-lg w-full", className)}
        terminalLine={copy.terminalLine}
        icon={<ShieldOff className="size-7 opacity-70" aria-hidden />}
        title={copy.title}
        description={copy.description}
        action={
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild variant="primary" className="min-h-10">
              <Link href="/dashboard/certificate">Мой сертификат</Link>
            </Button>
            <Button asChild variant="outline" className="min-h-10">
              <Link href="/dashboard">В кабинет</Link>
            </Button>
          </div>
        }
      />
    </StateFrame>
  );
}

/** Публичная verify: запись не найдена (без внутренних ID в тексте). */
export function CertificatePublicNotFoundState({
  message,
  showLookup = true,
}: {
  /** Из verificationMessage (уже безопасный с сервера). */
  message?: string;
  showLookup?: boolean;
}) {
  const copy = CERTIFICATE_PUBLIC_NOT_FOUND_COPY;
  const description = message
    ? sanitizeCertificateUserMessage(message, copy.description)
    : copy.description;

  return (
    <article className="ce-cert-verify-card w-full max-w-lg overflow-hidden rounded-2xl border border-border/80 bg-card shadow-(--shadow-card)">
      <header className="border-b border-border/80 bg-muted/30 px-6 py-5">
        <p className="font-mono text-[10px] uppercase tracking-widest text-primary">CyberEdu Academy</p>
        <div className="mt-4 flex items-start gap-3">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
            <ShieldAlert className="size-6" aria-hidden />
          </span>
          <div className="min-w-0">
            <h1 className="font-display text-xl font-semibold text-foreground">{copy.title}</h1>
            <p className="mt-1 text-sm text-pretty text-muted-foreground">{description}</p>
          </div>
        </div>
      </header>
      {showLookup ? (
        <div className="flex flex-wrap gap-2 px-6 py-4">
          <Button asChild variant="outline" size="sm" className="min-h-9">
            <Link href="/certificate/verify">Другой номер</Link>
          </Button>
          <Button asChild variant="ghost" size="sm" className="min-h-9">
            <Link href="/">На главную</Link>
          </Button>
        </div>
      ) : null}
    </article>
  );
}

/** Гостевой доступ к приватному разделу. */
export function CertificateLoginRequiredState() {
  return (
    <StateFrame>
      <EmptyState
        terminalLine="auth --required"
        title="Войдите в учебный кабинет"
        description="Раздел сертификата доступен после входа в CyberEdu."
        icon={<LogIn className="size-7 opacity-70" aria-hidden />}
        action={
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild variant="primary" className="min-h-10">
              <Link href={guestAuthLinks.login}>{guestAuthLinks.loginLabel}</Link>
            </Button>
            <Button asChild variant="outline" className="min-h-10">
              <Link href={guestAuthLinks.register}>Зарегистрироваться</Link>
            </Button>
          </div>
        }
      />
    </StateFrame>
  );
}
