"use client";

import { StaggerItem, StaggerReveal } from "@/components/effects/scroll-reveal";
import { LandingAiMentorChatPreview } from "@/components/home/landing-ai-mentor-chat-preview";
import { LandingFeatureCard } from "@/components/home/landing-feature-card";
import { LandingSection } from "@/components/home/landing-section";
import { Alert } from "@/components/ui/alert";
import {
  LANDING_MENTOR_INTRO,
  LANDING_MENTOR_MODES,
  LANDING_MENTOR_POLICY,
  LANDING_SECTION_IDS,
} from "@/lib/landing-content";

export function LandingAiMentor() {
  return (
    <LandingSection
      id={LANDING_SECTION_IDS.mentor}
      eyebrow="AI-наставник"
      title="Помощник по материалу курса"
      description={LANDING_MENTOR_INTRO}
      accent
      panel
      panelGlow
    >
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(300px,380px)] xl:items-start">
        <div className="space-y-6">
          <StaggerReveal className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
            {LANDING_MENTOR_MODES.map((m) => {
              const Icon = m.icon;
              return (
                <StaggerItem key={m.id}>
                  <LandingFeatureCard
                    icon={<Icon className="size-5" strokeWidth={1.75} aria-hidden />}
                    title={m.label}
                    description={m.description}
                  />
                </StaggerItem>
              );
            })}
          </StaggerReveal>

          <p className="rounded-xl border border-warning/25 bg-warning/8 px-4 py-3 text-sm font-medium leading-relaxed text-foreground">
            {LANDING_MENTOR_POLICY}
          </p>
        </div>

        <LandingAiMentorChatPreview className="xl:sticky xl:top-24" />
      </div>

      <Alert variant="info" className="mt-8" title="Модерация на сервере">
        Отказы и ограничения обрабатываются в tutor pipeline — без раскрытия служебных данных, ключей практик и
        ответов тестов.
      </Alert>
    </LandingSection>
  );
}
