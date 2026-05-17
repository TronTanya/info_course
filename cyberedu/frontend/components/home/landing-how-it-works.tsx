import { Award, ClipboardList, FlaskConical, GraduationCap, UserPlus } from "lucide-react";
import { LandingSection } from "@/components/home/landing-section";
import { cn } from "@/lib/utils";

const steps = [
  {
    n: 1,
    title: "Регистрация",
    description: "Создайте аккаунт — первый модуль откроется сразу. Укажите интересы для персонализации примеров.",
    icon: UserPlus,
  },
  {
    n: 2,
    title: "Уроки",
    description: "Лекции и материалы по модулям: теория человеческим языком, без перегруза терминами.",
    icon: GraduationCap,
  },
  {
    n: 3,
    title: "Тесты",
    description: "Короткие проверки после блоков — закрепляете знания и видите результат сразу.",
    icon: ClipboardList,
  },
  {
    n: 4,
    title: "Практика",
    description: "Лаборатории с реальными кейсами: часть проверяется автоматически, часть — преподавателем.",
    icon: FlaskConical,
  },
  {
    n: 5,
    title: "Сертификат",
    description: "После всех модулей — PDF с номером, QR и публичной проверкой подлинности.",
    icon: Award,
  },
] as const;

const staggerClass = ["ce-stagger-1", "ce-stagger-2", "ce-stagger-3", "ce-stagger-4", "ce-stagger-5"] as const;

export function LandingHowItWorks() {
  return (
    <LandingSection
      id="program"
      eyebrow="Как проходит обучение"
      title="Понятный путь от старта до диплома"
      description="Пять шагов — без хаоса в сроках и материалах. Каждый следующий модуль открывается после предыдущего."
    >
      <div className="relative mx-auto max-w-5xl">
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
                  "ce-animate-in ce-glass ce-card-glow flex h-full flex-col gap-3 rounded-2xl p-5",
                  "transition-[transform,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-[var(--shadow-card-hover)] motion-reduce:hover:translate-y-0",
                  staggerClass[index],
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-primary/30 bg-linear-to-br from-primary/15 to-accent/10 font-mono text-sm font-bold text-primary shadow-sm">
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
    </LandingSection>
  );
}
