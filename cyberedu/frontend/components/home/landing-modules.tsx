import Link from "next/link";
import { ArrowRight, Clock, Target } from "lucide-react";
import { LandingSection } from "@/components/home/landing-section";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/ui/section-card";
import { authSafe } from "@/lib/auth";
import { LANDING_PROGRAM_MODULES, LANDING_SECTION_IDS } from "@/lib/landing-content";
import { cn } from "@/lib/utils";

export async function LandingModules() {
  const session = await authSafe();
  const programHref = session?.user ? "/dashboard/course" : "/auth/register";

  return (
    <LandingSection
      id={LANDING_SECTION_IDS.program}
      eyebrow="Программа"
      title="Программа курса"
      description="Пять модулей — от основ ИБ до разбора инцидентов. Каждый блок: урок, тест и практика в учебной среде."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {LANDING_PROGRAM_MODULES.map((mod) => (
          <SectionCard
            key={mod.orderNumber}
            variant="default"
            flushTitle
            className={cn(
              "ce-landing-glass-tile ce-card-glow group flex h-full flex-col",
              "hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-[var(--shadow-card-hover)]",
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 font-mono text-sm font-bold text-primary">
                {String(mod.orderNumber).padStart(2, "0")}
              </span>
              <span className="inline-flex items-center gap-1 rounded-lg border border-border/80 bg-muted/40 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                <Clock className="size-3 shrink-0" aria-hidden />
                {mod.estimatedTime}
              </span>
            </div>
            <h3 className="mt-3 font-display text-lg font-semibold leading-snug text-foreground">{mod.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-pretty text-muted-foreground">{mod.description}</p>
            <p className="mt-3 flex gap-2 text-sm leading-relaxed text-foreground/90">
              <Target className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
              <span>
                <span className="font-medium text-foreground">Навык: </span>
                {mod.skill}.
              </span>
            </p>
            <p className="mt-auto pt-4">
              <span className="inline-flex rounded-md border border-primary/20 bg-primary/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-primary">
                {mod.formatPreview}
              </span>
            </p>
          </SectionCard>
        ))}
      </div>

      <div className="flex flex-col items-start gap-3 border-t border-border/80 pt-8 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-xl text-sm text-muted-foreground">
          Маркетинговое превью программы. В кабинете отображается актуальная структура курса из базы данных.
        </p>
        <Button asChild variant="primary" className="w-full sm:w-auto">
          <Link href={programHref}>
            Открыть программу курса
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </Button>
      </div>
    </LandingSection>
  );
}
