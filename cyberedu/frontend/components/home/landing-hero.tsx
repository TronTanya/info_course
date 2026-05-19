import Link from "next/link";
import { BookOpen, Brain, ClipboardCheck, FileBadge, FlaskConical } from "lucide-react";
import { CyberHero } from "@/components/cyber/cyber-hero";
import { LandingSecurityCore } from "@/components/home/landing-security-core";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LabTerminal } from "@/components/ui/lab-terminal";
import { authSafe } from "@/lib/auth";
import { cn } from "@/lib/utils";

const highlights = [
  { icon: BookOpen, label: "Теория" },
  { icon: FlaskConical, label: "Практика" },
  { icon: ClipboardCheck, label: "Тесты" },
  { icon: Brain, label: "AI-наставник" },
  { icon: FileBadge, label: "Сертификат" },
] as const;

export async function LandingHero() {
  const session = await authSafe();
  const isAuthenticated = Boolean(session?.user);
  const startHref = isAuthenticated ? "/dashboard/course" : "/auth/register";
  const programHref = "#modules";

  return (
    <CyberHero
      className="ce-landing-hero border-primary/15 bg-card/75 ring-primary/12"
      labelledBy="hero-heading"
      padding="spacious"
    >
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1.12fr)_minmax(260px,1fr)] lg:items-center lg:gap-12">
        <div className="flex min-w-0 flex-col gap-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="primary">Практический курс</Badge>
            <Badge variant="outline" className="border-primary/25 text-muted-foreground">
              Информационная безопасность
            </Badge>
          </div>

          <div className="space-y-4">
            <h1 id="hero-heading" className="typo-h1 max-w-2xl text-balance sm:text-4xl lg:text-[2.65rem] lg:leading-[1.1]">
              Практический курс по кибербезопасности для старта в ИБ
            </h1>
            <p className="max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
              Теория, практические лаборатории, тесты, AI-наставник и сертификат по завершении — в одной платформе
              CyberEdu. Учитесь на учебных сценариях, близких к задачам аналитика и инженера защиты.
            </p>
          </div>

          <ul className="flex flex-wrap gap-2">
            {highlights.map(({ icon: Icon, label }) => (
              <li key={label}>
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-muted/30 px-3 py-1.5",
                    "text-xs font-medium text-foreground",
                  )}
                >
                  <Icon className="size-3.5 text-primary" strokeWidth={1.75} aria-hidden />
                  {label}
                </span>
              </li>
            ))}
          </ul>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href={startHref}>Начать обучение</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="w-full border-primary/25 bg-card/50 sm:w-auto">
              <Link href={programHref}>Посмотреть программу</Link>
            </Button>
          </div>

          <LabTerminal title="~/cyberedu" chrome className="max-w-xl">
            <p>
              <span className="ce-terminal-prompt">student@cyberedu</span>
              <span className="ce-terminal-sep">:</span>
              <span className="ce-terminal-path">~</span>
              <span className="ce-terminal-sep">$</span>{" "}
              <span className="ce-terminal-cmd">course status --track infosec</span>
            </p>
            <p className="ce-terminal-dim mt-2">
              <span className="ce-terminal-accent">{">"}</span> modules=sequential · practice=enabled · mentor=on
            </p>
            <p className="ce-terminal-dim mt-1">
              <span className="ce-terminal-success">✓</span> ready to start module 01
            </p>
          </LabTerminal>
        </div>

        <div className="relative min-w-0 lg:py-2">
          <LandingSecurityCore />
        </div>
      </div>
    </CyberHero>
  );
}
