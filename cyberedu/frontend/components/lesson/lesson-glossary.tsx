import type { GlossaryEntry } from "@/components/lesson/lesson-structured-text";
import { Badge } from "@/components/ui/badge";

export function LessonGlossary({ terms }: { terms: GlossaryEntry[] }) {
  if (terms.length === 0) return null;

  return (
    <section className="rounded-2xl border border-border/80 bg-muted/20 p-5 ring-1 ring-inset ring-border/50">
      <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-primary">Ключевые термины</p>
      <ul className="mt-4 flex flex-wrap gap-2">
        {terms.map((t) => (
          <li key={t.term}>
            <Badge
              variant="outline"
              className="max-w-full border-primary/20 bg-primary/5 px-2.5 py-1 text-left font-normal"
              title={t.description || undefined}
            >
              <span className="font-semibold text-foreground">{t.term}</span>
            </Badge>
          </li>
        ))}
      </ul>
      <dl className="mt-4 space-y-3 border-t border-border/60 pt-4">
        {terms.slice(0, 6).map((t) => (
          <div key={`${t.term}-desc`}>
            <dt className="text-sm font-semibold text-foreground">{t.term}</dt>
            {t.description ? (
              <dd className="mt-0.5 text-sm leading-relaxed text-muted-foreground">{t.description}</dd>
            ) : null}
          </div>
        ))}
      </dl>
      {terms.length > 6 ? (
        <p className="mt-3 text-xs text-subtle-foreground">+{terms.length - 6} терминов в тексте урока</p>
      ) : null}
    </section>
  );
}
