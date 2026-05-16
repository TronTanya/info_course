import { Users, Layers, FlaskConical, Award } from "lucide-react";
import { getLandingPublicStats } from "@/lib/landing-public-stats";
import { cn } from "@/lib/utils";

function formatStat(n: number): string {
  return n.toLocaleString("ru-RU");
}

const labels = [
  { key: "totalUsers" as const, label: "пользователей", icon: Users },
  { key: "activeModules" as const, label: "модулей", icon: Layers },
  { key: "practiceTasks" as const, label: "практик", icon: FlaskConical },
  { key: "certificatesIssued" as const, label: "сертификатов", icon: Award },
];

export async function LandingStats() {
  const s = await getLandingPublicStats();

  return (
    <section
      className="relative overflow-hidden rounded-3xl border border-border/90 bg-linear-to-br from-secondary/[0.07] via-card to-cyan/[0.06] px-6 py-12 shadow-card sm:px-10 sm:py-14"
      aria-labelledby="stats-heading"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,color-mix(in_oklab,var(--primary)_12%,transparent),transparent)]" />
      <div className="relative">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Цифры</p>
          <h2 id="stats-heading" className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Платформа в статистике
          </h2>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            Актуальные агрегаты по базе данных — обновляются при каждой загрузке страницы.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {labels.map(({ key, label, icon: Icon }) => (
            <div
              key={key}
              className={cn(
                "flex flex-col items-center rounded-2xl border border-border/60 bg-card/70 px-5 py-8 text-center shadow-sm backdrop-blur-sm transition-shadow hover:shadow-card",
                "ring-1 ring-inset ring-white/50",
              )}
            >
              <div className="mb-4 flex size-12 items-center justify-center rounded-xl border border-primary/15 bg-primary/8 text-primary">
                <Icon className="size-6" strokeWidth={1.5} aria-hidden />
              </div>
              <p className="font-mono text-4xl font-bold tabular-nums tracking-tight text-foreground sm:text-5xl">
                {formatStat(s[key])}
              </p>
              <p className="mt-2 text-sm font-medium text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
