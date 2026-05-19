import {
  Binary,
  Globe,
  KeyRound,
  Network,
  Server,
  Shield,
  Terminal,
} from "lucide-react";
import { LandingFeatureCard } from "@/components/home/landing-feature-card";
import { LandingSection } from "@/components/home/landing-section";

const topics = [
  {
    icon: Shield,
    title: "Основы ИБ и модель угроз",
    description: "Конфиденциальность, целостность, доступность; роли атакующего и защитника.",
  },
  {
    icon: Network,
    title: "Сети и периметр",
    description: "TCP/IP, сегментация, firewall, типовые схемы корпоративной сети.",
  },
  {
    icon: Terminal,
    title: "Linux и командная строка",
    description: "Права, процессы, журналы — база для анализа инцидентов.",
  },
  {
    icon: Globe,
    title: "Web-безопасность",
    description: "OWASP Top 10, аутентификация, типовые уязвимости веб-приложений.",
  },
  {
    icon: KeyRound,
    title: "Криптография на практике",
    description: "Хеши, шифрование, сертификаты — без «магии», с учебными задачами.",
  },
  {
    icon: Server,
    title: "SOC и реагирование",
    description: "Разбор логов, эскалация, фиксация фактов для защиты, а не атак.",
  },
  {
    icon: Binary,
    title: "Финальный проект",
    description: "Сводный кейс: от симптома в журнале до выводов и рекомендаций.",
  },
] as const;

export function LandingWhatYouLearn() {
  return (
    <LandingSection
      id="what-you-learn"
      eyebrow="Программа"
      title="Что вы изучите"
      description="Практический курс по информационной безопасности: от базовых концепций до защиты веб-сервисов и работы аналитика SOC."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
    </LandingSection>
  );
}
