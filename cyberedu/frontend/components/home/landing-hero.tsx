import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CyberHero } from "@/components/cyber/cyber-hero";
import { LandingHeroPreview } from "@/components/home/landing-hero-preview";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { authSafe } from "@/lib/auth";
import { LANDING_HERO_TRUST_NOTES, LANDING_SECTION_IDS } from "@/lib/landing-content";
import { cn } from "@/lib/utils";

export async function LandingHero() {
  const session = await authSafe();
  const isAuthenticated = Boolean(session?.user);
  const startHref = isAuthenticated ? "/dashboard/course" : "/auth/register";
  const programHref = `#${LANDING_SECTION_IDS.program}`;

  return (
    <CyberHero
      className="ce-landing-hero ce-landing-hero--stage ring-primary/12"
      labelledBy="hero-heading"
      padding="spacious"
    >
      <div className="ce-landing-hero-bg" aria-hidden>
        <span className="ce-landing-hero-bg__grid" />
        <span className="ce-landing-hero-bg__radial ce-landing-hero-bg__radial--primary" />
        <span className="ce-landing-hero-bg__radial ce-landing-hero-bg__radial--cyan" />
        <span className="ce-landing-hero-bg__glow" />
      </div>

      <div className="relative z-[1] grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(300px,1fr)] lg:items-center lg:gap-12 xl:gap-14">
        <div className="flex min-w-0 flex-col gap-6 sm:gap-7">
          <Badge
            variant="outline"
            className="w-fit max-w-full border-primary/25 bg-primary/8 px-3 py-1.5 text-xs font-medium text-foreground sm:text-sm"
          >
            Практический курс по информационной безопасности
          </Badge>

          <div className="space-y-4 sm:space-y-5">
            <h1
              id="hero-heading"
              className="typo-h1 max-w-2xl text-balance leading-[1.12] tracking-tight"
            >
              CyberEdu —{" "}
              <span className="ce-landing-gradient-text">научитесь защищаться</span> от цифровых угроз
            </h1>
            <p className="max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
              Проходите уроки, тесты и лаборатории, разбирайте реальные сценарии атак и получайте сертификат после
              завершения курса.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button asChild size="lg" className="w-full shadow-[var(--shadow-glow)] sm:min-w-[220px] sm:w-auto">
              <Link href={startHref}>
                Начать обучение
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="w-full border-primary/30 bg-card/50 sm:min-w-[220px] sm:w-auto"
            >
              <Link href={programHref}>Посмотреть программу</Link>
            </Button>
          </div>

          <ul className="flex flex-wrap gap-2 pt-1" aria-label="Преимущества платформы">
            {LANDING_HERO_TRUST_NOTES.map(({ icon: Icon, label }) => (
              <li key={label}>
                <span
                  className={cn(
                    "inline-flex min-h-9 items-center gap-1.5 rounded-full border border-border/80",
                    "bg-[color-mix(in_oklab,var(--card)_55%,transparent)] px-3 py-1.5 text-xs font-medium text-muted-foreground",
                    "backdrop-blur-sm",
                  )}
                >
                  <Icon className="size-3.5 shrink-0 text-primary" strokeWidth={1.75} aria-hidden />
                  {label}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative min-w-0 lg:max-w-none">
          <LandingHeroPreview />
        </div>
      </div>
    </CyberHero>
  );
}
