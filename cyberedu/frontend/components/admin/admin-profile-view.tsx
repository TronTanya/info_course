"use client";

import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { ArrowUpRight, Download, GraduationCap, LayoutDashboard, LogOut, ShieldCheck } from "lucide-react";
import { logoutAction } from "@/lib/actions/logout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type AdminProfileViewProps = {
  email: string;
  displayName: string;
  initials: string;
  avatarUrl: string | null;
  subtitle: string | null;
  memberSinceLabel: string;
};

function ActionCard({
  href,
  external,
  icon: Icon,
  title,
  description,
  className,
  delayClass,
  accentClass,
}: {
  href: string;
  external?: boolean;
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
  delayClass: string;
  accentClass: string;
}) {
  const inner = (
    <>
      <span
        className={cn(
          "pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover/action:opacity-100",
          accentClass,
        )}
        aria-hidden
      />
      <span className="relative flex size-12 items-center justify-center rounded-2xl bg-linear-to-br from-primary/12 to-cyan/8 text-primary shadow-inner ring-1 ring-primary/12 transition-transform duration-300 group-hover/action:scale-105">
        <Icon className="size-5" aria-hidden />
      </span>
      <span className="relative mt-5 block pr-10">
        <span className="text-base font-semibold tracking-tight text-foreground">{title}</span>
        <span className="mt-1.5 block text-sm leading-relaxed text-muted-foreground">{description}</span>
      </span>
      <span
        className="absolute bottom-4 right-4 flex size-9 items-center justify-center rounded-full border border-border/70 bg-card/95 text-muted-foreground shadow-sm ring-1 ring-secondary/5 transition-all duration-300 group-hover/action:-translate-y-0.5 group-hover/action:translate-x-0.5 group-hover/action:border-primary/30 group-hover/action:text-primary"
        aria-hidden
      >
        <ArrowUpRight className="size-4" />
      </span>
    </>
  );

  const cardClass = cn(
    "group/action ce-admin-profile-action relative overflow-hidden rounded-2xl border border-border/70 bg-card/80 p-5 shadow-(--shadow-card) ring-1 ring-secondary/6 backdrop-blur-md",
    "ce-admin-profile-rise",
    delayClass,
    className,
  );

  if (external) {
    return (
      <a href={href} className={cn(cardClass, "block text-left outline-none focus-visible:ring-2 focus-visible:ring-ring")}>
        {inner}
      </a>
    );
  }

  return (
    <Link href={href} className={cn(cardClass, "block text-left outline-none focus-visible:ring-2 focus-visible:ring-ring")}>
      {inner}
    </Link>
  );
}

