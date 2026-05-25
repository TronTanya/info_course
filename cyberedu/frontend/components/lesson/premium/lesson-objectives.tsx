import { Check, Target } from "lucide-react";
import { LessonSectionEmpty } from "@/components/lesson/lesson-section-empty";
import { resolveLessonDisplayObjectives } from "@/lib/lesson-objectives-display";
import type { LessonObjective } from "@/types/lesson-view-model";
import { cn } from "@/lib/utils";

export type LessonObjectivesProps = {
  objectives: LessonObjective[];
  /** Краткое описание урока (intro / why) — один честный fallback, без выдуманных целей */
  description?: string | null;
  className?: string;
};

export function LessonObjectives({ objectives, description = null, className }: LessonObjectivesProps) {
  const { items, source } = resolveLessonDisplayObjectives(objectives, description ?? null);
  const hasGoals = items.length > 0;

  return (
    <section
      className={cn(
        "ce-lesson-objectives relative w-full max-w-none scroll-mt-28 overflow-hidden rounded-2xl border border-cyan/15",
        "bg-linear-to-br from-emerald/[0.04] via-card to-cyan/[0.05]",
        "p-3.5 shadow-sm sm:p-4",
        className,
      )}
      aria-labelledby="lesson-objectives-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-60"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 0% 0%, color-mix(in oklab, var(--color-emerald-500, #10b981) 12%, transparent), transparent 55%)",
        }}
      />

      <div className="relative flex gap-2.5 sm:gap-3">
        <span
          className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-cyan/25 bg-cyan/10 text-cyan sm:size-10"
          aria-hidden
        >
          <Target className="size-4" strokeWidth={1.75} />
        </span>

        <div className="min-w-0 flex-1 space-y-2.5">
          <header className="space-y-0.5">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-cyan">
              Результаты обучения
            </p>
            <h2
              id="lesson-objectives-heading"
              className="font-display text-base font-semibold text-foreground sm:text-lg"
            >
              После урока вы сможете
            </h2>
            {source === "description" ? (
              <p className="text-xs leading-relaxed text-muted-foreground">
                Краткая формулировка из описания урока — полный список целей появится в материале позже.
              </p>
            ) : null}
          </header>

          {hasGoals ? (
            <ul
              className="grid w-full grid-cols-1 gap-2 md:grid-cols-2"
              role="list"
              aria-label="Цели урока"
            >
              {items.map((objective, index) => (
                <li key={`${index}-${objective.text.slice(0, 32)}`} role="listitem" className="min-w-0">
                  <ObjectiveCard text={objective.text} fromDescription={source === "description"} />
                </li>
              ))}
            </ul>
          ) : (
            <LessonSectionEmpty kind="objectives" headingId="lesson-objectives-heading" />
          )}
        </div>
      </div>
    </section>
  );
}

function ObjectiveCard({
  text,
  fromDescription,
}: {
  text: string;
  fromDescription?: boolean;
}) {
  return (
    <article
      className={cn(
        "ce-lesson-objectives__card flex h-full gap-2.5 rounded-lg border p-2.5 transition-colors sm:p-3",
        "border-emerald/20 bg-linear-to-br from-emerald/[0.06] via-card/90 to-cyan/[0.04]",
        "hover:border-cyan/30 hover:shadow-[0_0_20px_-8px_hsl(var(--cyan)/0.35)]",
        fromDescription && "border-cyan/25 from-cyan/[0.05]",
      )}
    >
      <span
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-lg border",
          "border-emerald/35 bg-emerald/10 text-emerald",
          fromDescription && "border-cyan/35 bg-cyan/10 text-cyan",
        )}
        aria-hidden
      >
        <Check className="size-4" strokeWidth={2.5} />
      </span>
      <p className="min-w-0 flex-1 text-sm leading-relaxed text-pretty text-foreground">{text}</p>
    </article>
  );
}
