"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  Award,
  BookOpen,
  ClipboardCheck,
  FlaskConical,
  Sparkles,
} from "lucide-react";
import { BrandLogoMark } from "@/components/brand/brand-logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { motionPresets } from "@/lib/design-system/motion";
import { cn } from "@/lib/utils";

const trustBadges = [
  { label: "Практика", icon: FlaskConical },
  { label: "Тесты", icon: ClipboardCheck },
  { label: "Сертификаты", icon: Award },
  { label: "AI-наставник", icon: Sparkles },
] as const;

const roadmapPreview = ["Регистрация", "Уроки", "Тесты", "Практика", "Сертификат"];

export function LandingHero() {
  const reduce = useReducedMotion();

  return (
    <motion.section
      className="hero-glow ce-border-beam relative overflow-hidden rounded-3xl border border-border/70 bg-card/95 shadow-(--shadow-glow) ring-1 ring-primary/15 backdrop-blur-md"
      {...motionPresets.fadeIn}
      aria-labelledby="hero-heading"
    >
      <div
        className="pointer-events-none absolute -right-24 -top-28 h-[28rem] w-[28rem] rounded-full bg-primary/20 blur-3xl ce-orb-a"
        aria-hidden
      />
      <motion.div
        className="pointer-events-none absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-accent/15 blur-3xl"
        aria-hidden
        animate={reduce ? undefined : { scale: [1, 1.06, 1], opacity: [0.5, 0.75, 0.5] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="ce-tech-grid pointer-events-none absolute inset-0 opacity-[0.14] dark:opacity-[0.22]" aria-hidden />
      <motion.div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_-10%,color-mix(in_oklab,var(--primary)_18%,transparent),transparent_65%)]"
        aria-hidden
        animate={reduce ? undefined : { opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative grid min-w-0 gap-10 p-6 sm:p-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(280px,420px)] lg:items-center lg:gap-12 lg:p-12 xl:p-14">
        <motion.div
          className="flex min-w-0 flex-col gap-7"
          initial={reduce ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="primary">Курс по ИБ</Badge>
            <Badge variant="accent">LMS · 2026</Badge>
          </div>

          <div className="space-y-4">
            <h1 id="hero-heading" className="typo-h1 flex flex-wrap items-center gap-3 text-balance sm:text-5xl">
              <BrandLogoMark className="size-12 shrink-0 sm:size-14" size={56} />
              <span className="ce-text-shimmer">Учитесь защищать данные — шаг за шагом</span>
            </h1>
            <p className="max-w-xl text-pretty text-lg font-medium leading-relaxed text-foreground sm:text-xl">
              CyberEdu — интерактивная платформа: модули, тесты, практические лаборатории и сертификат с проверкой
              подлинности.
            </p>
            <p className="max-w-lg text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
              Без хаоса в материалах и без «хакерского» шума: структура, прогресс и поддержка AI там, где вы учитесь.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button asChild size="lg" className="w-full shadow-card sm:min-w-[210px] sm:w-auto">
              <Link href="/auth/register">Начать обучение</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="w-full border-primary/30 bg-card/85 sm:w-auto">
              <Link href="/#program">Смотреть программу</Link>
            </Button>
          </div>

          <ul className="flex flex-wrap gap-2" aria-label="Возможности платформы">
            {trustBadges.map(({ label, icon: Icon }) => (
              <li key={label}>
                <span className="ce-glass inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-foreground ring-1 ring-primary/10">
                  <Icon className="size-4 text-primary" strokeWidth={1.75} aria-hidden />
                  {label}
                </span>
              </li>
            ))}
          </ul>

          <p className="text-xs text-muted-foreground sm:text-sm">Бесплатная регистрация · прогресс сохраняется в кабинете</p>
        </motion.div>

        <motion.div
          className="min-w-0 space-y-4"
          initial={reduce ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          aria-hidden={false}
        >
          <GlassCard glow className="p-5 sm:p-6">
            <p className="typo-eyebrow text-primary">Маршрут курса</p>
            <p className="mt-2 font-display text-lg font-semibold text-foreground">От регистрации до сертификата</p>
            <ol className="mt-5 space-y-3">
              {roadmapPreview.map((step, i) => (
                <li key={step} className="flex items-center gap-3">
                  <span
                    className={cn(
                      "flex size-8 shrink-0 items-center justify-center rounded-lg border text-xs font-bold tabular-nums",
                      i < 3
                        ? "border-primary/35 bg-primary/12 text-primary"
                        : "border-border bg-muted/50 text-muted-foreground",
                    )}
                  >
                    {i + 1}
                  </span>
                  <span className="text-sm font-medium text-foreground">{step}</span>
                  {i < roadmapPreview.length - 1 ? (
                    <span className="ml-auto hidden h-px flex-1 max-w-8 bg-border sm:block" aria-hidden />
                  ) : null}
                </li>
              ))}
            </ol>
          </GlassCard>

          <motion.div className="grid grid-cols-2 gap-3" variants={reduce ? undefined : undefined}>
            <GlassCard className="flex flex-col items-center justify-center gap-2 p-4 text-center">
              <BookOpen className="size-8 text-primary" strokeWidth={1.5} aria-hidden />
              <span className="text-xs font-medium text-muted-foreground">Модули и лекции</span>
            </GlassCard>
            <GlassCard className="flex flex-col items-center justify-center gap-2 p-4 text-center">
              <FlaskConical className="size-8 text-accent" strokeWidth={1.5} aria-hidden />
              <span className="text-xs font-medium text-muted-foreground">Лаборатории</span>
            </GlassCard>
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
}
