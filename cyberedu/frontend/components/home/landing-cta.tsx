import Link from "next/link";
import { Button } from "@/components/ui/button";

export function LandingCta() {
  return (
    <section
      className="hero-glow relative overflow-hidden rounded-3xl border border-primary/25 bg-linear-to-br from-primary/14 via-card to-accent/12 px-8 py-16 text-center shadow-[var(--shadow-glow)] ring-1 ring-primary/15 backdrop-blur-sm sm:px-12 sm:py-20"
      aria-labelledby="cta-heading"
    >
      <div className="pointer-events-none absolute -left-24 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-primary/15 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -right-20 -top-16 h-64 w-64 rounded-full bg-accent/12 blur-3xl" aria-hidden />

      <div className="relative mx-auto max-w-2xl space-y-8">
        <div className="space-y-4">
          <p className="typo-eyebrow text-primary">Старт</p>
          <h2 id="cta-heading" className="typo-h2 text-balance sm:text-4xl">
            Начните обучение сегодня
          </h2>
          <p className="typo-body-muted text-pretty sm:text-lg">
            Первый модуль доступен сразу после регистрации. Заполните профиль — и AI начнёт подстраивать примеры под
            ваш контекст.
          </p>
        </div>
        <div className="flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
          <Button asChild size="lg" className="w-full shadow-card sm:min-w-[220px] sm:w-auto">
            <Link href="/auth/register">Создать аккаунт</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="w-full border-primary/30 bg-card/90 sm:w-auto">
            <Link href="/auth/login">Уже есть аккаунт</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
