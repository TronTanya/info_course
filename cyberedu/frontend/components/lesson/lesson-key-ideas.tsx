import { Lightbulb } from "lucide-react";
import { SectionCard } from "@/components/ui/section-card";

export function LessonKeyIdeas({ ideas }: { ideas: string[] }) {
  if (ideas.length === 0) return null;

  return (
    <SectionCard variant="muted" flushTitle className="scroll-mt-24 p-5 sm:p-6">
      <div className="flex gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
          <Lightbulb className="size-5" strokeWidth={1.75} aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-lg font-semibold text-foreground">Ключевые идеи</h2>
          <p className="mt-1 text-sm text-muted-foreground">Кратко — что важно унести из урока перед тестом.</p>
          <ul className="mt-4 space-y-2.5 text-base leading-relaxed text-foreground/90">
            {ideas.map((idea, i) => (
              <li key={i} className="flex gap-2.5">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
                <span className="text-pretty">{idea}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </SectionCard>
  );
}
