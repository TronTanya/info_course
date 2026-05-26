import { FileSearch, Globe, KeyRound, MailWarning, Shield, Siren } from "lucide-react";
import { LandingFeatureCard } from "@/components/home/landing-feature-card";
import { LandingSection } from "@/components/home/landing-section";

const topics = [
  {
    icon: Shield,
    title: "Основы ИБ",
    description: "CIA, модель угроз, роли атакующего и защитника — фундамент для SOC и Blue Team.",
  },
  {
    icon: MailWarning,
    title: "Фишинг",
    description: "Признаки писем и ссылок, разбор заголовков, учебные кейсы социальной инженерии.",
  },
  {
    icon: KeyRound,
    title: "Пароли и MFA",
    description: "Политики, менеджеры паролей, MFA и типовые ошибки аутентификации.",
  },
  {
    icon: Globe,
    title: "Угрозы веб-приложений",
    description: "OWASP, XSS/CSRF, сессии и контроли на периметре веб-приложений.",
  },
  {
    icon: FileSearch,
    title: "Анализ логов",
    description: "Журналы, корреляция событий, поиск аномалий в учебных потоках данных.",
  },
  {
    icon: Siren,
    title: "Реагирование на инциденты",
    description: "Триаж, эскалация, фиксация фактов и рекомендации для защиты, не для атак.",
  },
] as const;

export function WhatYouLearnGrid() {
  return (
    <>
      <span id="modules" className="sr-only">
        Программа курса
      </span>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {topics.map((topic) => {
          const Icon = topic.icon;
          return (
            <LandingFeatureCard
              key={topic.title}
              icon={<Icon className="size-5" strokeWidth={1.75} aria-hidden />}
              title={topic.title}
              description={topic.description}
            />
          );
        })}
      </div>
    </>
  );
}

export function LandingWhatYouLearn() {
  return (
    <LandingSection
      id="what-you-learn"
      eyebrow="Программа"
      title="Что вы изучите"
      description="Шесть опорных тем — от базовой модели угроз до реагирования на инциденты. Каждая тема закрепляется тестом и практикой."
      accent
    >
      <WhatYouLearnGrid />
    </LandingSection>
  );
}
