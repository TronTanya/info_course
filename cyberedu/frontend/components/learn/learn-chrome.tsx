"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { ScrollReveal } from "@/components/effects/scroll-reveal";
import { ProgressBar } from "@/components/ui/progress-bar";
import { motionPresets } from "@/lib/design-system/motion";
import { cn } from "@/lib/utils";

export function LearnAmbient() {
  return (
    <div className="ce-learn-ambient pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]" aria-hidden>
      <div className="ce-learn-grid absolute inset-0" />
      <div className="ce-learn-orb absolute -right-16 top-0 size-56 rounded-full blur-3xl" />
      <div className="ce-learn-orb ce-learn-orb-b absolute -left-12 bottom-8 size-40 rounded-full blur-3xl" />
    </div>
  );
}

export function LearnPageShell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("relative isolate space-y-8", className)}>
      <LearnAmbient />
      <div className="relative z-[1] space-y-8">{children}</div>
    </div>
  );
}

export function LearnSection({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <ScrollReveal delay={delay} className={className}>
      {children}
    </ScrollReveal>
  );
}

export function LearnPanel({
  children,
  className,
  beam = true,
}: {
  children: ReactNode;
  className?: string;
  beam?: boolean;
}) {
  return (
    <div
      className={cn(
        "ce-learn-panel rounded-2xl border border-border/70 bg-card/95 shadow-card backdrop-blur-sm",
        beam && "ce-border-beam",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function LearnPageHeader({
  backHref,
  backLabel = "← Назад",
  eyebrow,
  title,
  subtitle,
  moduleProgressPercent,
  moduleStepsLabel,
  className,
}: {
  backHref: string;
  backLabel?: string;
  eyebrow: string;
  title: string;
  subtitle?: string;
  moduleProgressPercent?: number;
  moduleStepsLabel?: string;
  className?: string;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.header
      className={cn(
        "ce-learn-header ce-border-beam flex flex-col gap-4 rounded-2xl border border-border/70 bg-card/90 p-4 shadow-card sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:p-5",
        className,
      )}
      initial={reduce ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start">
        <Link
          href={backHref}
          className="inline-flex h-9 shrink-0 items-center justify-center rounded-lg border border-border bg-card px-3 text-sm font-medium text-foreground transition hover:border-cyan/30 hover:bg-cyan/5"
        >
          {backLabel}
        </Link>
        <div className="min-w-0 space-y-1">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-cyan/90">{eyebrow}</p>
          <h1 className="text-balance text-xl font-semibold tracking-tight text-foreground sm:text-2xl">{title}</h1>
          {subtitle ? <p className="text-sm text-muted-foreground">{subtitle}</p> : null}
        </div>
      </div>
      {moduleProgressPercent !== undefined && moduleStepsLabel ? (
        <div className="w-full shrink-0 space-y-2 sm:max-w-[220px]">
          <div className="flex items-end justify-between gap-2">
            <p className="text-xs font-medium text-muted-foreground">Прогресс модуля</p>
            <span className="text-sm font-semibold tabular-nums text-foreground">{moduleProgressPercent}%</span>
          </div>
          <ProgressBar value={moduleProgressPercent} max={100} label={`Шаги: ${moduleStepsLabel}`} />
        </div>
      ) : null}
    </motion.header>
  );
}

export function LearnEnter({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div className={className} {...motionPresets.fadeIn}>
      {children}
    </motion.div>
  );
}
