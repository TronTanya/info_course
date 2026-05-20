import Link from "next/link";
import { BookOpen, Brain, ClipboardCheck, FileBadge, FlaskConical } from "lucide-react";
import { CyberHero } from "@/components/cyber/cyber-hero";
import { LandingCommandCenterPreview } from "@/components/home/landing-command-center-preview";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { authSafe } from "@/lib/auth";
import { cn } from "@/lib/utils";

const highlights = [
  { icon: BookOpen, label: "Теория" },
  { icon: FlaskConical, label: "SOC-практики" },
  { icon: ClipboardCheck, label: "Тесты" },
  { icon: Brain, label: "AI-наставник" },
  { icon: FileBadge, label: "Сертификат" },
] as const;

export async function LandingHero() {
  const session = await authSafe();
  const isAuthenticated = Boolean(session?.user);
  const startHref = isAuthenticated ? "/dashboard/course" : "/auth/register";
  const programHref = "#how-it-works";

  return (
    <CyberHero
      className="ce-landing-hero border-primary/15 bg-card/75 ring-primary/12"
      labelledBy="hero-heading"
      padding="spacious"
    >
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1.12fr)_minmax(280px,1fr)] lg:items-center lg:gap-12">
        <div className="flex min-w-0 flex-col gap-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="primary">Cyber Academy</Badge>
            <Badge variant="outline" className="border-primary/25 text-muted-foreground">
              Premium edtech
            </Badge>
          </div>

          <div className="space-y-4">
            <h1 id="hero-heading" className="typo-h1 max-w-2xl text-balance sm:text-4xl lg:text-[2.65rem] lg:leading-[1.1]">
              CyberEdu — практическая академия кибербезопасности
            </h1>
            <p className="max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
              Теория, SOC-практики, тесты, AI-наставник и сертификат в одном интерактивном треке. Учитесь на
              учебных сценариях, близких к задачам аналитика и инженера защиты.
            </p>
          </div>

          <ul className="flex flex-wrap gap-2">
            {highlights.map(({ icon: Icon, label }) => (
              <li key={label}>
                <span
                  className={cn(
                    "inline-flex min-h-11 items-center gap-1.5 rounded-full border border-border/80 bg-muted/30 px-3 py-2",
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
        </div>

        <div className="relative min-w-0 lg:py-2">
          <LandingCommandCenterPreview />
        </div>
      </div>
    </CyberHero>
  );
}
