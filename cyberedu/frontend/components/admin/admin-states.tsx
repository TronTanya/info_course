"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import {
  Award,
  ClipboardList,
  Inbox,
  LogIn,
  ScrollText,
  ShieldOff,
  Users,
} from "lucide-react";
import {
  ADMIN_EMPTY_COPY,
  ADMIN_LOAD_ERROR_COPY,
  type AdminEmptyKind,
  adminSafeDigestRef,
  sanitizeAdminActionError,
} from "@/lib/admin-ui-states";
import { cyber } from "@/lib/design-system/cyber";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorCard } from "@/components/ui/error-card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const EMPTY_ICONS: Record<AdminEmptyKind, ReactNode> = {
  no_students: <Users className="size-5 opacity-70" aria-hidden />,
  no_practices: <ClipboardList className="size-5 opacity-70" aria-hidden />,
  no_certificates: <Award className="size-5 opacity-70" aria-hidden />,
  no_ready_to_issue: <Award className="size-5 opacity-70" aria-hidden />,
  no_audit: <ScrollText className="size-5 opacity-70" aria-hidden />,
};

function StateFrame({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center px-4 py-10">{children}</div>
  );
}

/** Скелетон одной KPI-карточки админки. */
export function AdminKpiCardSkeleton() {
  return (
    <article className={cn(cyber.adminKpi, "overflow-hidden rounded-2xl border pt-0")} aria-hidden>
      <Skeleton className="h-1 w-full rounded-none" />
      <div className="space-y-2 px-4 pb-4 pt-4">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-9 w-16" />
        <Skeleton className="h-3 w-full max-w-[12rem]" />
      </div>
    </article>
  );
}

export function AdminKpiSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div
      className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6"
      aria-busy="true"
      aria-label="Загрузка показателей"
    >
      {Array.from({ length: count }).map((_, i) => (
        <AdminKpiCardSkeleton key={i} />
      ))}
    </div>
  );
}

/** Скелетон таблицы / списка внутри панели. */
export function AdminTableSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <ul className="space-y-2" aria-busy="true" aria-label="Загрузка таблицы">
      {Array.from({ length: rows }).map((_, i) => (
        <li key={i} className="rounded-xl border border-border/70 px-3 py-3">
          <Skeleton className="h-4 w-2/5 max-w-[10rem]" />
          <Skeleton className="mt-2 h-3 w-full max-w-md" />
          <Skeleton className="mt-2 h-3 w-1/3 max-w-[8rem]" />
        </li>
      ))}
    </ul>
  );
}

/** Скелетон секции-панели (заголовок + тело). */
export function AdminPanelSkeleton({
  className,
  rows = 3,
}: {
  className?: string;
  rows?: number;
}) {
  return (
    <div
      className={cn("rounded-2xl border border-border/80 bg-card/40 p-4 sm:p-6", className)}
      aria-busy="true"
      aria-label="Загрузка панели"
    >
      <Skeleton className="h-5 w-40" />
      <Skeleton className="mt-2 h-3 w-full max-w-sm" />
      <div className="mt-4">
        <AdminTableSkeleton rows={rows} />
      </div>
    </div>
  );
}

/** Полный скелетон главной админки: header, KPI, панели, sidebar. */
export function AdminDashboardSkeleton() {
  return (
    <div className="min-w-0 space-y-6 sm:space-y-8" aria-busy="true" aria-label="Загрузка админ-панели">
      <div className={cn(cyber.hero, "rounded-2xl border-primary/15 p-5 sm:p-7")}>
        <Skeleton className="h-8 w-48 max-w-full" />
        <Skeleton className="mt-3 h-4 w-full max-w-xl" />
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:max-w-md">
          <Skeleton className="h-11 rounded-xl" />
          <Skeleton className="h-11 rounded-xl" />
        </div>
      </div>

      <AdminKpiSkeletonGrid />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-2xl" />
        ))}
      </div>

      <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,20rem)]">
        <div className="flex flex-col gap-6">
          <AdminPanelSkeleton rows={4} />
          <AdminPanelSkeleton rows={5} />
          <AdminPanelSkeleton rows={4} />
          <div className="grid gap-6 lg:grid-cols-2">
            <AdminPanelSkeleton rows={2} />
            <AdminPanelSkeleton rows={3} />
          </div>
        </div>
        <aside className="flex flex-col gap-6">
          <AdminPanelSkeleton rows={2} />
          <AdminPanelSkeleton rows={4} />
          <AdminPanelSkeleton rows={3} />
        </aside>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-[280px] rounded-2xl" />
        <Skeleton className="h-[280px] rounded-2xl" />
      </div>
    </div>
  );
}

