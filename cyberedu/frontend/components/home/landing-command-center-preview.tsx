import { Activity, Radar, Shield } from "lucide-react";
import { CyberBadge } from "@/components/ui/cyber-badge";
import { PremiumCard } from "@/components/ui/premium-card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { StatusPill } from "@/components/ui/status-pill";
import { LabTerminal } from "@/components/ui/lab-terminal";
import { cn } from "@/lib/utils";

/** Статический UI-превью кабинета (не API). */
const DEMO_MODULES = [
  { label: "Модуль 01 · Основы ИБ", value: 100 },
  { label: "Модуль 02 · Фишинг", value: 62 },
  { label: "Модуль 03 · Web threats", value: 18 },
] as const;

export function LandingCommandCenterPreview({ className }: { className?: string }) {
  return (
    <PremiumCard
      variant="glow"
      padding="none"
      className={cn("ce-hero-preview-card overflow-hidden backdrop-blur-xl", className)}
      aria-label="Превью учебного кабинета"
    >
      <div className="ce-hero-preview-card__header flex items-center justify-between gap-3 border-b px-4 py-3 sm:px-5">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-primary/25 bg-primary/10 text-primary">
            <Radar className="size-4" strokeWidth={1.75} aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="font-mono text-2.5 font-semibold uppercase tracking-wider text-primary">SOC Command Center</p>
            <p className="truncate text-sm font-medium text-foreground">Учебный трек · демо</p>
          </div>
        </div>
        <CyberBadge variant="cyan" dot glow className="hidden sm:inline-flex">
          live
        </CyberBadge>
      </div>

      <div className="space-y-4 p-4 sm:p-5">
        <div className="ce-polish-inset p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="typo-label">Mission status</p>
            <StatusPill status="in_progress" label="Модуль 2 в работе" />
          </div>
          <p className="mt-2 text-sm text-pretty text-muted-foreground">
            Следующий шаг: тест по фишингу, затем лаборатория «Phishing analysis».
          </p>
          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
            <Activity className="size-3.5 text-cyan" aria-hidden />
            <span>Последняя активность: лекция · 12 мин назад</span>
          </div>
        </div>

        <div>
          <p className="mb-3 flex items-center gap-2 typo-label">
            <Shield className="size-3.5 text-primary" aria-hidden />
            Progress preview
          </p>
          <ul className="space-y-3" aria-label="Демо-прогресс по модулям">
            {DEMO_MODULES.map((m) => (
              <li key={m.label}>
                <ProgressBar label={m.label} value={m.value} tone={m.value === 100 ? "success" : "default"} />
              </li>
            ))}
          </ul>
        </div>

        <LabTerminal title="mentor@soc" glow className="text-xs">
          <p>
            <span className="ce-terminal-prompt">student@cyberedu</span>
            <span className="ce-terminal-sep">:</span>
            <span className="ce-terminal-path">~/module-02</span>
            <span className="ce-terminal-sep">$</span>{" "}
            <span className="ce-terminal-cmd">lab status --scenario phishing-01</span>
          </p>
          <p className="ce-terminal-dim mt-2">
            <span className="ce-terminal-success">✓</span> lesson_complete · test_unlocked
          </p>
          <p className="ce-terminal-dim mt-1">
            <span className="ce-terminal-accent">{">"}</span> practice: awaiting_submission
          </p>
        </LabTerminal>
      </div>
    </PremiumCard>
  );
}
