import Link from "next/link";
import { Play, Search, ShieldCheck, Trophy } from "lucide-react";
import { LandingSection } from "@/components/home/landing-section";
import { Button } from "@/components/ui/button";
import { LabTerminal } from "@/components/ui/lab-terminal";
import { cn } from "@/lib/utils";

const labSteps = [
  {
    step: "01",
    title: "Запусти сценарий",
    description: "Изолированная песочница в браузере — без установки ПО.",
    icon: Play,
    status: "ready",
  },
  {
    step: "02",
    title: "Найди уязвимость",
    description: "Разбор логов, конфигов и трафика по учебным кейсам.",
    icon: Search,
    status: "running",
  },
  {
    step: "03",
    title: "Защити систему",
    description: "Рекомендации по hardening и контролям Blue Team.",
    icon: ShieldCheck,
    status: "pending",
  },
  {
    step: "04",
    title: "Получи результат",
    description: "Оценка, обратная связь и зачёт в прогрессе модуля.",
    icon: Trophy,
    status: "pending",
  },
] as const;

const statusTone: Record<(typeof labSteps)[number]["status"], string> = {
  ready: "text-success",
  running: "text-primary",
  pending: "text-subtle-foreground",
};

export function LandingPracticeLab() {
  return (
    <LandingSection
      id="practice-lab"
      eyebrow="Практика"
      title="Практические задания"
      description="Лаборатории с автопроверкой и ручной проверкой преподавателя: фишинг, логи, крипто, консоль и файловые работы."
      headerClassName="max-w-2xl"
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(260px,340px)] lg:items-start">
        <div className="grid gap-3 sm:grid-cols-2">
          {labSteps.map((item) => {
            const Icon = item.icon;
            return (
              <article
                key={item.step}
                className={cn(
                  "ce-lab-panel group rounded-2xl border border-border bg-card/80 p-4 shadow-card sm:p-5",
                  "transition-[border-color,box-shadow] duration-200 hover:border-primary/30 hover:shadow-[var(--shadow-glow)]",
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-primary">
                    step_{item.step}
                  </span>
                  <span className={cn("font-mono text-[10px] uppercase", statusTone[item.status])}>{item.status}</span>
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                    <Icon className="size-4" strokeWidth={1.75} aria-hidden />
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <LabTerminal title="lab/scenario" glow className="h-full">
          <p className="ce-terminal-accent">$ labctl run --scenario web-xss-01</p>
          <p className="ce-terminal-dim mt-2">
            [info] sandbox_id=ce-7f2a · ttl=45m
            <br />
            [info] targets=2 · logs=enabled
          </p>
          <p className="mt-3">
            <span className="ce-terminal-success">✓</span>{" "}
            <span className="ce-terminal-cmd">scenario_active</span>
          </p>
          <p className="ce-terminal-dim mt-4">
            awaiting submission…
            <span className="ce-security-core-pulse ml-1 inline-block h-3 w-1.5 bg-primary/80" />
          </p>
          <Button asChild size="sm" variant="primary" className="mt-5 w-full">
            <Link href="/auth/register">Открыть лабораторию</Link>
          </Button>
        </LabTerminal>
      </div>
    </LandingSection>
  );
}
