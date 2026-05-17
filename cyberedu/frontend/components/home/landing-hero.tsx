"use client";

import * as React from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { BrandLogoMark } from "@/components/brand/brand-logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motionPresets } from "@/lib/design-system/motion";
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
    <div className="ce-glass card-gradient rounded-2xl p-4 ring-1 ring-primary/10">
      <p className="mb-3 text-center font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan/90">
        Маршрут обучения
      </p>
      <div className="flex items-center justify-between gap-1 sm:gap-2">
        {steps.map((label, i) => (
          <React.Fragment key={label}>
            <div className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
              <motion.span
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.15 + i * 0.07, duration: 0.35 }}
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold tabular-nums shadow-sm",
                  i <= 2
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-border bg-muted/50 text-muted-foreground",
                )}
              >
                {i + 1}
              </motion.span>
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
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  glow?: "emerald" | "cyan" | "slate" | "gold";
  delay?: number;
}) {
  const reduce = useReducedMotion();
  const glowCls =
    glow === "cyan"
      ? "from-cyan/20 via-cyan/5 to-transparent"
      : glow === "slate"
        ? "from-secondary/25 via-secondary/5 to-transparent"
        : glow === "gold"
          ? "from-amber-400/15 via-amber-500/5 to-transparent"
          : "from-primary/22 via-primary/5 to-transparent";

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={reduce ? undefined : { y: -4, transition: { duration: 0.2 } }}
      className={cn(
        "group/v ce-card-glow card-gradient relative overflow-hidden rounded-2xl border border-border/70 bg-card/95 shadow-card backdrop-blur-sm",
        className,
      )}
    >
      <div className={cn("pointer-events-none absolute inset-0 bg-linear-to-br opacity-100", glowCls)} />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(145deg,rgba(255,255,255,0.55)_0%,transparent_50%)] opacity-50 dark:opacity-20" />
      <div className="relative flex h-full flex-col justify-center p-4 text-foreground">{children}</div>
    </motion.div>
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
  const reduce = useReducedMotion();

  return (
    <motion.section
      className="hero-glow ce-border-beam relative overflow-hidden rounded-3xl border border-border/70 bg-card/98 shadow-(--shadow-glow) ring-1 ring-primary/10 backdrop-blur-md"
      {...motionPresets.fadeIn}
    >
      <div className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full bg-cyan/18 blur-3xl ce-orb-a" />
      <div className="pointer-events-none absolute -bottom-28 -left-16 h-[22rem] w-[22rem] rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(108deg,transparent_35%,color-mix(in_oklab,var(--secondary)_5%,transparent)_100%)]" />
      <div className="ce-tech-grid pointer-events-none absolute inset-0 opacity-[0.12] dark:opacity-[0.2]" />

      <div className="relative grid min-w-0 gap-10 p-8 sm:p-10 lg:grid-cols-[minmax(0,1fr)_minmax(300px,440px)] lg:items-center lg:gap-14 lg:p-14">
        <motion.div
          className="flex min-w-0 max-w-xl flex-col gap-8"
          initial={reduce ? false : { opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="primary" className="shadow-sm">
              Информационная безопасность
            </Badge>
            <Badge variant="accent" className="shadow-sm">
              2026 · SOC-ready
            </Badge>
          </div>

          <div className="space-y-4">
            <h1 className="typo-h1 flex flex-wrap items-center gap-3 sm:gap-4 sm:text-5xl">
              <BrandLogoMark className="h-12 w-12 shrink-0 sm:h-14 sm:w-14" size={56} />
              <span className="ce-text-shimmer">CyberEdu</span>
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
        </motion.div>

        <div className="grid min-w-0 grid-cols-2 gap-3 sm:gap-3.5" aria-label="Обзор платформы">
          <div className="col-span-2">
            <LearningPathStrip />
          </div>

          <VisualShell className="col-span-2 row-span-2 min-h-[200px] sm:min-h-[220px]" glow="emerald" delay={0.12}>
            <motion.div
              className="flex h-full flex-col items-center justify-center gap-3 py-2"
              animate={reduce ? undefined : { y: [0, -6, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <IconShield className="size-[4.5rem] text-primary drop-shadow-sm sm:size-24" />
              <p className="text-center font-mono text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
                Shield · защита данных
              </p>
            </motion.div>
          </VisualShell>

          <VisualShell className="min-h-[104px]" glow="slate" delay={0.18}>
            <motion.div
              className="flex flex-col items-center justify-center gap-2 py-1"
              whileHover={reduce ? undefined : { rotate: [-2, 2, 0] }}
              transition={{ duration: 0.4 }}
            >
              <IconTerminal className="size-10 text-secondary" />
              <span className="font-mono text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Terminal</span>
            </motion.div>
          </VisualShell>

          <VisualShell className="min-h-[104px]" glow="cyan" delay={0.22}>
            <motion.div className="flex flex-col items-center justify-center gap-2 py-1">
              <IconAi className="size-10 text-cyan" />
              <span className="font-mono text-[10px] font-medium uppercase tracking-wider text-muted-foreground">AI mentor</span>
            </motion.div>
          </VisualShell>

          <VisualShell className="col-span-2 min-h-[108px]" glow="gold" delay={0.28}>
            <CertificatePreview />
          </VisualShell>
        </div>
      </div>
    </motion.section>
  );
}
