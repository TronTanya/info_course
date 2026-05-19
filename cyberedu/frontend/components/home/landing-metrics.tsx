import { Award, BookOpen, FlaskConical, Layers, Shield } from "lucide-react";
import { LandingSection } from "@/components/home/landing-section";
import { cn } from "@/lib/utils";

const metrics = [
  {
    value: "12",
    label: "модулей",
    hint: "Пошаговая программа",
    icon: Layers,
  },
  {
    value: "40+",
    label: "практик",
    hint: "Лабораторные сценарии",
    icon: FlaskConical,
  },
  {
    value: "OWASP",
    sub: "Top 10",
    label: "в программе Web",
    hint: "Актуальные угрозы",
    icon: Shield,
  },
  {
    value: "Final",
    sub: "Project",
    label: "финальный проект",
    hint: "Итоговая защита",
    icon: BookOpen,
  },
  {
    value: "PDF",
    label: "сертификат",
    hint: "С проверкой подлинности",
    icon: Award,
  },
] as const;

export function LandingMetrics() {
  return (
    <LandingSection
      id="metrics"
      eyebrow="Платформа"
      title="Всё для полного цикла обучения"
      description="От базовых концепций до финального проекта и официального сертификата."
      headerClassName="max-w-2xl"
    >
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {metrics.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.label}>
              <article
                className={cn(
                  "group flex h-full flex-col rounded-2xl border border-border bg-card/80 p-5 shadow-card",
                  "transition-[border-color,box-shadow,transform] duration-200",
                  "hover:border-primary/30 hover:shadow-[var(--shadow-glow)] hover:-translate-y-0.5 motion-reduce:hover:translate-y-0",
                )}
              >
                <div className="mb-4 flex size-10 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                  <Icon className="size-5" strokeWidth={1.75} aria-hidden />
                </div>
                <p className="font-display text-2xl font-bold leading-none tracking-tight text-foreground">
                  {item.value}
                  {"sub" in item && item.sub ? (
                    <span className="mt-0.5 block text-sm font-semibold text-primary">{item.sub}</span>
                  ) : null}
                </p>
                <p className="mt-1 text-sm font-medium text-foreground">{item.label}</p>
                <p className="mt-2 text-xs text-subtle-foreground">{item.hint}</p>
              </article>
            </li>
          );
        })}
      </ul>
    </LandingSection>
  );
}
