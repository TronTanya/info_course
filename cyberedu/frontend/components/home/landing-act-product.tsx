import type { ReactNode } from "react";
import Link from "next/link";
import { HowItWorksTimeline } from "@/components/home/landing-how-it-works";
import { PracticeLabPreview } from "@/components/home/landing-practice-lab";
import { LandingSection } from "@/components/home/landing-section";
import { TrustMetricsGrid } from "@/components/home/landing-trust-metrics";
import { WhatYouLearnGrid } from "@/components/home/landing-what-you-learn";
import { AiMentorPreview } from "@/components/home/landing-ai-mentor";
import { cn } from "@/lib/utils";

function ActBlock({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-5", className)}>
      <div className="max-w-2xl space-y-2">
        <h3 className="font-heading text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
          {title}
        </h3>
        {description ? <p className="text-sm text-pretty text-muted-foreground sm:text-base">{description}</p> : null}
      </div>
      {children}
    </div>
  );
}

/** Act 2 — product proof: metrics, program, flow, labs, AI */
export function LandingActProduct() {
  return (
    <LandingSection
      id="product"
      eyebrow="Платформа"
      title="Всё для практики кибербезопасности"
      description="Модули, SOC-лабы, тесты и AI-наставник в одном треке — без ощущения классического LMS."
      accent
    >
      <div className="space-y-16 sm:space-y-20">
        <ActBlock title="Что входит в среду">
          <TrustMetricsGrid />
        </ActBlock>

        <ActBlock
          title="Программа курса"
          description="Шесть опорных тем — от модели угроз до реагирования на инциденты."
        >
          <WhatYouLearnGrid />
        </ActBlock>

        <ActBlock
          title="Как проходит обучение"
          description="Теория → тест → практика → подсказка наставника → зачёт в прогрессе."
        >
          <HowItWorksTimeline />
        </ActBlock>

        <div className="grid gap-12 lg:grid-cols-2 lg:gap-10">
          <ActBlock
            title="Лаборатории в браузере"
            description="Изолированные сценарии без установки ПО."
          >
            <PracticeLabPreview />
          </ActBlock>
          <ActBlock
            title="AI-наставник"
            description="Помогает понять материал, не подменяет ваши ответы на проверках."
          >
            <AiMentorPreview />
          </ActBlock>
        </div>

        <p className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-center text-sm text-muted-foreground">
          <Link href="#start" className="font-medium text-primary underline-offset-4 hover:underline">
            Начать бесплатно
          </Link>
          <span className="hidden text-border sm:inline" aria-hidden>
            ·
          </span>
          <Link href="#faq" className="font-medium text-primary underline-offset-4 hover:underline">
            Частые вопросы
          </Link>
        </p>
      </div>
    </LandingSection>
  );
}
