import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { LandingSection } from "@/components/home/landing-section";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const steps = [
  { id: "basics", label: "Основы", code: "01" },
  { id: "network", label: "Сети", code: "02" },
  { id: "linux", label: "Linux", code: "03" },
  { id: "web", label: "Web Security", code: "04" },
  { id: "crypto", label: "Crypto", code: "05" },
  { id: "soc", label: "SOC", code: "06" },
  { id: "final", label: "Final Project", code: "★", highlight: true },
] as const;

export function LandingLearningPath() {
  return (
    <LandingSection
      id="learning-path"
      eyebrow="Траектория обучения"
      title="Дорожная карта курса"
      description="Последовательный маршрут: теория, тесты и практика в каждом модуле."
      headerClassName="max-w-2xl"
    >
      <div className="ce-lab-panel rounded-3xl border border-border bg-card/70 p-6 shadow-card sm:p-8">
        <ol className="hidden lg:flex lg:items-start lg:justify-between lg:gap-2">
          {steps.map((step, index) => (
            <li key={step.id} className="relative flex min-w-0 flex-1 flex-col items-center">
              {index > 0 ? (
                <span
                  className="absolute left-0 top-5 h-px w-1/2 -translate-x-1/2 bg-primary/30"
                  aria-hidden
                />
              ) : null}
              {index < steps.length - 1 ? (
                <span className="absolute right-0 top-5 h-px w-1/2 translate-x-1/2 bg-primary/30" aria-hidden />
              ) : null}
              <PathNode step={step} />
            </li>
          ))}
        </ol>

        <ol className="flex flex-col gap-1 lg:hidden">
          {steps.map((step, index) => (
            <li key={step.id} className="flex items-stretch gap-3">
              <div className="flex flex-col items-center">
                <PathNode step={step} />
                {index < steps.length - 1 ? (
                  <span className="my-1 min-h-5 w-px flex-1 bg-primary/25" aria-hidden />
                ) : null}
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-8 flex flex-col items-start gap-3 border-t border-border/80 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-xs text-muted-foreground">
            <span className="text-primary">{">"}</span> route_status=sequential · unlock_on_complete=true
          </p>
          <Button asChild variant="outline" size="sm" className="w-full sm:w-auto">
            <Link href="/auth/register">
              Открыть маршрут
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </Button>
        </div>
      </div>
    </LandingSection>
  );
}

function PathNode({ step }: { step: (typeof steps)[number] }) {
  return (
    <div
      className={cn(
        "group relative z-1 flex flex-col items-center px-1 text-center",
        "transition-transform duration-200 hover:-translate-y-0.5 motion-reduce:hover:translate-y-0",
      )}
    >
      <span
        className={cn(
          "flex size-10 items-center justify-center rounded-xl border font-mono text-2.5 font-bold transition duration-200",
          "highlight" in step && step.highlight
            ? "border-primary/50 bg-primary/15 text-primary shadow-sm"
            : "border-border bg-muted/80 text-foreground group-hover:border-primary/35 group-hover:shadow-sm",
        )}
      >
        {step.code}
      </span>
      <span className="mt-2 max-w-26 text-xs font-semibold leading-tight text-foreground">{step.label}</span>
    </div>
  );
}
