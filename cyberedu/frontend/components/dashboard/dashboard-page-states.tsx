import type { ReactNode } from "react";
import Link from "next/link";
import {
  BookOpen,
  History,
  LayoutGrid,
  LogIn,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import type { DashboardPageLoadErrorKind } from "@/lib/dashboard-page-load";
import {
  DASHBOARD_EMPTY_COPY,
  type DashboardEmptyKind,
} from "@/lib/dashboard-empty-copy";
import { guestAuthLinks } from "@/lib/design-system/nav-config";
import { DashboardPageRetryButton } from "@/components/dashboard/dashboard-page-retry-button";
import { DashboardHomeSkeleton } from "@/components/dashboard/dashboard-home-skeleton";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorCard } from "@/components/ui/error-card";
import { Skeleton } from "@/components/ui/skeleton";

const ERROR_COPY: Record<
  DashboardPageLoadErrorKind,
  { title: string; description: string; terminalLine: string }
> = {
  dashboard: {
    terminalLine: "dashboard --load failed",
    title: "Не удалось загрузить кабинет",
    description:
      "Данные личного кабинета временно недоступны. Повторите попытку или вернитесь на главную страницу.",
  },
  progress: {
    terminalLine: "progress --sync failed",
    title: "Не удалось загрузить прогресс",
    description:
      "Статистика курса не синхронизировалась. Обновите страницу — если ошибка повторится, зайдите позже.",
  },
};

const EMPTY_ICONS: Record<DashboardEmptyKind, ReactNode> = {
  course_unavailable: <BookOpen className="size-5 opacity-70" aria-hidden />,
  not_started: <LayoutGrid className="size-5 opacity-70" aria-hidden />,
  no_progress: <TrendingUp className="size-5 opacity-70" aria-hidden />,
  no_recommendations: <Sparkles className="size-5 opacity-70" aria-hidden />,
  no_activity: <History className="size-5 opacity-70" aria-hidden />,
};

function StateFrame({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center px-4 py-10">{children}</div>
  );
}

function ErrorActions() {
  return (
    <div className="flex flex-wrap justify-center gap-3">
      <DashboardPageRetryButton />
      <Button asChild variant="outline" className="min-h-10">
        <Link href="/">Вернуться на главную</Link>
      </Button>
    </div>
  );
}

/** Скелетон кабинета: welcome, progress, карточки. */
export function DashboardLoadingState() {
  return <DashboardHomeSkeleton />;
}

export function DashboardPageLoadError({ kind }: { kind: DashboardPageLoadErrorKind }) {
  const copy = ERROR_COPY[kind];
  return (
    <StateFrame>
      <ErrorCard
        className="max-w-lg w-full"
        server
        title={copy.title}
        description={copy.description}
        action={<ErrorActions />}
      />
    </StateFrame>
  );
}

export function DashboardUnauthorizedState() {
  return (
    <StateFrame>
      <EmptyState
        terminalLine="auth --required"
        title="Войдите в учебный кабинет"
        description="Прогресс, рекомендации и AI-наставник доступны после входа в CyberEdu."
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

export function DashboardEmptyState({
  kind,
  action,
}: {
  kind: DashboardEmptyKind;
  action?: ReactNode;
}) {
  const copy = DASHBOARD_EMPTY_COPY[kind];
  const defaultAction =
    kind === "course_unavailable" ? (
      <Button asChild variant="outline" className="min-h-10">
        <Link href="/">На главную</Link>
      </Button>
    ) : (
      <Button asChild variant="primary" className="min-h-10">
        <Link href="/dashboard/course">Открыть карту курса</Link>
      </Button>
    );

  return (
    <StateFrame>
      <EmptyState
        compact={kind === "no_recommendations" || kind === "no_activity"}
        terminalLine={copy.terminalLine}
        title={copy.title}
        description={copy.description}
        icon={EMPTY_ICONS[kind]}
        action={action ?? defaultAction}
      />
    </StateFrame>
  );
}

/** Компактный empty для секции внутри сетки кабинета. */
export function DashboardSectionEmptyState({ kind }: { kind: DashboardEmptyKind }) {
  const copy = DASHBOARD_EMPTY_COPY[kind];
  return (
    <div
      className="rounded-xl border border-dashed border-border/70 bg-muted/10 px-4 py-5 text-center"
      role="status"
    >
      <p className="text-sm font-medium text-foreground">{copy.title}</p>
      <p className="mt-1 text-xs text-pretty text-muted-foreground">{copy.description}</p>
    </div>
  );
}

/** Баннер: курс доступен, обучение ещё не начато. */
export function DashboardNotStartedBanner() {
  const copy = DASHBOARD_EMPTY_COPY.not_started;
  return (
    <div
      className="rounded-2xl border border-primary/25 bg-primary/[0.06] px-4 py-4 sm:px-5"
      role="status"
    >
      <p className="font-display text-base font-semibold text-foreground">{copy.title}</p>
      <p className="mt-1 text-sm text-pretty text-muted-foreground">{copy.description}</p>
      <div className="mt-4">
        <Button asChild variant="primary" size="sm" className="min-h-10">
          <Link href="/dashboard/course">Открыть карту курса</Link>
        </Button>
      </div>
    </div>
  );
}

/** Фрагмент скелетона welcome (для Storybook / тестов layout). */
export function DashboardWelcomeSkeleton() {
  return (
    <div className="space-y-3 rounded-2xl border border-border/60 p-4 sm:p-5" aria-hidden>
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-8 w-3/4 max-w-md" />
      <Skeleton className="h-4 w-full max-w-lg" />
      <Skeleton className="h-4 w-2/3 max-w-sm" />
    </div>
  );
}

/** Фрагмент скелетона progress. */
export function DashboardProgressSkeleton() {
  return (
    <div className="space-y-4 rounded-2xl border border-border/60 p-4 sm:p-5" aria-hidden>
      <Skeleton className="h-3 w-28" />
      <div className="flex gap-4">
        <Skeleton className="size-24 shrink-0 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-2 w-full rounded-full" />
          <Skeleton className="h-3 w-40" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

/** Скелетон карточки боковой колонки. */
export function DashboardCardSkeleton({ tall = false }: { tall?: boolean }) {
  return <Skeleton className={tall ? "h-52 rounded-2xl" : "h-44 rounded-2xl"} aria-hidden />;
}
