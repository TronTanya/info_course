import Link from "next/link";
import { KeyRound, Link2, MailWarning, ScrollText } from "lucide-react";
import { LandingSection } from "@/components/home/landing-section";
import { Button } from "@/components/ui/button";
import { CyberBadge } from "@/components/ui/cyber-badge";
import { LabTerminal } from "@/components/ui/lab-terminal";
import { PremiumCard } from "@/components/ui/premium-card";
import { cn } from "@/lib/utils";

const scenarios = [
  {
    id: "phishing-01",
    title: "Разбор фишинга",
    description: "Разбор письма, заголовков и вложений — найдите признаки социальной инженерии.",
    icon: MailWarning,
    difficulty: "medium",
    status: "active",
  },
  {
    id: "url-02",
    title: "Подозрительный URL",
    description: "Оцените домен, редиректы и сертификат — решите, блокировать ли переход.",
    icon: Link2,
    difficulty: "easy",
    status: "ready",
  },
  {
    id: "pwd-03",
    title: "Безопасность паролей",
    description: "Политика паролей, утечки и MFA — предложите усиление для учебной организации.",
    icon: KeyRound,
    difficulty: "medium",
    status: "ready",
  },
  {
    id: "logs-04",
    title: "Расследование логов",
    description: "Корреляция событий в журналах — восстановите цепочку до инцидента.",
    icon: ScrollText,
    difficulty: "hard",
    status: "locked",
  },
] as const;

const difficultyLabel: Record<(typeof scenarios)[number]["difficulty"], string> = {
  easy: "лёгкий",
  medium: "средний",
  hard: "сложный",
};

const statusLabel: Record<(typeof scenarios)[number]["status"], string> = {
  active: "в работе",
  ready: "готово",
  locked: "закрыто",
};

const statusTone: Record<(typeof scenarios)[number]["status"], string> = {
  active: "text-primary",
  ready: "text-success",
  locked: "text-subtle-foreground",
};

function ScenarioCards({ items }: { items: readonly (typeof scenarios)[number][] }) {
  return (
    <ul className="grid list-none gap-3 p-0">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <li key={item.id}>
            <PremiumCard variant="default" padding="md" className="h-full">
              <div className="flex items-start justify-between gap-2">
                <CyberBadge variant="outline" className="font-mono text-2.5">
                  {item.id}
                </CyberBadge>
                <span className={cn("text-2.5 font-medium", statusTone[item.status])}>
                  {statusLabel[item.status]}
                </span>
              </div>
              <div className="mt-3 flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/8 text-primary">
                  <Icon className="size-4" strokeWidth={1.75} aria-hidden />
                </span>
                <div className="min-w-0">
                  <h4 className="text-sm font-semibold text-foreground">{item.title}</h4>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{item.description}</p>
                </div>
              </div>
            </PremiumCard>
          </li>
        );
      })}
    </ul>
  );
}

export function PracticeLabPreview() {
  return (
    <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(200px,260px)] sm:items-start">
      <ScenarioCards items={scenarios.slice(0, 2)} />
      <LabTerminal title="lab/scenario" className="h-full min-h-48">
        <p className="ce-terminal-accent">$ labctl list --track infosec</p>
        <p className="ce-terminal-dim mt-2">
          phishing-01 · active
          <br />
          url-02 · ready
        </p>
        <Button asChild size="sm" variant="primary" className="mt-4 w-full">
          <Link href="/auth/register">Начать</Link>
        </Button>
      </LabTerminal>
    </div>
  );
}

export function LandingPracticeLab() {
  return (
    <LandingSection
      id="practice-lab"
      eyebrow="Практические лаборатории"
      title="Сценарии кибербезопасности в браузере"
      description="Каждая лаборатория — изолированный сценарий: логи, артефакты и задания без установки ПО. Демо ниже — статический превью интерфейса."
      headerClassName="max-w-2xl"
      accent
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(260px,340px)] lg:items-start">
        <ul className="grid list-none gap-3 p-0 sm:grid-cols-2">
          {scenarios.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <PremiumCard variant="default" padding="md" className="group h-full transition-colors transition-shadow hover:border-primary/30">
                  <div className="flex items-start justify-between gap-2">
                    <CyberBadge variant="outline" className="font-mono text-2.5 uppercase">
                      {item.id}
                    </CyberBadge>
                    <span className={cn("font-mono text-2.5 uppercase", statusTone[item.status])}>
                      {statusLabel[item.status]}
                    </span>
                  </div>
                  <div className="mt-3 flex items-start gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                      <Icon className="size-4" strokeWidth={1.75} aria-hidden />
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{item.description}</p>
                      <p className="mt-2 font-mono text-2.5 uppercase tracking-wider text-muted-foreground">
                        сложность: {difficultyLabel[item.difficulty]}
                      </p>
                    </div>
                  </div>
                </PremiumCard>
              </li>
            );
          })}
        </ul>

        <LabTerminal title="lab/scenario" glow className="h-full">
          <p className="ce-terminal-accent">$ labctl list --track infosec</p>
          <p className="ce-terminal-dim mt-2">
            phishing-01 · active
            <br />
            url-02 · ready
            <br />
            pwd-03 · ready
            <br />
            logs-04 · locked
          </p>
          <p className="mt-3">
            <span className="ce-terminal-success">✓</span>{" "}
            <span className="ce-terminal-cmd">scenario phishing-01 mounted</span>
          </p>
          <p className="ce-terminal-dim mt-4">
            awaiting analyst notes…
            <span className="ce-security-core-pulse ml-1 inline-block h-3 w-1.5 bg-primary/80" aria-hidden />
          </p>
          <Button asChild size="sm" variant="primary" className="mt-5 w-full">
            <Link href="/auth/register">Начать обучение</Link>
          </Button>
        </LabTerminal>
      </div>
    </LandingSection>
  );
}
