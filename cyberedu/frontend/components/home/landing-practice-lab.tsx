import Link from "next/link";
import { ArrowRight, Clock, Crosshair, Flag, Link2, MailWarning, ScrollText, Target } from "lucide-react";
import { LandingSection } from "@/components/home/landing-section";
import { Button } from "@/components/ui/button";
import { CyberBadge } from "@/components/ui/cyber-badge";
import { LabTerminal } from "@/components/ui/lab-terminal";
import { SectionCard } from "@/components/ui/section-card";
import {
  LANDING_PRACTICE_LABS,
  LANDING_SECTION_IDS,
  type LandingPracticeLab,
  type LandingPracticeLabDifficulty,
} from "@/lib/landing-content";
import { cn } from "@/lib/utils";

const LAB_ICONS = [MailWarning, Link2, ScrollText, Flag] as const;

const DIFFICULTY_STYLES: Record<LandingPracticeLabDifficulty, string> = {
  Начальный: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  Средний: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  Продвинутый: "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-400",
};

function PracticeLabMiniTerminal({ lab }: { lab: LandingPracticeLab }) {
  return (
    <LabTerminal title={lab.id} className="mt-4 text-[11px] leading-relaxed">
      {lab.terminalPreview.map((line, index) => (
        <p
          key={line}
          className={cn(
            index === 0 ? "ce-terminal-accent font-mono" : "ce-terminal-dim font-mono",
            index > 0 && "mt-1",
          )}
        >
          {line}
        </p>
      ))}
      <p className="ce-terminal-dim mt-2 border-t border-white/5 pt-2 font-mono text-[10px]">
        preview only · ответы не раскрываются
      </p>
    </LabTerminal>
  );
}

function PracticeLabCard({ lab, index }: { lab: LandingPracticeLab; index: number }) {
  const Icon = LAB_ICONS[index] ?? MailWarning;

  return (
    <li>
      <SectionCard
        variant="lab"
        flushTitle
        className={cn(
          "ce-landing-glass-tile group flex h-full flex-col",
          "hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-card-hover motion-reduce:transition-none motion-reduce:hover:translate-y-0",
        )}
      >
        <div className="flex flex-wrap items-start justify-between gap-2">
          <CyberBadge variant="outline" className="font-mono text-[10px] uppercase tracking-wider">
            security lab
          </CyberBadge>
          <span
            className={cn(
              "rounded-lg border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
              DIFFICULTY_STYLES[lab.difficulty],
            )}
          >
            {lab.difficulty}
          </span>
        </div>

        <div className="mt-3 flex items-start gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-primary/25 bg-primary/10 text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
            <Icon className="size-5" strokeWidth={1.75} aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="font-display text-lg font-semibold leading-snug text-foreground">{lab.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-pretty text-muted-foreground">
              <span className="font-medium text-foreground/90">Сценарий: </span>
              {lab.scenario}
            </p>
          </div>
        </div>

        <p className="mt-3 flex gap-2 text-sm leading-relaxed text-foreground/90">
          <Crosshair className="mt-0.5 size-4 shrink-0 text-cyan" aria-hidden />
          <span>
            <span className="font-medium text-foreground">Цель: </span>
            {lab.goal}.
          </span>
        </p>

        <p className="mt-2 flex gap-2 text-sm leading-relaxed text-foreground/90">
          <Target className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
          <span>
            <span className="font-medium text-foreground">Навык: </span>
            {lab.skill}.
          </span>
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-md border border-border/80 bg-muted/30 px-2 py-1 text-[10px] font-medium text-muted-foreground">
            <Clock className="size-3 shrink-0" aria-hidden />
            {lab.estimatedTime}
          </span>
          <span className="inline-flex rounded-md border border-cyan/25 bg-cyan/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-cyan">
            {lab.statusPreview}
          </span>
        </div>

        <PracticeLabMiniTerminal lab={lab} />
      </SectionCard>
    </li>
  );
}

export function LandingPracticeLab() {
  return (
    <LandingSection
      id={LANDING_SECTION_IDS.practice}
      eyebrow="Практика"
      title="Практические лаборатории"
      description="Учебные SOC-сценарии в браузере — без установки ПО. Ниже статическое превью: без флагов, ответов и доступа к реальным заданиям."
      headerClassName="max-w-2xl"
      accent
    >
      <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(240px,300px)] lg:items-start">
        <ul className="grid min-w-0 list-none gap-4 p-0 sm:grid-cols-2">
          {LANDING_PRACTICE_LABS.map((lab, index) => (
            <PracticeLabCard key={lab.id} lab={lab} index={index} />
          ))}
        </ul>

        <LabTerminal title="labctl@preview" glow className="h-full lg:sticky lg:top-24">
          <p className="ce-terminal-accent font-mono">$ labctl list --track infosec</p>
          <p className="ce-terminal-dim mt-2 font-mono">
            {LANDING_PRACTICE_LABS.map((l) => (
              <span key={l.id} className="block">
                {l.id} · {l.difficulty.toLowerCase()} · ready
              </span>
            ))}
          </p>
          <p className="mt-3 font-mono">
            <span className="ce-terminal-success">✓</span>{" "}
            <span className="ce-terminal-cmd">sandbox mounted</span>
          </p>
          <p className="ce-terminal-dim mt-3 font-mono text-[11px]">
            flags · solutions · student submissions — hidden
          </p>
          <p className="ce-terminal-dim mt-4 font-mono">awaiting analyst login…</p>
          <Button asChild size="sm" variant="primary" className="mt-5 w-full min-h-11">
            <Link href="/auth/register">
              Начать обучение
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </Button>
        </LabTerminal>
      </div>
    </LandingSection>
  );
}
