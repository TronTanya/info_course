import { useId, type ReactNode } from "react";
import {
  AlertTriangle,
  Check,
  Info,
  Lightbulb,
  ListChecks,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { LESSON_CALLOUT_HEADINGS, type LessonCalloutType } from "@/lib/lesson-callout-types";
import { cn } from "@/lib/utils";

export type LessonCalloutChecklistItem = { text: ReactNode; checked: boolean };

/** @deprecated Используйте `LessonCalloutType`. */
export type LessonCalloutVariant = LessonCalloutType;

export { LESSON_CALLOUT_HEADINGS };

type VariantConfig = {
  heading: string;
  icon: typeof Info;
  shell: string;
  iconShell: string;
  titleAccent: string;
  glow?: string;
};

const VARIANT_CONFIG: Record<LessonCalloutType, VariantConfig> = {
  info: {
    heading: LESSON_CALLOUT_HEADINGS.info,
    icon: Info,
    shell:
      "border-cyan/30 bg-linear-to-br from-cyan/[0.08] via-sky-500/[0.04] to-card ring-cyan/15",
    iconShell: "border-cyan/30 bg-cyan/10 text-cyan",
    titleAccent: "text-cyan",
    glow: "shadow-[inset_0_1px_0_0_color-mix(in_oklab,var(--cyan)_18%,transparent)]",
  },
  example: {
    heading: LESSON_CALLOUT_HEADINGS.example,
    icon: Lightbulb,
    shell: "border-violet-500/30 bg-violet-500/[0.07] ring-violet-500/15",
    iconShell: "border-violet-500/35 bg-violet-500/12 text-violet-600 dark:text-violet-400",
    titleAccent: "text-violet-600 dark:text-violet-400",
    glow: "shadow-[inset_0_1px_0_0_rgba(167,139,250,0.12)]",
  },
  warning: {
    heading: LESSON_CALLOUT_HEADINGS.warning,
    icon: AlertTriangle,
    shell: "border-amber-500/35 bg-amber-500/[0.08] ring-amber-500/20",
    iconShell: "border-amber-500/35 bg-amber-500/12 text-amber-700 dark:text-amber-400",
    titleAccent: "text-amber-800 dark:text-amber-300",
  },
  danger: {
    heading: LESSON_CALLOUT_HEADINGS.danger,
    icon: ShieldAlert,
    shell: "border-rose-500/35 bg-rose-500/[0.08] ring-rose-500/20",
    iconShell: "border-rose-500/35 bg-rose-500/12 text-rose-700 dark:text-rose-400",
    titleAccent: "text-rose-800 dark:text-rose-300",
  },
  checklist: {
    heading: LESSON_CALLOUT_HEADINGS.checklist,
    icon: ListChecks,
    shell: "border-emerald-500/30 bg-emerald-500/[0.06] ring-emerald-500/15",
    iconShell: "border-emerald-500/35 bg-emerald-500/12 text-emerald-700 dark:text-emerald-400",
    titleAccent: "text-emerald-800 dark:text-emerald-300",
  },
  tip: {
    heading: LESSON_CALLOUT_HEADINGS.tip,
    icon: Sparkles,
    shell:
      "border-emerald-500/25 bg-linear-to-br from-cyan/[0.06] via-emerald-500/[0.05] to-card ring-cyan/15",
    iconShell: "border-cyan/30 bg-cyan/10 text-emerald-700 dark:text-emerald-400",
    titleAccent: "text-emerald-800 dark:text-cyan-300",
    glow: "shadow-[inset_0_1px_0_0_color-mix(in_oklab,var(--cyan)_12%,transparent)]",
  },
};

export type LessonCalloutProps = {
  /** Тип callout (предпочтительный API, этап 8). */
  type?: LessonCalloutType;
  /** @deprecated Используйте `type`. */
  variant?: LessonCalloutType;
  /** Доп. заголовок из контента (первая строка fence). Если не задан — показывается типовой. */
  title?: string;
  children?: ReactNode;
  items?: LessonCalloutChecklistItem[];
  id?: string;
  className?: string;
};

function resolveCalloutType(props: LessonCalloutProps): LessonCalloutType {
  if (props.type) return props.type;
  if (props.variant) return props.variant;
  return "info";
}

function LessonCalloutChecklist({ items }: { items: LessonCalloutChecklistItem[] }) {
  return (
    <ul className="mt-1 space-y-2.5" role="list">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3 text-[15px] leading-relaxed" role="listitem">
          <span
            className={cn(
              "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border",
              item.checked
                ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                : "border-border/80 bg-card/80",
            )}
            aria-hidden
          >
            {item.checked ? <Check className="size-3.5" strokeWidth={2.5} /> : null}
          </span>
          <span
            className={cn(
              "min-w-0 text-foreground/90",
              item.checked && "text-muted-foreground line-through",
            )}
          >
            {item.text}
            {item.checked ? <span className="sr-only"> — выполнено</span> : null}
          </span>
        </li>
      ))}
    </ul>
  );
}

