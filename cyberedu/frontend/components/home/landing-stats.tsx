import { ScrollReveal } from "@/components/effects/scroll-reveal";
import { LandingStatsGrid } from "@/components/home/landing-stats-grid";
import { getLandingPublicStats } from "@/lib/landing-public-stats";

export async function LandingStats() {
  const s = await getLandingPublicStats();

  return (
    <ScrollReveal>
      <section
        className="relative overflow-hidden rounded-3xl border border-border/90 bg-linear-to-br from-secondary/[0.07] via-card to-cyan/[0.06] px-6 py-12 shadow-card sm:px-10 sm:py-14"
        aria-labelledby="stats-heading"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,color-mix(in_oklab,var(--primary)_12%,transparent),transparent)]" />
        <div className="relative">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <p className="font-mono text-xs font-semibold uppercase tracking-widest text-cyan">Live metrics</p>
            <h2 id="stats-heading" className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Платформа в статистике
            </h2>
            <p className="mt-2 text-sm text-muted-foreground sm:text-base">
              Актуальные агрегаты по базе данных — обновляются при каждой загрузке страницы.
            </p>
          </div>
          <LandingStatsGrid stats={s} />
        </div>
      </section>
    </ScrollReveal>
  );
}
