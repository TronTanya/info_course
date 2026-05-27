"use client";

import * as React from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  Award,
  BookOpen,
  Brain,
  ClipboardCheck,
  FileBadge,
  FlaskConical,
  Lock,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import dynamic from "next/dynamic";
import { MagneticButton } from "@/components/home/landing-hero/magnetic-button";

const LandingHeroVisual = dynamic(
  () =>
    import("@/components/home/landing-hero/landing-hero-visual").then((m) => ({
      default: m.LandingHeroVisual,
    })),
  {
    ssr: false,
    loading: () => (
      <div
        className="ce-hero-premium__stage min-h-[min(50vh,22rem)] rounded-3xl bg-muted/20"
        aria-hidden
      />
    ),
  },
);
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const capabilities = [
  { icon: BookOpen, label: "Теория" },
  { icon: FlaskConical, label: "SOC-лабы" },
  { icon: ClipboardCheck, label: "Тесты" },
  { icon: Brain, label: "AI-наставник" },
  { icon: FileBadge, label: "Сертификат" },
] as const;

const trustBadges = [
  { icon: ShieldCheck, label: "RBAC и изоляция" },
  { icon: Lock, label: "Безопасность по дизайну" },
  { icon: Award, label: "Сертификат PDF" },
] as const;

const reveal = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: i * 0.06 },
  }),
};

const revealReduced = {
  hidden: { opacity: 0, y: 12 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1], delay: i * 0.04 },
  }),
};

type LandingHeroCinematicProps = {
  startHref: string;
  programHref: string;
};

export function LandingHeroCinematic({ startHref, programHref }: LandingHeroCinematicProps) {
  const sectionRef = React.useRef<HTMLElement>(null);
  const [lit, setLit] = React.useState(false);
  const reduce = useReducedMotion();
  const motionVariants = reduce ? revealReduced : reveal;

  const handlePointerMove = React.useCallback((e: React.PointerEvent<HTMLElement>) => {
    if (reduce || e.pointerType === "touch") return;
    const el = sectionRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    el.style.setProperty("--hero-mx", `${x}%`);
    el.style.setProperty("--hero-my", `${y}%`);
    setLit(true);
  }, [reduce]);

  const handlePointerLeave = React.useCallback(() => {
    setLit(false);
  }, []);

  return (
    <section
      ref={sectionRef}
      className={cn("ce-hero-premium ce-hero-premium--bleed", lit && "ce-hero-premium--lit")}
      aria-labelledby="hero-heading"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={{ contentVisibility: "auto" } as React.CSSProperties}
    >
      <div className="ce-hero-premium__mesh" aria-hidden />
      <div className="ce-hero-premium__cursor-light" aria-hidden />
      <div className="ce-hero-premium__vignette" aria-hidden />

      <div className="ce-hero-premium__content container-page">
        <div className="grid items-center gap-14 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,1fr)] lg:gap-10 xl:gap-16">
          <div className="flex min-w-0 flex-col gap-8 lg:gap-10">
            <motion.div
              custom={0}
              variants={motionVariants}
              initial={reduce ? false : "hidden"}
              animate="show"
              className="flex flex-wrap items-center gap-3"
            >
              <span className="ce-hero-eyebrow-badge">
                <Sparkles className="size-3.5" aria-hidden />
                ОС кибербезопасности с AI
              </span>
              <span className="font-mono text-2.5 font-medium uppercase tracking-eyebrow text-muted-foreground">
                Академия · 2026
              </span>
            </motion.div>

            <div className="space-y-6">
              <motion.h1
                id="hero-heading"
                custom={1}
                variants={motionVariants}
                initial={reduce ? false : "hidden"}
                animate="show"
                className="ce-hero-premium__headline"
              >
                <span className="ce-hero-premium__headline-accent block">Защищай.</span>
                <span className="ce-hero-headline-solid block">Учись. Доминируй.</span>
              </motion.h1>

              <motion.p
                custom={2}
                variants={motionVariants}
                initial={reduce ? false : "hidden"}
                animate="show"
                className="max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground sm:text-xl"
              >
                Премиальная среда для кибербезопасности: SOC-лаборатории, AI-наставник и сертификация
                в одной операционной системе обучения — не очередной LMS.
              </motion.p>
            </div>

            <motion.ul
              custom={3}
              variants={motionVariants}
              initial={reduce ? false : "hidden"}
              animate="show"
              className="flex flex-wrap gap-2"
              aria-label="Возможности платформы"
            >
              {capabilities.map(({ icon: Icon, label }) => (
                <li key={label}>
                  <motion.span
                    className="ce-hero-capability-pill"
                    whileHover={reduce ? undefined : { scale: 1.03 }}
                  >
                    <Icon className="size-3.5 text-primary" strokeWidth={1.75} aria-hidden />
                    {label}
                  </motion.span>
                </li>
              ))}
            </motion.ul>

            <motion.div
              custom={4}
              variants={motionVariants}
              initial={reduce ? false : "hidden"}
              animate="show"
              className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center"
            >
              <MagneticButton>
                <Button
                  asChild
                  size="lg"
                  className="group relative min-h-12 overflow-hidden px-8"
                >
                  <Link href={startHref}>
                    <Zap className="size-4 transition-transform group-hover:scale-110" aria-hidden />
                    Запустить среду
                  </Link>
                </Button>
              </MagneticButton>
              <MagneticButton strength={0.18}>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="ce-hero-cta-secondary px-8"
                >
                  <Link href={programHref}>Смотреть трек</Link>
                </Button>
              </MagneticButton>
            </motion.div>

            <motion.ul
              custom={5}
              variants={motionVariants}
              initial={reduce ? false : "hidden"}
              animate="show"
              className="flex flex-wrap gap-2 pt-2"
              aria-label="Доверие и безопасность"
            >
              {trustBadges.map(({ icon: Icon, label }) => (
                <li key={label}>
                  <span className="ce-hero-trust-badge">
                    <Icon className="size-3.5 text-primary" strokeWidth={1.75} aria-hidden />
                    {label}
                  </span>
                </li>
              ))}
            </motion.ul>

            <motion.dl
              custom={6}
              variants={motionVariants}
              initial={reduce ? false : "hidden"}
              animate="show"
              className="flex flex-wrap gap-x-8 gap-y-3 border-t border-border/60 pt-6"
              aria-label="Ключевые показатели платформы"
            >
              {[
                { label: "Модулей", value: "12+" },
                { label: "SOC-лаб", value: "24+" },
                { label: "AI-наставник", value: "24/7" },
                { label: "Регистрация", value: "Бесплатно" },
              ].map((item) => (
                <div key={item.label}>
                  <dt className="text-xs text-muted-foreground">{item.label}</dt>
                  <dd className="font-heading text-lg font-semibold tracking-tight text-foreground">{item.value}</dd>
                </div>
              ))}
            </motion.dl>
          </div>

          <motion.div
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.1, delay: 0.15 }}
            className="relative min-w-0"
          >
            <LandingHeroVisual />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
