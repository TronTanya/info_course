import { BookOpen, ExternalLink, FileText, GraduationCap, Play } from "lucide-react";
import type { LessonResourceKind } from "@/lib/lesson-module-media";
import { safeLessonHref } from "@/lib/safe-lesson-url";
import { cn } from "@/lib/utils";

export type LessonResourceLink = {
  title: string;
  href: string;
  kind: LessonResourceKind;
  source?: string;
};

const KIND_META: Record<
  LessonResourceKind,
  { label: string; icon: typeof Play; className: string }
> = {
  video: { label: "Видео", icon: Play, className: "text-rose-500/90" },
  article: { label: "Статья", icon: FileText, className: "text-sky-500/90" },
  book: { label: "Книга", icon: BookOpen, className: "text-amber-500/90" },
  course: { label: "Курс", icon: GraduationCap, className: "text-emerald-500/90" },
};

export function LessonResourcesBlock({
  title,
  intro,
  items,
  className,
  id,
}: {
  title: string;
  intro?: string;
  items: LessonResourceLink[];
  className?: string;
  id?: string;
}) {
  const links = items
    .map((item) => {
      const href = safeLessonHref(item.href);
      if (!href) return null;
      return { ...item, href };
    })
    .filter((x): x is LessonResourceLink & { href: string } => x !== null);

  if (links.length === 0) return null;

  return (
    <section
      id={id}
      className={cn(
        "rounded-2xl border border-border/80 bg-card/50 px-4 py-4 ring-1 ring-inset ring-border/50 sm:px-5 sm:py-5",
        className,
      )}
      aria-labelledby={id ? `${id}-title` : undefined}
    >
      <div className="flex items-start gap-2">
        <ExternalLink className="mt-0.5 size-4 shrink-0 text-primary/80" aria-hidden />
        <div className="min-w-0 flex-1">
          <h3 id={id ? `${id}-title` : undefined} className="text-base font-semibold text-foreground">
            {title}
          </h3>
          {intro ? <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{intro}</p> : null}
        </div>
      </div>
      <ul className="mt-4 space-y-2">
        {links.map((item, i) => {
          const meta = KIND_META[item.kind] ?? KIND_META.article;
          const Icon = meta.icon;
          return (
            <li key={i}>
              <a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-3 rounded-xl border border-border/60 bg-muted/20 px-3 py-3 transition-colors hover:border-primary/40 hover:bg-muted/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span
                  className={cn(
                    "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-background ring-1 ring-border/60",
                    meta.className,
                  )}
                  aria-hidden
                >
                  <Icon className="size-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-foreground group-hover:text-primary">
                    {item.title}
                  </span>
                  <span className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
                    <span>{meta.label}</span>
                    {item.source ? (
                      <>
                        <span aria-hidden>·</span>
                        <span>{item.source}</span>
                      </>
                    ) : null}
                  </span>
                </span>
                <ExternalLink
                  className="mt-1 size-3.5 shrink-0 text-muted-foreground opacity-60 group-hover:opacity-100"
                  aria-hidden
                />
              </a>
            </li>
          );
        })}
      </ul>
      <p className="mt-3 text-xs text-muted-foreground">
        Ссылки ведут на внешние ресурсы; при расхождении с правилами организации следуйте локальным требованиям.
      </p>
    </section>
  );
}
