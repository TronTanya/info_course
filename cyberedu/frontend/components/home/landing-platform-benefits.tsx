import { BarChart3, Bot, Lock, Route, ShieldCheck, Zap } from "lucide-react";
import { LandingFeatureCard } from "@/components/home/landing-feature-card";
import { LandingSection } from "@/components/home/landing-section";

const benefits = [
  {
    icon: Route,
    title: "Линейный маршрут",
    description: "Модули открываются по порядку — вы всегда знаете следующий шаг и не теряетесь в материале.",
  },
  {
    icon: Zap,
    title: "Мгновенная обратная связь",
    description: "Тесты и часть практик проверяются автоматически; результат виден сразу после отправки.",
  },
  {
    icon: Bot,
    title: "AI-наставник в лекциях",
    description: "Упрощает сложные абзацы и даёт примеры под ваш профиль — без готовых ответов на задания.",
  },
  {
    icon: ShieldCheck,
    title: "Учебная изоляция",
    description: "Сценарии и данные вымышленные: учимся защищать, а не атаковать реальные системы.",
  },
  {
    icon: BarChart3,
    title: "Прогресс в кабинете",
    description: "Процент по модулю, история отправок и достижения — вся траектория на одном экране.",
  },
  {
    icon: Lock,
    title: "Безопасность аккаунта",
    description: "Сессии, CSRF-защита API и rate limits — инфраструктура уровня production LMS.",
  },
] as const;

export function LandingPlatformBenefits() {
  return (
    <LandingSection
      id="platform"
      eyebrow="Платформа CyberEdu"
      title="Преимущества для студента"
      description="Премиальный LMS-опыт: тёмная cyber-тема, аккуратные карточки и фокус на практике — без перегруза эффектами."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {benefits.map((item) => {
          const Icon = item.icon;
          return (
            <LandingFeatureCard
              key={item.title}
              icon={<Icon className="size-5" strokeWidth={1.75} aria-hidden />}
              title={item.title}
              description={item.description}
            />
          );
        })}
      </div>
    </LandingSection>
  );
}
