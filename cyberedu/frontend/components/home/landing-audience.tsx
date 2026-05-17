"use client";

import { GraduationCap, Laptop, School, Users } from "lucide-react";
import { StaggerItem, StaggerReveal } from "@/components/effects/scroll-reveal";
import { LandingFeatureCard } from "@/components/home/landing-feature-card";
import { LandingSection } from "@/components/home/landing-section";

const audiences = [
  {
    icon: GraduationCap,
    title: "Новички в ИБ",
    description: "С нуля — к понятным привычкам защиты: почта, пароли, устройства, социнженерия.",
  },
  {
    icon: School,
    title: "Студенты",
    description: "Структурированный курс с практикой и сертификатом для резюме и учебных проектов.",
  },
  {
    icon: Laptop,
    title: "Начинающие IT-специалисты",
    description: "База ИБ перед углублением в SOC, GRC или разработку — без перегруза на старте.",
  },
  {
    icon: Users,
    title: "Преподаватели и группы",
    description: "Готовая траектория, проверки и админка — удобно вести учебную группу на одной платформе.",
  },
] as const;

export function LandingAudience() {
  return (
    <LandingSection
      id="audience"
      eyebrow="Для кого курс"
      title="Кому подойдёт CyberEdu"
      description="Один поток обучения — разные цели: от личной гигиены в сети до подготовки команды."
    >
      <StaggerReveal className="grid gap-4 sm:grid-cols-2">
        {audiences.map((a) => {
          const Icon = a.icon;
          return (
            <StaggerItem key={a.title}>
              <LandingFeatureCard
                icon={<Icon className="size-5" strokeWidth={1.75} aria-hidden />}
                title={a.title}
                description={a.description}
              />
            </StaggerItem>
          );
        })}
      </StaggerReveal>
    </LandingSection>
  );
}
