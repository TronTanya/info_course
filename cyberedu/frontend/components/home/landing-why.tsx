"use client";

import { BarChart3, FlaskConical, Route, ShieldCheck, Sparkles, Trophy } from "lucide-react";
import { LandingFeatureCard } from "@/components/home/landing-feature-card";
import { LandingSection } from "@/components/home/landing-section";
import { StaggerItem, StaggerReveal } from "@/components/effects/scroll-reveal";

const benefits = [
  {
    icon: FlaskConical,
    title: "Практика вместо теории ради теории",
    description: "Лаборатории с реальными сценариями: фишинг, логи, URL, криптография — с автоматической или ручной проверкой.",
  },
  {
    icon: ShieldCheck,
    title: "Безопасность без паники",
    description: "Объясняем угрозы и защиту спокойным языком: что делать в почте, в сети и с учётными записями каждый день.",
  },
  {
    icon: Route,
    title: "Понятный прогресс",
    description: "Модули открываются по порядку: видно, что пройдено, что дальше и сколько осталось до сертификата.",
  },
  {
    icon: Trophy,
    title: "Сертификат с проверкой",
    description: "После курса — документ с номером и публичной проверкой подлинности для портфолио и работодателя.",
  },
  {
    icon: Sparkles,
    title: "AI-наставник в контексте",
    description: "Подсказки и адаптация примеров под ваши интересы — без готовых ответов на практические задания.",
  },
  {
    icon: BarChart3,
    title: "Метрики и обратная связь",
    description: "Тесты, баллы и статусы практики в личном кабинете — вы всегда понимаете, где вы в программе.",
  },
] as const;

export function LandingWhy() {
  return (
    <LandingSection
      id="why"
      eyebrow="Почему CyberEdu"
      title="Современная LMS по информационной безопасности"
      description="Не очередной PDF-курс, а платформа с траекторией, проверками и лабораториями — как в продуктовом обучении SOC-команд."
    >
      <StaggerReveal className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {benefits.map((b) => {
          const Icon = b.icon;
          return (
            <StaggerItem key={b.title}>
              <LandingFeatureCard
                icon={<Icon className="size-5" strokeWidth={1.75} aria-hidden />}
                title={b.title}
                description={b.description}
              />
            </StaggerItem>
          );
        })}
      </StaggerReveal>
    </LandingSection>
  );
}
