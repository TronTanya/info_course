"use client";

import { Database, Lock, Server, Shield } from "lucide-react";
import { LandingSection } from "@/components/home/landing-section";
import { LandingFeatureCard } from "@/components/home/landing-feature-card";

const items = [
  {
    icon: Lock,
    title: "Безопасность по умолчанию",
    body: "CSRF-защита API, RBAC для админки, rate limit на вход и отправки, аудит критичных действий.",
  },
  {
    icon: Server,
    title: "Готово к выкладке",
    body: "Docker Compose, healthchecks, Redis для лимитов в production, миграции Prisma и операционные чеклисты.",
  },
  {
    icon: Database,
    title: "Данные под контролем",
    body: "PostgreSQL для прогресса и контента; загрузки на persistent volume (single-node) с документированным планом S3.",
  },
  {
    icon: Shield,
    title: "Честное обучение",
    body: "AI не выдаёт ответы тестов; сертификат с публичной проверкой кода подлинности.",
  },
] as const;

export function LandingProduction() {
  return (
    <LandingSection
      id="production"
      eyebrow="Production-aware"
      title="Инфраструктура и доверие"
      description="Платформа спроектирована для пилотного VPS: понятные env, smoke-тесты и документация go-live — без обещаний «магического SaaS»."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <LandingFeatureCard
              key={item.title}
              icon={<Icon className="size-5" strokeWidth={1.75} aria-hidden />}
              title={item.title}
              description={item.body}
            />
          );
        })}
      </div>
    </LandingSection>
  );
}