/**
 * Обучающий callout для материала урока (premium cyber).
 * Цвет дополняет, но не заменяет текстовый заголовок типа блока.
 */
export function LessonCallout({
  type: typeProp,
  variant,
  title,
  children,
  items,
  id,
  className,
}: LessonCalloutProps) {
  const calloutType = resolveCalloutType({ type: typeProp, variant });
  const config = VARIANT_CONFIG[calloutType];
  const Icon = config.icon;
  const uid = useId().replace(/:/g, "");
  const headingId = id ? `callout-heading-${id}` : `callout-heading-${uid}`;
  const subtitleId = id ? `callout-subtitle-${id}` : `callout-subtitle-${uid}`;

  const typeHeading = config.heading;
  const contentTitle = title?.trim() ?? "";
  const showSubtitle = Boolean(contentTitle && contentTitle !== typeHeading);
  const hasBody = Boolean(children);
  const hasChecklist = Boolean(items?.length);

  if (!hasBody && !hasChecklist && !typeHeading) return null;

  const labelledBy = showSubtitle ? `${headingId} ${subtitleId}` : headingId;

  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={cn(
        "ce-lesson-callout ce-glass scroll-mt-28 rounded-2xl border px-4 py-4 ring-1 ring-inset sm:px-5 sm:py-4",
        config.shell,
        config.glow,
        className,
      )}
    >
      <div className="flex gap-3 sm:gap-4">
        <span
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset ring-border/40 sm:size-10",
            config.iconShell,
          )}
          aria-hidden
        >
          <Icon className="size-4 sm:size-[1.125rem]" strokeWidth={1.75} />
        </span>
        <div className="min-w-0 flex-1">
          <h3
            id={headingId}
            className={cn(
              "font-display text-base font-semibold leading-snug tracking-tight text-foreground sm:text-[1.0625rem]",
              config.titleAccent,
            )}
          >
            {typeHeading}
          </h3>
          {showSubtitle ? (
            <p
              id={subtitleId}
              className="mt-1 text-sm font-medium leading-snug text-foreground/90"
            >
              {contentTitle}
            </p>
          ) : null}
          {hasChecklist ? (
            <div className={cn(showSubtitle || hasBody ? "mt-2.5" : "mt-2")}>
              <LessonCalloutChecklist items={items!} />
            </div>
          ) : null}
          {hasBody ? (
            <div
              className={cn(
                "text-[15px] leading-relaxed text-foreground/90 [&_a]:rounded-sm [&_a]:underline [&_a]:underline-offset-2 [&_a]:focus-visible:outline-none [&_a]:focus-visible:ring-2 [&_a]:focus-visible:ring-ring [&_code]:text-[0.92em]",
                showSubtitle || hasChecklist ? "mt-2.5" : "mt-2",
              )}
            >
              {children}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