export function AdminProfileView({ email, displayName, initials, avatarUrl, subtitle, memberSinceLabel }: AdminProfileViewProps) {
  return (
    <div className="space-y-10">
      <nav
        className="ce-admin-profile-rise flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.8125rem] text-muted-foreground"
        aria-label="Навигация"
      >
        <Link href="/admin" className="font-medium text-foreground/90 transition-colors hover:text-primary">
          Админ
        </Link>
        <span className="text-border" aria-hidden>
          /
        </span>
        <span className="text-foreground/80">Профиль</span>
      </nav>

      <div className="ce-admin-profile-hero p-6 sm:p-8 lg:p-10">
        <div className="ce-admin-profile-blob ce-admin-profile-blob--a" aria-hidden />
        <div className="ce-admin-profile-blob ce-admin-profile-blob--b" aria-hidden />
        <div className="ce-admin-profile-blob ce-admin-profile-blob--c" aria-hidden />
        <div className="ce-admin-profile-hero-grid" aria-hidden />
        <div className="ce-admin-profile-hero-vignette" aria-hidden />
        <div className="ce-admin-profile-hero-topline" aria-hidden />
        <div className="ce-admin-profile-shimmer" aria-hidden />

        <div className="relative z-10 flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col items-center gap-8 sm:flex-row sm:items-start">
            <div className="ce-admin-profile-avatar relative shrink-0">
              <div className="ce-profile-avatar-ring">
                <div className="overflow-hidden rounded-[1.22rem] bg-linear-to-br from-muted/90 to-card ring-1 ring-border/50">
                  <div
                    className="relative flex size-28 items-center justify-center bg-linear-to-br from-primary/9 via-card to-cyan/8 text-2xl font-bold tracking-tight text-primary sm:size-35 sm:text-3xl"
                    aria-hidden={!!avatarUrl}
                  >
                    {avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element -- внешние URL аватаров
                      <img src={avatarUrl} alt={`Аватар: ${displayName}`} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      initials
                    )}
                  </div>
                </div>
              </div>
              <span
                className="pointer-events-none absolute -inset-3 -z-10 rounded-4xl bg-linear-to-br from-cyan/20 via-transparent to-primary/15 opacity-80 blur-2xl"
                aria-hidden
              />
            </div>

            <div className="min-w-0 flex-1 space-y-5 text-center sm:text-left">
              <div className="ce-admin-profile-rise space-y-3">
                <div className="flex flex-col items-center gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-start">
                  <Badge variant="success" className="gap-1.5 px-3 py-1 text-xs font-semibold shadow-sm ring-1 ring-success/15">
                    <ShieldCheck className="size-3.5" aria-hidden />
                    Администратор
                  </Badge>
                  <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/55 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur-sm">
                    <span className="ce-admin-profile-live-dot" aria-hidden />
                    Сессия активна
                  </span>
                  <span className="typo-caption tabular-nums text-muted-foreground sm:ml-1">{memberSinceLabel}</span>
                </div>
                <h1 className="text-balance text-3xl font-semibold tracking-tighter text-foreground sm:text-4xl lg:text-[2.35rem] lg:leading-[1.15]">
                  {displayName}
                </h1>
                <p className="inline-flex max-w-full items-center justify-center rounded-xl border border-border/60 bg-background/50 px-3 py-2 font-mono text-xs leading-snug text-muted-foreground shadow-inner backdrop-blur-sm sm:justify-start">
                  {email}
                </p>
                {subtitle ? (
                  <p className="mx-auto max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground sm:mx-0 lg:text-[0.9375rem]">
                    {subtitle}
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          <div className="ce-admin-profile-rise ce-admin-profile-rise--delay-2 flex w-full shrink-0 flex-col gap-3 sm:max-w-xs lg:w-72">
            <Button
              asChild
              variant="primary"
              className="h-12 w-full shadow-md transition-[transform,box-shadow] hover:scale-[1.02] hover:shadow-lg active:scale-[0.99]"
            >
              <Link href="/admin">Панель обзора</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-12 w-full border-primary/25 bg-card/80 backdrop-blur-sm hover:border-primary/40 hover:bg-card"
            >
              <Link href="/dashboard/profile">Личный кабинет</Link>
            </Button>
          </div>
        </div>
      </div>

      <section aria-labelledby="admin-quick-actions">
        <div className="ce-admin-profile-rise ce-admin-profile-rise--delay-3 mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="admin-quick-actions" className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              Быстрые действия
            </h2>
            <p className="mt-1 max-w-lg text-sm leading-relaxed text-muted-foreground">
              Ссылки на ключевые разделы: без лишних шагов, в фирменном стиле панели.
            </p>
          </div>
          <span className="inline-flex w-fit items-center rounded-full border border-border/70 bg-muted/40 px-3 py-1 text-xs font-medium tabular-nums text-muted-foreground">
            4 модуля
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ActionCard
            href="/admin"
            icon={LayoutDashboard}
            title="Обзор"
            description="Сводка по пользователям, курсу и модерации."
            delayClass="ce-admin-profile-rise--delay-3"
            accentClass="bg-linear-to-br from-primary/[0.07] via-transparent to-cyan/[0.05]"
          />
          <ActionCard
            href="/admin#admin-export"
            icon={Download}
            title="Выгрузка CSV"
            description="Студенты, прогресс, отправки и сертификаты — без секретов в файле."
            delayClass="ce-admin-profile-rise--delay-4"
            accentClass="bg-linear-to-br from-cyan/[0.08] via-transparent to-primary/[0.05]"
          />
          <ActionCard
            href="/dashboard/profile"
            icon={GraduationCap}
            title="Профиль в ЛК"
            description="Аватар, достижения и прогресс как у студента."
            delayClass="ce-admin-profile-rise--delay-4"
            accentClass="bg-linear-to-br from-secondary/[0.06] via-transparent to-cyan/[0.05]"
          />
          <form action={logoutAction} className="ce-admin-profile-rise ce-admin-profile-rise--delay-5">
            <button
              type="submit"
              className={cn(
                "group/action ce-admin-profile-action relative flex h-full min-h-34 w-full flex-col overflow-hidden rounded-2xl border border-danger/20 bg-linear-to-br from-card/95 to-danger/4 p-5 text-left shadow-(--shadow-card) ring-1 ring-danger/10 backdrop-blur-md",
                "outline-none focus-visible:ring-2 focus-visible:ring-ring",
              )}
            >
              <span
                className="pointer-events-none absolute inset-0 rounded-2xl bg-linear-to-br from-danger/[0.07] via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover/action:opacity-100"
                aria-hidden
              />
              <span className="relative flex size-12 items-center justify-center rounded-2xl bg-linear-to-br from-danger/15 to-danger/5 text-danger shadow-inner ring-1 ring-danger/15 transition-transform duration-300 group-hover/action:scale-105">
                <LogOut className="size-5" aria-hidden />
              </span>
              <span className="relative mt-5 block pr-10">
                <span className="text-base font-semibold tracking-tight text-foreground">Выйти</span>
                <span className="mt-1.5 block text-sm leading-relaxed text-muted-foreground">
                  Завершить сессию на этом устройстве.
                </span>
              </span>
              <span
                className="absolute bottom-4 right-4 flex size-9 items-center justify-center rounded-full border border-danger/25 bg-card/95 text-danger/90 shadow-sm transition-all duration-300 group-hover/action:-translate-y-0.5 group-hover/action:translate-x-0.5 group-hover/action:border-danger/40"
                aria-hidden
              >
                <ArrowUpRight className="size-4" />
              </span>
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
