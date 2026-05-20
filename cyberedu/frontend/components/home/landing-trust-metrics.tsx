import { Brain, FileBadge, FlaskConical, Layers, ShieldCheck } from "lucide-react";
import { LandingSection } from "@/components/home/landing-section";
import { MetricCard } from "@/components/ui/metric-card";

const metrics = [
  {
    icon: Layers,
    label: "Модули курса",
    value: "12+",
    hint: "Пошаговый трек от основ к SOC",
    variant: "default" as const,
  },
  {
    icon: FlaskConical,
    label: "Практические лаборатории",
    value: "24+",
    hint: "Сценарии в браузере, без установки ПО",
    variant: "cyan" as const,
  },
  {
    icon: Brain,
    label: "AI-наставник",
    value: "24/7",
    hint: "Подсказки без готовых ответов на тесты",
    variant: "accent" as const,
  },
  {
    icon: FileBadge,
    label: "Сертификат",
    value: "PDF + QR",
    hint: "Публичная проверка подлинности",
    variant: "default" as const,
  },
  {
    icon: ShieldCheck,
    label: "Защищённая платформа",
    value: "RBAC",
    hint: "Изоляция сред, rate limits, аудит",
    variant: "cyan" as const,
  },
] as const;

export function LandingTrustMetrics() {
  return (
    <LandingSection
      id="trust"
      eyebrow="Платформа"
      title="Всё для практики в одной академии"
      description="CyberEdu — не набор PDF-лекций, а учебная среда с лабораториями, проверками и прозрачным прогрессом."
      accent
    >
      <ul className="grid list-none gap-3 p-0 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <li key={m.label}>
              <MetricCard
                variant={m.variant}
                label={m.label}
                value={m.value}
                hint={m.hint}
                icon={<Icon className="size-5" strokeWidth={1.75} aria-hidden />}
                className="h-full"
              />
            </li>
          );
        })}
      </ul>
    </LandingSection>
  );
}
