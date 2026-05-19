import Link from "next/link";
import { CyberHero } from "@/components/cyber/cyber-hero";
import { LandingSecurityCore } from "@/components/home/landing-security-core";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LabTerminal } from "@/components/ui/lab-terminal";
import { authSafe } from "@/lib/auth";

export async function LandingHero() {
  const session = await authSafe();
  const isAuthenticated = Boolean(session?.user);
  const startHref = isAuthenticated ? "/dashboard/course" : "/auth/register";
  const modulesHref = isAuthenticated ? "/dashboard/course" : "#learning-path";

  return (
    <CyberHero
      className="ce-landing-hero border-primary/15 bg-card/70 ring-primary/15"
      labelledBy="hero-heading"
      padding="spacious"
    >
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(280px,1fr)] lg:items-center lg:gap-12">
        <div className="flex min-w-0 flex-col gap-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="primary">Cyber Lab</Badge>
            <Badge variant="cyan">Secure Mode</Badge>
          </div>

          <div className="space-y-4">
            <h1 id="hero-heading" className="typo-h1 max-w-2xl text-balance sm:text-4xl lg:text-5xl">
              Освой кибербезопасность через практику
            </h1>
            <p className="max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
              Интерактивная платформа с уроками, тестами, лабораторными заданиями и сценариями защиты
              инфраструктуры.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href={startHref}>Начать обучение</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="w-full border-primary/30 sm:w-auto">
              <Link href={modulesHref}>Посмотреть модули</Link>
            </Button>
          </div>

          <LabTerminal title="~/lab" chrome className="max-w-xl">
            <p>
              <span className="ce-terminal-prompt">lab@cyberedu</span>
              <span className="ce-terminal-sep">:</span>
              <span className="ce-terminal-path">~</span>
              <span className="ce-terminal-sep">$</span>{" "}
              <span className="ce-terminal-cmd">start-lab --module web-security</span>
            </p>
            <p className="ce-terminal-dim mt-2">
              <span className="ce-terminal-accent">{">"}</span> initializing sandbox…{" "}
              <span className="ce-terminal-success">ok</span>
            </p>
          </LabTerminal>
        </div>

        <div className="relative min-w-0 lg:py-4">
          <LandingSecurityCore />
        </div>
      </div>
    </CyberHero>
  );
}
