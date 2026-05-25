import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CyberHero } from "@/components/cyber/cyber-hero";
import { Button } from "@/components/ui/button";
import { authSafe } from "@/lib/auth";

export async function LandingCta() {
  const session = await authSafe();
  const isAuthenticated = Boolean(session?.user);
  const startHref = isAuthenticated ? "/dashboard/course" : "/auth/register";

  return (
    <CyberHero
      className="ce-landing-cta bg-linear-to-br from-primary/12 via-card/88 to-cyan/8 text-center ring-primary/15"
      labelledBy="cta-heading"
      padding="spacious"
    >
      <div className="mx-auto max-w-2xl space-y-8">
        <div className="space-y-4">
          <p className="typo-eyebrow text-primary">Старт бесплатно</p>
          <h2 id="cta-heading" className="typo-h2 text-balance sm:text-4xl">
            Начните обучение информационной безопасности уже сегодня
          </h2>
          <p className="typo-body-muted text-pretty sm:text-lg">
            Регистрация открывает первый модуль: лекции, тесты, лаборатории и AI-наставник в личном кабинете.
          </p>
        </div>
        <div className="flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
          <Button asChild size="lg" className="w-full shadow-[var(--shadow-glow)] sm:min-w-[240px] sm:w-auto">
            <Link href={startHref}>
              Начать курс
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="w-full border-primary/35 bg-card/80 sm:min-w-[220px] sm:w-auto"
          >
            <Link href="/#modules">Посмотреть программу</Link>
          </Button>
        </div>
      </div>
    </CyberHero>
  );
}
