import { LandingSection } from "@/components/home/landing-section";
import { LANDING_HOW_IT_WORKS } from "@/lib/landing-content";
import { cn } from "@/lib/utils";

export function LandingHowItWorks() {
  return (
    <LandingSection
      id="how-it-works"
      eyebrow="Процесс обучения"
      title="Как проходит обучение"
      description="Пять шагов в каждом модуле — от теории до зачёта и сертификата. На мобильных шаги идут сверху вниз."
      accent
    >
      <div className="ce-landing-how-timeline relative mx-auto max-w-6xl">
        <div
          className="pointer-events-none absolute left-[10%] right-[10%] top-[2.75rem] hidden h-px bg-linear-to-r from-transparent via-primary/35 to-transparent lg:block"
          aria-hidden
        />

        <ol className="grid list-none gap-4 p-0 md:gap-5 lg:grid-cols-5 lg:gap-4">
          {LANDING_HOW_IT_WORKS.map((step, index) => {
            const Icon = step.icon;
            const isLast = index === LANDING_HOW_IT_WORKS.length - 1;

            return (
              <li
                key={step.n}
                className={cn(
                  "ce-landing-how-step relative flex min-w-0 gap-4 lg:flex-col lg:gap-0",
                  !isLast && "max-lg:pb-1",
                )}
              >
                {/* Mobile / tablet: vertical timeline rail */}
                <div className="flex flex-col items-center lg:hidden">
                  <span
                    className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 font-mono text-sm font-bold tabular-nums text-primary shadow-sm"
                    aria-label={`Шаг ${step.n}`}
                  >
                    {step.n}
                  </span>
                  {!isLast ? (
                    <div className="mt-2 w-px flex-1 min-h-[2.5rem] rounded-full bg-linear-to-b from-primary/40 to-border/50" />
                  ) : null}
                </div>

                <article
                  className={cn(
                    "ce-landing-glass-tile ce-landing-how-card ce-card-glow flex min-w-0 flex-1 flex-col rounded-2xl p-5 sm:p-6",
                    "transition-[transform,box-shadow,border-color] duration-200",
                    "hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-hover)] motion-reduce:hover:translate-y-0",
                    "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background",
                    "lg:h-full",
                  )}
                >
                  {/* Desktop: номер над карточкой на timeline */}
                  <div className="mb-4 hidden lg:flex lg:flex-col lg:items-center lg:gap-3">
                    <span
                      className={cn(
                        "relative z-[1] flex size-11 items-center justify-center rounded-full border-2 border-primary/35",
                        "bg-card font-mono text-sm font-bold text-primary shadow-[0_0_24px_-8px_color-mix(in_oklab,var(--primary)_45%,transparent)]",
                      )}
                      aria-hidden
                    >
                      {step.n}
                    </span>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary ring-1 ring-primary/10">
                      <Icon className="size-5" strokeWidth={1.75} aria-hidden />
                    </span>
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-primary lg:hidden">
                          Шаг {String(step.n).padStart(2, "0")}
                        </span>
                        <h3 className="font-display text-base font-semibold leading-snug text-foreground sm:text-lg">
                          {step.title}
                        </h3>
                      </div>
                      <p className="text-sm leading-relaxed text-pretty text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                </article>
              </li>
            );
          })}
        </ol>
      </div>
    </LandingSection>
  );
}
