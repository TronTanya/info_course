import { Brain, FileBadge, FlaskConical, GraduationCap, Layers, ShieldCheck, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { LandingSection } from "@/components/home/landing-section";
import { MetricCard } from "@/components/ui/metric-card";
import { resolveLandingMetrics } from "@/lib/landing-marketing";
import { getLandingPublicStats } from "@/lib/landing-public-stats";

const ICONS: Record<string, LucideIcon> = {
  modules: Layers,
  labs: FlaskConical,
  mentor: Brain,
  cert: FileBadge,
  security: ShieldCheck,
  certs: FileBadge,
  students: Users,
};

export async function LandingTrustMetrics() {
  const stats = await getLandingPublicStats();
  const { items, live } = resolveLandingMetrics(stats);

  return (
    <LandingSection
      id="trust"
      eyebrow="Платформа"
      title="Всё для практики ИБ — в одной академии"
      description={
        live
          ? "Актуальные показатели платформы. Курс, лаборатории, AI-наставник и сертификат — без разрозненных инструментов."
          : "Курс, лаборатории, AI-наставник, сертификат и защищённая среда — единый учебный контур."
      }
      accent
      panel
      panelGlow
    >
      {live ? (
        <p className="mb-4 flex items-center justify-center gap-2 text-center text-xs text-muted-foreground">
          <GraduationCap className="size-3.5 text-primary" aria-hidden />
          Показатели обновляются при загрузке страницы · без персональных данных
        </p>
      ) : null}
      <ul className="grid list-none gap-3 p-0 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {items.map((m) => {
          const Icon = ICONS[m.key] ?? Layers;
          return (
            <li key={m.key}>
              <MetricCard
                variant={m.variant}
                label={m.label}
                value={m.value}
                hint={m.hint}
                icon={<Icon className="size-5" strokeWidth={1.75} aria-hidden />}
                className="h-full transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 motion-reduce:hover:translate-y-0"
              />
            </li>
          );
        })}
      </ul>
    </LandingSection>
  );
}
