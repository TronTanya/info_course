"use client";

import { StaggerItem, StaggerReveal } from "@/components/effects/scroll-reveal";
import { LandingFeatureCard } from "@/components/home/landing-feature-card";
import { LandingSection } from "@/components/home/landing-section";
import { LANDING_AUDIENCES, LANDING_SECTION_IDS } from "@/lib/landing-content";

export function LandingForWhom() {
  return (
    <LandingSection
      id={LANDING_SECTION_IDS.audience}
      eyebrow="Для кого"
      title="Кому подойдёт CyberEdu"
      description="Один трек обучения — разные цели: от личной гигиены в сети до подготовки учебной группы."
      accent
    >
      <StaggerReveal className="grid gap-4 sm:grid-cols-2">
        {LANDING_AUDIENCES.map((a) => {
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
