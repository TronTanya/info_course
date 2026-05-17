import { Award, ClipboardList, GraduationCap, PenLine, TestTube2, UserPlus } from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";

const steps = [
  { n: 1, title: "Зарегистрируйтесь", description: "Создайте аккаунт и подтвердите email — доступ к первому модулю откроется сразу.", icon: UserPlus },
  { n: 2, title: "Заполните интересы", description: "В профиле укажите сферу и увлечения — AI подстроит примеры под вас.", icon: PenLine },
  { n: 3, title: "Изучайте модули", description: "Лекции и материалы открываются по мере прогресса, шаг за шагом.", icon: GraduationCap },
  { n: 4, title: "Проходите тесты", description: "Закрепляйте блоки короткими проверками с обратной связью.", icon: ClipboardList },
  { n: 5, title: "Выполняйте практику", description: "Лаборатории с ручной или автоматической проверкой — как в реальной работе.", icon: TestTube2 },
  { n: 6, title: "Получите сертификат", description: "После завершения траектории — документ с номером и проверкой подлинности.", icon: Award },
];

export function LandingHowItWorks() {
  return (
    <section className="space-y-10" aria-labelledby="journey-heading">
      <SectionHeader
        className="mx-auto max-w-3xl flex-col items-center text-center"
        eyebrow="Процесс"
        title="Как проходит обучение"
        description="Понятный маршрут от регистрации до сертификата — без хаоса в материалах и сроках."
      />
      <h2 id="journey-heading" className="sr-only">
        Как проходит обучение
      </h2>

      <ol className="mx-auto grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {steps.map((s) => (
          <li
            key={s.n}
            className="ce-glass relative flex gap-4 rounded-2xl p-5 transition-[border-color,box-shadow] duration-200 hover:border-primary/25 hover:shadow-[var(--shadow-card-hover)]"
          >
            <div className="flex size-12 shrink-0 flex-col items-center justify-center rounded-xl border border-primary/25 bg-linear-to-br from-primary/12 to-accent/10 font-mono text-sm font-bold text-primary shadow-sm">
              {s.n}
            </div>
            <div className="min-w-0 pt-0.5">
              <div className="mb-2 flex items-center gap-2">
                <s.icon className="size-4 text-cyan" strokeWidth={1.75} aria-hidden />
                <h3 className="font-semibold text-foreground">{s.title}</h3>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">{s.description}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
