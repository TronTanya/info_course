"use client";

import { Brain, MessageCircle, ShieldAlert } from "lucide-react";
import { StaggerItem, StaggerReveal } from "@/components/effects/scroll-reveal";
import { LandingFeatureCard } from "@/components/home/landing-feature-card";
import { Alert } from "@/components/ui/alert";

const features = [
  {
    icon: MessageCircle,
    title: "Объясняет проще",
    body: "Сложный абзац — в короткую версию с аналогиями, когда термины мешают сфокусироваться.",
  },
  {
    icon: Brain,
    title: "Примеры под вас",
    body: "С учётом интересов из профиля: медицина, бизнес, разработка — связь с темой нагляднее.",
  },
  {
    icon: ShieldAlert,
    title: "Не решает за вас",
    body: "На практике и тестах — только подсказки и вопросы. Самостоятельное решение остаётся вашей работой.",
  },
] as const;

export function LandingAiFeatures() {
  return (
    <section
      id="ai"
      className="scroll-mt-24 hero-glow relative overflow-hidden rounded-3xl border border-primary/20 p-6 sm:p-10"
      aria-labelledby="ai-heading"
    >
      <div className="pointer-events-none absolute -right-20 top-0 h-56 w-56 rounded-full bg-accent/12 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -bottom-16 -left-12 h-48 w-48 rounded-full bg-primary/10 blur-3xl" aria-hidden />

      <div className="relative mx-auto max-w-3xl text-center">
        <p className="typo-eyebrow text-primary">AI-наставник</p>
        <h2 id="ai-heading" className="typo-h2 mt-2 text-balance">
          Помогает учиться, а не подменяет обучение
        </h2>
        <p className="typo-body-muted mx-auto mt-3 max-w-2xl text-pretty">
          Встроен в лекции: ускоряет понимание, но не выдаёт готовые ответы на задания и не обходит проверки.
        </p>
      </div>

      <StaggerReveal className="relative mt-10 grid gap-4 md:grid-cols-3">
        {features.map((f) => {
          const Icon = f.icon;
          return (
            <StaggerItem key={f.title}>
              <LandingFeatureCard icon={<Icon className="size-5" strokeWidth={1.75} aria-hidden />} title={f.title} description={f.body} />
            </StaggerItem>
          );
        })}
      </StaggerReveal>

      <Alert variant="info" className="relative mx-auto mt-8 max-w-2xl" title="Политика честного обучения">
        AI не принимает практические работы и не подсказывает ключи к тестам. Это защищает ценность вашего сертификата.
      </Alert>
    </section>
  );
}