export function AdminEmptyState({
  kind,
  compact = true,
  className,
  action,
  description,
}: {
  kind: AdminEmptyKind;
  compact?: boolean;
  className?: string;
  action?: ReactNode;
  /** Переопределение описания (без технических деталей). */
  description?: string;
}) {
  const copy = ADMIN_EMPTY_COPY[kind];
  return (
    <EmptyState
      compact={compact}
      className={className}
      icon={EMPTY_ICONS[kind] ?? <Inbox className="size-5 opacity-70" aria-hidden />}
      title={copy.title}
      description={description ?? copy.description}
      terminalLine={copy.terminalLine}
      action={action}
    />
  );
}

function AdminErrorActions({
  retryHref = "/admin",
  onRetry,
}: {
  retryHref?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-wrap justify-center gap-3">
      <Button
        type="button"
        variant="primary"
        className="min-h-10"
        onClick={() => (onRetry ? onRetry() : window.location.reload())}
      >
        Попробовать снова
      </Button>
      <Button asChild variant="outline" className="min-h-10">
        <Link href={retryHref}>К обзору</Link>
      </Button>
    </div>
  );
}

/** Ошибка загрузки dashboard (route error boundary). */
export function AdminDashboardLoadError({
  digest,
  onRetry,
}: {
  digest?: string;
  onRetry?: () => void;
}) {
  const copy = ADMIN_LOAD_ERROR_COPY.dashboard;
  return (
    <StateFrame>
      <ErrorCard
        className="max-w-lg w-full"
        server
        title={copy.title}
        description={copy.description}
        code={adminSafeDigestRef(digest)}
        action={<AdminErrorActions onRetry={onRetry} />}
      />
    </StateFrame>
  );
}

/** Ошибка загрузки очереди практик (секция на dashboard). */
export function AdminReviewQueueLoadError({ className }: { className?: string }) {
  const copy = ADMIN_LOAD_ERROR_COPY.review_queue;
  return (
    <ErrorCard
      className={cn("max-w-none w-full", className)}
      server
      title={copy.title}
      description={copy.description}
      action={
        <div className="flex flex-wrap justify-center gap-3">
          <Button type="button" variant="primary" size="sm" className="min-h-10" onClick={() => window.location.reload()}>
            Повторить
          </Button>
          <Button asChild variant="outline" size="sm" className="min-h-10">
            <Link href="/admin/submissions">Все отправки</Link>
          </Button>
        </div>
      }
    />
  );
}

/** Inline-ошибка server action / формы админки. */
export function AdminActionError({
  message,
  className,
}: {
  message?: string | null;
  className?: string;
}) {
  const text = sanitizeAdminActionError(message);
  return (
    <p role="alert" className={cn("text-xs font-medium text-danger", className)}>
      {text}
    </p>
  );
}

export type AdminUnauthorizedVariant = "login" | "forbidden";

/** Нет прав / не авторизован (layout admin). */
export function AdminUnauthorizedState({ variant }: { variant: AdminUnauthorizedVariant }) {
  const isLogin = variant === "login";
  return (
    <EmptyState
      className="max-w-md"
      icon={
        isLogin ? (
          <LogIn className="size-5 opacity-70" aria-hidden />
        ) : (
          <ShieldOff className="size-5 opacity-70" aria-hidden />
        )
      }
      title={isLogin ? "Требуется вход" : "Нет доступа к админ-панели"}
      description={
        isLogin
          ? "Войдите под учётной записью администратора, чтобы продолжить."
          : "Этот раздел доступен только администраторам. Обратитесь к владельцу платформы, если нужен доступ."
      }
      terminalLine={isLogin ? "auth --required" : "rbac --forbidden"}
      action={
        <Button asChild variant="primary">
          <Link href={isLogin ? "/auth/login?callbackUrl=%2Fadmin" : "/dashboard/profile"}>
            {isLogin ? "Войти" : "Вернуться в личный кабинет"}
          </Link>
        </Button>
      }
    />
  );
}
