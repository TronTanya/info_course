import Link from "next/link";
import { CyberHero } from "@/components/cyber/cyber-hero";
import { Button } from "@/components/ui/button";

export function LandingCta() {
  return (
    <CyberHero
      className="border-primary/25 bg-linear-to-br from-primary/14 via-card to-accent/12 text-center shadow-[var(--shadow-glow)] ring-primary/15"
      labelledBy="cta-heading"
      padding="spacious"
    >
      <div className="mx-auto max-w-2xl space-y-8">
        <div className="space-y-4">
          <p className="typo-eyebrow text-primary">Старт</p>
          <h2 id="cta-heading" className="typo-h2 text-balance sm:text-4xl">
            Готовы войти в практическую академию кибербезопасности?
          </h2>
          <p className="typo-body-muted text-pretty sm:text-lg">
            Регистрация бесплатна. Первый модуль открывается сразу — теория, SOC-практики, тесты и сертификат в
            одном кабинете.
          </p>
        </div>
        <div className="flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
          <Button asChild size="lg" className="w-full shadow-card sm:min-w-[220px] sm:w-auto">
            <Link href="/auth/register">Начать обучение</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="w-full border-primary/30 bg-card/90 sm:w-auto">
            <Link href="/#how-it-works">Посмотреть программу</Link>
          </Button>
        </div>
      </div>
    </CyberHero>
  );
}
