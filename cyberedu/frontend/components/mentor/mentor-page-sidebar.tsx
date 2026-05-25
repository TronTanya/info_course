"use client";

import {
  BookOpen,
  ChevronDown,
  Globe,
  Lightbulb,
  Shield,
  Sparkles,
  Target,
} from "lucide-react";
import {
  MENTOR_PAGE_CAPABILITIES,
  MENTOR_PAGE_USAGE_RULES,
  MENTOR_STANDALONE_SAFE_EXAMPLES,
  type MentorPageContextOption,
  type MentorPageContextScope,
} from "@/lib/mentor-standalone-page";
import type { DashboardWeakTopic } from "@/lib/dashboard-ui";
import { cn } from "@/lib/utils";

const SCOPE_ICONS: Record<MentorPageContextScope, typeof Globe> = {
  general: Globe,
  course: BookOpen,
  weak_topics: Target,
};

export function MentorPageContextSelector({
  options,
  value,
  disabled,
  onChange,
}: {
  options: MentorPageContextOption[];
  value: MentorPageContextScope;
  disabled?: boolean;
  onChange: (scope: MentorPageContextScope) => void;
}) {
  return (
    <fieldset className="min-w-0" disabled={disabled}>
      <legend className="sr-only">Контекст наставника</legend>
      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-cyan">Контекст</p>
      <div
        className="mt-2 flex flex-col gap-1.5"
        role="radiogroup"
        aria-label="Контекст наставника"
      >
        {options.map((opt) => {
          const Icon = SCOPE_ICONS[opt.scope];
          const selected = value === opt.scope;
          return (
            <label
              key={opt.scope}
              className={cn(
                "flex cursor-pointer gap-2.5 rounded-xl border px-2.5 py-2 transition-colors",
                opt.disabled && "cursor-not-allowed opacity-45",
                selected
                  ? "border-cyan/45 bg-cyan/[0.1] ring-1 ring-cyan/25"
                  : "border-border/60 bg-muted/10 hover:border-cyan/30 hover:bg-muted/20",
              )}
            >
              <input
                type="radio"
                name="mentor-context-scope"
                value={opt.scope}
                checked={selected}
                disabled={disabled || opt.disabled}
                className="sr-only"
                onChange={() => onChange(opt.scope)}
              />
              <Icon
                className={cn("mt-0.5 size-3.5 shrink-0", selected ? "text-cyan" : "text-muted-foreground")}
                aria-hidden
              />
              <span className="min-w-0">
                <span className="block text-xs font-semibold leading-tight text-foreground">{opt.label}</span>
                <span className="mt-0.5 block text-[11px] leading-snug text-pretty text-muted-foreground line-clamp-2">
                  {opt.description}
                </span>
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

export function MentorPageWeakTopicsHighlight({
  topics,
  className,
}: {
  topics: DashboardWeakTopic[];
  className?: string;
}) {
  if (topics.length === 0) return null;
  const top = topics.slice(0, 2);

  return (
    <section
      className={cn(
        "rounded-xl border border-warning/25 bg-warning/[0.06] px-2.5 py-2",
        className,
      )}
      aria-label="Слабые темы для разбора"
    >
      <p className="flex items-center gap-1 font-mono text-[9px] font-bold uppercase tracking-wider text-warning">
        <Target className="size-3" aria-hidden />
        Фокус
      </p>
      <ul className="mt-1.5 space-y-1">
        {top.map((t) => (
          <li key={t.id} className="text-[11px] leading-snug text-foreground">
            <span className="font-medium">{t.title}</span>
            {t.reason ? (
              <span className="mt-0.5 block text-muted-foreground">{t.reason}</span>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}

const CAPABILITY_ICONS = [Lightbulb, Shield, Sparkles, Target, BookOpen] as const;

export function MentorPageCapabilities() {
  return (
    <section aria-labelledby="mentor-capabilities-heading">
      <h2
        id="mentor-capabilities-heading"
        className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground"
      >
        Возможности
      </h2>
      <ul className="mt-2 space-y-1">
        {MENTOR_PAGE_CAPABILITIES.map((line, i) => {
          const Icon = CAPABILITY_ICONS[i % CAPABILITY_ICONS.length];
          return (
            <li key={line} className="flex gap-2 text-[11px] leading-snug text-muted-foreground">
              <Icon className="mt-0.5 size-3 shrink-0 text-cyan/80" aria-hidden />
              <span>{line}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function MentorPageSafeExamples({
  disabled,
  onSelect,
}: {
  disabled?: boolean;
  onSelect: (text: string) => void;
}) {
  return (
    <section aria-labelledby="mentor-safe-examples-heading">
      <h2
        id="mentor-safe-examples-heading"
        className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground"
      >
        Быстрый старт
      </h2>
      <ul className="mt-2 flex flex-wrap gap-1.5">
        {MENTOR_STANDALONE_SAFE_EXAMPLES.map((ex) => (
          <li key={ex.id}>
            <button
              type="button"
              disabled={disabled}
              title={ex.text}
              className={cn(
                "ce-mentor-page-prompt-chip rounded-full border px-2.5 py-1 text-left text-[11px] font-medium transition",
                "border-border/70 bg-background/50 text-foreground/90",
                "hover:border-cyan/35 hover:bg-cyan/[0.08] hover:text-foreground",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                "disabled:pointer-events-none disabled:opacity-45",
              )}
              onClick={() => onSelect(ex.text)}
            >
              {ex.label}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function MentorPageUsageRules() {
  return (
    <details className="group rounded-xl border border-border/50 bg-muted/10 open:bg-muted/15">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-2.5 py-2 text-[11px] font-semibold text-muted-foreground marker:content-none [&::-webkit-details-marker]:hidden">
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.12em]">Правила</span>
        <ChevronDown
          className="size-3.5 shrink-0 transition group-open:rotate-180"
          aria-hidden
        />
      </summary>
      <ul className="space-y-1 border-t border-border/40 px-2.5 py-2 text-[10px] leading-relaxed text-muted-foreground">
        {MENTOR_PAGE_USAGE_RULES.map((line) => (
          <li key={line} className="flex gap-1.5">
            <span className="text-warning" aria-hidden>
              ·
            </span>
            <span>{line}</span>
          </li>
        ))}
      </ul>
    </details>
  );
}
