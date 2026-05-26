"use client";

import { BookOpen, HelpCircle, Lightbulb, MessageSquare } from "lucide-react";
import { StaggerItem, StaggerReveal } from "@/components/effects/scroll-reveal";
import { LandingFeatureCard } from "@/components/home/landing-feature-card";
import { LandingSection } from "@/components/home/landing-section";
import { Alert } from "@/components/ui/alert";
import { LabTerminal } from "@/components/ui/lab-terminal";

const modes = [
  {
    icon: MessageSquare,
    title: "Объясни проще",
    description: "Сложный абзац — в короткую версию с аналогиями, когда термины мешают сфокусироваться.",
    prompt: "mentor explain --topic phishing --level simple",
  },
  {
    icon: BookOpen,
    title: "Дай пример",
    description: "Конкретный кейс из вашей отрасли: медицина, финтех, разработка — связь с темой нагляднее.",
    prompt: "mentor example --topic mfa --context healthcare",
  },
  {
    icon: HelpCircle,
    title: "Проверь понимание",
    description: "Вопросы по материалу без спойлеров ответов — вы сами формулируете выводы.",
    prompt: "mentor quiz --module 02 --questions 3",
  },
  {
    icon: Lightbulb,
    title: "Дай подсказку",
    description: "Направление на практике и в тестах — без готовых флагов и ключей к заданиям.",
    prompt: "mentor hint --lab phishing-01 --no-solution",
  },
] as const;

export function AiMentorPreview() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {modes.map((m) => {
        const Icon = m.icon;
        return (
          <LandingFeatureCard
            key={m.title}
            icon={<Icon className="size-5" strokeWidth={1.75} aria-hidden />}
            title={m.title}
            description={m.description}
          />
        );
      })}
    </div>
  );
}

export function LandingAiMentor() {
  return (
    <LandingSection
      id="ai-mentor"
      eyebrow="AI-наставник"
      title="Режимы, которые ускоряют обучение"
      description="Встроен в лекции и лаборатории: помогает понять материал, но не подменяет вашу работу на проверках."
      accent
    >
      <span id="ai" className="sr-only">
        AI-наставник
      </span>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)] lg:items-start">
        <StaggerReveal className="grid gap-4 sm:grid-cols-2">
          {modes.map((m) => {
            const Icon = m.icon;
            return (
              <StaggerItem key={m.title}>
                <LandingFeatureCard
                  icon={<Icon className="size-5" strokeWidth={1.75} aria-hidden />}
                  title={m.title}
                  description={m.description}
                />
              </StaggerItem>
            );
          })}
        </StaggerReveal>

        <LabTerminal title="mentor@cyberedu" className="lg:sticky lg:top-24">
          {modes.map((m, i) => (
            <p key={m.title} className={i > 0 ? "mt-2" : undefined}>
              <span className="ce-terminal-dim"># {m.title}</span>
              <br />
              <span className="ce-terminal-cmd">{m.prompt}</span>
            </p>
          ))}
          <p className="ce-terminal-dim mt-4">
            <span className="ce-terminal-success">policy</span> no_test_answers · no_flag_leaks
          </p>
        </LabTerminal>
      </div>

      <Alert variant="info" className="mt-8 max-w-3xl" title="Политика честного обучения">
        AI не принимает практические работы и не подсказывает ключи к тестам. Это защищает ценность вашего
        сертификата.
      </Alert>
    </LandingSection>
  );
}
