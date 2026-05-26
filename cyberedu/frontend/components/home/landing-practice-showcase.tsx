"use client";

import { FileSearch, KeyRound, MailWarning, ScrollText, Link2 } from "lucide-react";
import { StaggerItem, StaggerReveal } from "@/components/effects/scroll-reveal";
import { LandingFeatureCard } from "@/components/home/landing-feature-card";
import { LandingSection } from "@/components/home/landing-section";

const labs = [
  {
    icon: MailWarning,
    title: "Разбор фишинга",
    description: "Письма, поддельные домены и типовые приёмы социальной инженерии — учитесь замечать подмену.",
    tag: "Кейс",
  },
  {
    icon: ScrollText,
    title: "Анализ логов",
    description: "Поиск аномалий и следов компрометации в учебных журналах событий.",
    tag: "Blue team",
  },
  {
    icon: KeyRound,
    title: "Криптография",
    description: "Базовые идеи шифрования и проверки целостности на безопасных задачах.",
    tag: "Crypto",
  },
  {
    icon: Link2,
    title: "Анализ URL",
    description: "Редиректы, подозрительные параметры и признаки опасных ресурсов.",
    tag: "Web",
  },
  {
    icon: FileSearch,
    title: "Учебная консоль",
    description: "Сценарии в браузере — без установки ПО и без риска для вашего компьютера.",
    tag: "Terminal",
  },
] as const;

export function LandingPracticeShowcase() {
  return (
    <LandingSection
      id="practice"
      eyebrow="Практические задания"
      title="Решайте задачи, как в реальной работе"
      description="Не только читать — разбирать инциденты, проверять гипотезы и сдавать работы с понятной обратной связью."
    >
      <StaggerReveal className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {labs.map((lab) => {
          const Icon = lab.icon;
          return (
            <StaggerItem key={lab.title}>
              <LandingFeatureCard
                icon={<Icon className="size-5" strokeWidth={1.75} aria-hidden />}
                title={lab.title}
                description={lab.description}
              >
                <span className="inline-flex rounded-lg border border-primary/20 bg-primary/8 px-2 py-0.5 text-2.5 font-semibold uppercase tracking-wide text-primary">
                  {lab.tag}
                </span>
              </LandingFeatureCard>
            </StaggerItem>
          );
        })}
      </StaggerReveal>
    </LandingSection>
  );
}
