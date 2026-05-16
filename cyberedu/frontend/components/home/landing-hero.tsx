import * as React from "react";
import Link from "next/link";
import { BrandLogoMark } from "@/components/brand/brand-logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function IconShield({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" strokeLinejoin="round" />
      <path d="m9 12 2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconTerminal({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="m7 9 2 2-2 2M11 13h4" strokeLinecap="round" />
    </svg>
  );
}

function IconAi({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M12 3a4 4 0 0 0-4 4v1H6a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h2v1a4 4 0 0 0 4 4" strokeLinecap="round" />
      <path d="M12 21a4 4 0 0 0 4-4v-1h2a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2h-2v-1a4 4 0 0 0-4-4" strokeLinecap="round" />
      <path d="M12 8v8M9 12h6" strokeLinecap="round" opacity="0.35" />
    </svg>
  );
}

function LearningPathStrip() {
  const steps = ["Введение", "Угрозы", "Защита", "Практика", "Итог"];
  return (
    <div className="rounded-2xl border border-border/80 bg-linear-to-r from-card via-muted/30 to-card p-4 shadow-sm ring-1 ring-inset ring-white/50">
      <p className="mb-3 text-center font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        Learning path
      </p>
      <div className="flex items-center justify-between gap-1 sm:gap-2">
        {steps.map((label, i) => (
          <React.Fragment key={label}>
            <div className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
              <span
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold tabular-nums shadow-sm",
                  i <= 2
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-border bg-muted/50 text-muted-foreground",
                )}
              >
                {i + 1}
              </span>
              <span className="hidden max-w-[4.5rem] truncate text-center text-[10px] font-medium text-muted-foreground sm:block">
                {label}
              </span>
            </div>
            {i < steps.length - 1 ? (
              <div
                className={cn("mx-0.5 h-0.5 min-w-[8px] flex-1 rounded-full sm:mx-1", i < 2 ? "bg-primary/40" : "bg-border")}
                aria-hidden
              />
            ) : null}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

function VisualShell({
  children,
  className,
  glow,
}: {
  children: React.ReactNode;
  className?: string;
  glow?: "emerald" | "cyan" | "slate" | "gold";
}) {
  const glowCls =
    glow === "cyan"
      ? "from-cyan/20 via-cyan/5 to-transparent"
      : glow === "slate"
        ? "from-secondary/25 via-secondary/5 to-transparent"
        : glow === "gold"
          ? "from-amber-400/15 via-amber-500/5 to-transparent"
          : "from-primary/22 via-primary/5 to-transparent";

  return (
    <div
      className={cn(
        "group/v relative overflow-hidden rounded-2xl border border-border/70 bg-card/95 shadow-card backdrop-blur-sm transition-all duration-300",
        "hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[var(--shadow-card-hover)]",
        className,
      )}
    >
      <div className={cn("pointer-events-none absolute inset-0 bg-linear-to-br opacity-100", glowCls)} />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(145deg,rgba(255,255,255,0.55)_0%,transparent_50%)] opacity-50" />
      <div className="relative flex h-full flex-col justify-center p-4 text-foreground">{children}</div>
    </div>
  );
}

function CertificatePreview() {
  return (
    <div className="flex h-full min-h-[5.5rem] flex-col justify-between">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-cyan">Certificate</p>
            <p className="mt-1 text-sm font-semibold text-foreground">CyberEdu</p>
            <p className="text-[11px] text-muted-foreground">Основы ИБ · PDF</p>
          </div>
          <BrandLogoMark className="size-10 shrink-0 opacity-95 sm:size-11" size={44} />
        </div>
      <div className="mt-2 flex items-center justify-between border-t border-border/60 pt-2">
        <span className="font-mono text-[10px] text-muted-foreground">№ CE-2026-****</span>
        <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">Подпись платформы</span>
      </div>
    </div>
  );
}

export function LandingHero() {
  return (
    <section className="ce-animate-in relative overflow-hidden rounded-3xl border border-border/70 bg-card/98 shadow-[var(--shadow-glow)] ring-1 ring-secondary/7 backdrop-blur-[2px] dark:ring-primary/10">
      <div className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full bg-cyan/18 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 -left-16 h-[22rem] w-[22rem] rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(108deg,transparent_35%,color-mix(in_oklab,var(--secondary)_5%,transparent)_100%)]" />

      <div className="relative grid min-w-0 gap-10 p-8 sm:p-10 lg:grid-cols-[minmax(0,1fr)_minmax(300px,440px)] lg:items-center lg:gap-14 lg:p-14">
        <div className="flex min-w-0 max-w-xl flex-col gap-8">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="primary" className="shadow-sm">
              Информационная безопасность
            </Badge>
            <Badge variant="cyan" className="shadow-sm">
              Онлайн · с практикой
            </Badge>
          </div>

          <div className="space-y-4">
            <h1 className="flex flex-wrap items-center gap-3 text-balance text-4xl font-bold tracking-tight text-foreground sm:gap-4 sm:text-5xl sm:leading-[1.08]">
              <BrandLogoMark className="h-12 w-12 shrink-0 sm:h-14 sm:w-14" size={56} />
              <span className="bg-linear-to-r from-foreground via-secondary to-foreground bg-clip-text text-transparent">CyberEdu</span>
            </h1>
            <p className="text-pretty text-lg font-medium leading-relaxed text-secondary sm:text-xl">
              Интерактивный курс по информационной безопасности с практикой, AI-наставником и сертификатом
            </p>
            <p className="max-w-lg text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
              Структурированная программа, проверяемые лаборатории и персональные пояснения — без воды и без перегруза
              терминологией.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <Button asChild size="lg" className="w-full shadow-card sm:min-w-[200px] sm:w-auto">
              <Link href="/auth/register">Начать обучение</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="w-full border-primary/25 bg-card/80 sm:w-auto">
              <Link href="/#program">Посмотреть программу</Link>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Регистрация бесплатна. Прогресс и материалы сохраняются в личном кабинете.
          </p>
        </div>

        <div className="grid min-w-0 grid-cols-2 gap-3 sm:gap-3.5" aria-label="Обзор платформы: траектория, защита, терминал, AI, сертификат">
          <div className="col-span-2">
            <LearningPathStrip />
          </div>

          <VisualShell className="col-span-2 row-span-2 min-h-[200px] sm:min-h-[220px]" glow="emerald">
            <div className="flex h-full flex-col items-center justify-center gap-3 py-2">
              <IconShield className="size-[4.5rem] text-primary drop-shadow-sm transition-transform duration-300 group-hover/v:scale-105 sm:size-24" />
              <p className="text-center font-mono text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
                Shield · защита данных
              </p>
            </div>
          </VisualShell>

          <VisualShell className="min-h-[104px]" glow="slate">
            <div className="flex flex-col items-center justify-center gap-2 py-1">
              <IconTerminal className="size-10 text-secondary transition-transform duration-300 group-hover/v:scale-105" />
              <span className="font-mono text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Terminal</span>
            </div>
          </VisualShell>

          <VisualShell className="min-h-[104px]" glow="cyan">
            <div className="flex flex-col items-center justify-center gap-2 py-1">
              <IconAi className="size-10 text-cyan transition-transform duration-300 group-hover/v:scale-105" />
              <span className="font-mono text-[10px] font-medium uppercase tracking-wider text-muted-foreground">AI assistant</span>
            </div>
          </VisualShell>

          <VisualShell className="col-span-2 min-h-[108px]" glow="gold">
            <CertificatePreview />
          </VisualShell>
        </div>
      </div>
    </section>
  );
}
