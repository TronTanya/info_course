import { createElement } from "react";
import type { LucideIcon } from "lucide-react";
import {
  BookMarked,
  FileText,
  Fish,
  Globe,
  Link2,
  Lock,
  MailWarning,
  Paperclip,
  ShieldAlert,
  Users,
} from "lucide-react";
import { LessonSectionEmpty } from "@/components/lesson/lesson-section-empty";
import { KEY_TERMS_DISPLAY_MAX } from "@/lib/lesson-key-terms";
import type { KeyTerm } from "@/types/lesson-view-model";
import { cn } from "@/lib/utils";

export type KeyTermsGridProps = {
  terms: KeyTerm[];
  className?: string;
  /** Максимум карточек (по умолчанию 6). */
  maxVisible?: number;
};

type TermIconRule = {
  test: RegExp;
  icon: LucideIcon;
};

const ICON_RULES: TermIconRule[] = [
  { test: /фишинг|phishing/i, icon: Fish },
  { test: /домен|domain|dns/i, icon: Globe },
  { test: /https|tls|ssl|шифрован/i, icon: Lock },
  { test: /социальн|инженер|манипуляц/i, icon: Users },
  { test: /вложен|attachment|файл/i, icon: Paperclip },
  { test: /спуф|spoof|поддел/i, icon: MailWarning },
  { test: /парол|password|учётн/i, icon: ShieldAlert },
  { test: /ссылк|url|link/i, icon: Link2 },
];

function iconForTerm(term: string): LucideIcon | null {
  for (const rule of ICON_RULES) {
    if (rule.test.test(term)) return rule.icon;
  }
  return null;
}

function formatDefinition(definition: string): string {
  const t = definition.trim();
  if (!t || t === "—") return "См. пояснение в тексте урока.";
  return t.length > 140 ? `${t.slice(0, 137)}…` : t;
}

function TermIcon({ term }: { term: string }) {
  const icon = iconForTerm(term) ?? BookMarked;
  return (
    <span
      className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-cyan/20 bg-cyan/8 text-cyan"
      aria-hidden
    >
      {createElement(icon, { className: "size-4", strokeWidth: 1.75 })}
    </span>
  );
}

function KeyTermCard({ term, definition }: KeyTerm) {
  return (
    <article
      className={cn(
        "ce-key-term-card group flex h-full gap-2.5 rounded-xl border border-border/70",
        "bg-card/80 p-3.5 shadow-sm transition-colors",
        "hover:border-emerald/25 hover:bg-emerald/[0.03]",
        "sm:gap-3 sm:p-4",
      )}
    >
      <TermIcon term={term} />
      <div className="min-w-0 flex-1">
        <h3 className="text-sm font-semibold leading-snug text-foreground">{term}</h3>
        <p className="mt-1 text-[13px] leading-relaxed text-pretty text-muted-foreground sm:text-sm">
          {formatDefinition(definition)}
        </p>
      </div>
    </article>
  );
}

export function KeyTermsGrid({
  terms,
  className,
  maxVisible = KEY_TERMS_DISPLAY_MAX,
}: KeyTermsGridProps) {
  const visible = terms.slice(0, maxVisible);
  const hasTerms = visible.length > 0;
  const hiddenCount = terms.length - visible.length;

  return (
    <section
      className={cn(
        "ce-key-terms-grid relative w-full max-w-none scroll-mt-28 overflow-hidden rounded-2xl border border-border/60",
        "bg-linear-to-br from-card/95 via-card/90 to-emerald/[0.03] p-3.5 sm:p-4",
        className,
      )}
      aria-labelledby="lesson-key-terms-heading"
    >
      <header className="flex items-start gap-2.5 sm:gap-3">
        <span
          className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-emerald/20 bg-emerald/10 text-emerald"
          aria-hidden
        >
          <FileText className="size-5" strokeWidth={1.75} />
        </span>
        <div className="min-w-0">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-emerald">
            Словарь урока
          </p>
          <h2 id="lesson-key-terms-heading" className="mt-0.5 font-display text-base font-semibold text-foreground sm:text-lg">
            Ключевые термины
          </h2>
          {hasTerms ? (
            <p className="mt-1 text-sm text-muted-foreground">
              {visible.length} {visible.length === 1 ? "термин" : visible.length < 5 ? "термина" : "терминов"} — кратко
              перед чтением материала.
            </p>
          ) : null}
        </div>
      </header>

      {hasTerms ? (
        <>
          <ul
            className="mt-2.5 grid w-full grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3"
            role="list"
            aria-label="Ключевые термины урока"
          >
            {visible.map((entry) => (
              <li key={entry.term} role="listitem" className="min-w-0">
                <KeyTermCard term={entry.term} definition={entry.definition} />
              </li>
            ))}
          </ul>
          {hiddenCount > 0 ? (
            <p className="mt-3 text-xs text-muted-foreground">
              Ещё {hiddenCount}{" "}
              {hiddenCount === 1 ? "термин" : hiddenCount < 5 ? "термина" : "терминов"} — в основном материале.
            </p>
          ) : null}
        </>
      ) : (
        <LessonSectionEmpty kind="key_terms" className="mt-4" headingId="lesson-key-terms-heading" />
      )}
    </section>
  );
}
