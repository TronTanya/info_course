import {
  BookOpen,
  Brain,
  CheckCircle2,
  Circle,
  Lock,
  ScanSearch,
  Sparkles,
} from "lucide-react";
import { LANDING_HERO_ROADMAP } from "@/lib/landing-content";
import { cn } from "@/lib/utils";

const DEMO_COURSE_PROGRESS = 58;

function RoadmapStatusIcon({ status }: { status: (typeof LANDING_HERO_ROADMAP)[number]["status"] }) {
  if (status === "done") {
    return <CheckCircle2 className="size-4 text-success" strokeWidth={1.75} aria-hidden />;
  }
  if (status === "active") {
    return (
      <span className="relative flex size-4" aria-hidden>
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary/50 opacity-60 motion-reduce:animate-none" />
        <Circle className="relative size-4 fill-primary/25 text-primary" strokeWidth={1.75} />
      </span>
    );
  }
  return <Lock className="size-3.5 text-subtle-foreground" strokeWidth={1.75} aria-hidden />;
}

/** Статическое превью кабинета для Hero (без API и без ответов заданий). */
export function LandingHeroPreview({ className }: { className?: string }) {
  return (
    <div
      className={cn("ce-landing-hero-preview relative min-w-0", className)}
      aria-label="Превью учебного кабинета: прогресс, модули, сканирование и AI-наставник"
    >
      <div className="ce-landing-hero-preview-glow pointer-events-none absolute -inset-6 rounded-[2rem] opacity-80" aria-hidden />

      <div className="relative flex flex-col gap-3">
        {/* Прогресс курса */}
        <div className="ce-landing-glass-tile rounded-2xl p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-primary">Course track</p>
              <p className="mt-0.5 font-display text-sm font-semibold text-foreground">Прогресс курса</p>
            </div>
            <span className="shrink-0 rounded-lg border border-primary/20 bg-primary/10 px-2.5 py-1 font-mono text-sm font-bold tabular-nums text-primary">
              {DEMO_COURSE_PROGRESS}%
            </span>
          </div>
          <div
            className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-muted ring-1 ring-inset ring-border"
            role="progressbar"
            aria-valuenow={DEMO_COURSE_PROGRESS}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Демо-прогресс курса"
          >
            <div
              className="h-full rounded-full bg-linear-to-r from-primary via-primary to-cyan shadow-[0_0_16px_-4px_color-mix(in_oklab,var(--primary)_50%,transparent)]"
              style={{ width: `${DEMO_COURSE_PROGRESS}%` }}
            />
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <BookOpen className="mr-1 inline size-3.5 text-cyan" aria-hidden />
            Следующий шаг: тест «Фишинг и социнженерия»
          </p>
        </div>

        {/* Roadmap — 3 модуля */}
        <div className="ce-landing-glass-tile rounded-2xl p-4 sm:p-5">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Roadmap</p>
          <ol className="mt-3 space-y-0 list-none p-0" aria-label="Демо-дорожная карта из трёх модулей">
            {LANDING_HERO_ROADMAP.map((mod, index) => {
              const isLast = index === LANDING_HERO_ROADMAP.length - 1;
              return (
                <li key={mod.order} className="relative flex gap-3 pb-4 last:pb-0">
                  {!isLast ? (
                    <span
                      className="absolute left-[0.6875rem] top-6 bottom-0 w-px bg-linear-to-b from-primary/40 to-border/60"
                      aria-hidden
                    />
                  ) : null}
                  <span className="relative z-[1] mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border border-border/80 bg-card">
                    <RoadmapStatusIcon status={mod.status} />
                  </span>
                  <div className="min-w-0 flex-1 pt-px">
                    <p className="text-[10px] font-medium uppercase tracking-wide text-subtle-foreground">
                      Модуль {String(mod.order).padStart(2, "0")}
                    </p>
                    <p
                      className={cn(
                        "text-sm font-medium leading-snug",
                        mod.status === "upcoming" ? "text-muted-foreground" : "text-foreground",
                      )}
                    >
                      {mod.title}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {/* Mini terminal / security scan */}
          <div className="ce-landing-hero-terminal rounded-2xl border border-border/80 bg-[var(--terminal-bg)] p-3.5 font-mono text-[11px] leading-relaxed shadow-card sm:p-4">
            <div className="mb-2 flex items-center gap-2 border-b border-[var(--terminal-border)] pb-2">
              <ScanSearch className="size-3.5 text-[var(--terminal-accent)]" strokeWidth={1.75} aria-hidden />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--terminal-fg-muted)]">
                security_scan
              </span>
            </div>
            <p className="text-[var(--terminal-dim)]">
              <span className="text-[var(--terminal-accent)]">$</span> scan --safe-mode
            </p>
            <p className="mt-1.5 text-[var(--terminal-fg-muted)]">
              rbac: ok · csrf: ok
              <br />
              rate_limit: active
            </p>
            <p className="mt-2">
              <span className="text-[var(--terminal-success)]">✓</span>{" "}
              <span className="text-[var(--terminal-cmd)]">training_env isolated</span>
            </p>
          </div>

          {/* AI mentor bubble */}
          <div className="ce-landing-hero-mentor-bubble ce-landing-glass-tile relative flex flex-col justify-between gap-3 rounded-2xl p-4">
            <div className="flex items-start gap-2.5">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-primary/25 bg-primary/10 text-primary">
                <Brain className="size-4" strokeWidth={1.75} aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-foreground">AI-наставник</p>
                <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                  «Объясни проще, как распознать фишинговое письмо»
                </p>
              </div>
            </div>
            <p className="flex items-center gap-1.5 text-[10px] text-subtle-foreground">
              <Sparkles className="size-3 text-cyan" aria-hidden />
              Без готовых ответов на тесты
            </p>
            <span
              className="pointer-events-none absolute -bottom-2 left-6 size-3 rotate-45 border border-border/80 bg-[color-mix(in_oklab,var(--card)_62%,transparent)]"
              aria-hidden
            />
          </div>
        </div>
      </div>
    </div>
  );
}
