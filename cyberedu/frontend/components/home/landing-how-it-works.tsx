import { Award, BookOpen, Brain, ClipboardList, FlaskConical } from "lucide-react";
import { LandingSection } from "@/components/home/landing-section";
import { cn } from "@/lib/utils";

const steps = [
  {
    n: 1,
    title: "Урок",
    description: "Структурированная теория с чек-листами, терминами и примерами из реальных SOC-процессов.",
    icon: BookOpen,
  },
  {
    n: 2,
    title: "Тест",
    description: "Короткая проверка после блока — сразу видите пробелы и что повторить перед практикой.",
    icon: ClipboardList,
  },
  {
    n: 3,
    title: "Практика",
    description: "Лаборатория в браузере: разбор кейса, отправка ответа, автопроверка или ревью преподавателя.",
    icon: FlaskConical,
  },
  {
    n: 4,
    title: "AI-подсказка",
    description: "Наставник объясняет сложное, даёт примеры и вопросы — без готовых ответов на задания.",
    icon: Brain,
  },
  {
    n: 5,
    title: "Сертификат",
    description: "После всех модулей — PDF с номером, QR и публичной проверкой подлинности.",
    icon: Award,
  },
] as const;

const staggerClass = ["ce-stagger-1", "ce-stagger-2", "ce-stagger-3", "ce-stagger-4", "ce-stagger-5"] as const;

export function HowItWorksTimeline() {
  return (
    <div id="how-it-works" className="relative mx-auto max-w-5xl scroll-mt-28">
        <div
          className="pointer-events-none absolute left-[8%] right-[8%] top-8 hidden h-px bg-linear-to-r from-transparent via-primary/40 to-transparent lg:block"
          aria-hidden
        />
        <ol className="grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-5 lg:gap-3">
          {steps.map((s, index) => {
            const Icon = s.icon;
            return (
              <li
                key={s.n}
                className={cn(
                  "ce-animate-in ds-card flex h-full flex-col gap-3 rounded-2xl p-5",
                  staggerClass[index],
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="ce-polish-step-icon size-11 shrink-0 font-mono text-sm font-bold text-primary">
                    {s.n}
                  </span>
                  <Icon className="size-5 text-primary" strokeWidth={1.75} aria-hidden />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-foreground">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.description}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
  );
}

export function LandingHowItWorks() {
  return (
    <LandingSection
      id="how-it-works"
      eyebrow="Как проходит обучение"
      title="Один трек — от урока до сертификата"
      description="Каждый модуль выстраивается по циклу: теория, проверка, практика, поддержка наставника и зачёт в прогрессе."
      accent
    >
      <HowItWorksTimeline />
    </LandingSection>
  );
}
