import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  Check,
  ClipboardCheck,
  FlaskConical,
  LayoutGrid,
  MapPin,
  Route,
} from "lucide-react";
import {
  buildLessonNavigationItems,
  type BuildLessonNavigationItemsInput,
  type LessonNavItem,
  type LessonNavItemKind,
} from "@/lib/lesson-navigation-ui";
import { lessonNavLockReasonId } from "@/lib/lesson-page-a11y";
import { cn } from "@/lib/utils";

export type LessonNavigationProps = BuildLessonNavigationItemsInput & {
  className?: string;
};

const KIND_ICONS: Record<LessonNavItemKind, typeof ArrowLeft> = {
  "current-lesson": MapPin,
  "previous-lesson": ArrowLeft,
  "next-lesson": ArrowRight,
  test: ClipboardCheck,
  practice: FlaskConical,
  "next-module": Route,
  certificate: Award,
  roadmap: LayoutGrid,
};

export function LessonNavigation(props: LessonNavigationProps) {
  const { className, ...input } = props;
  const items = buildLessonNavigationItems(input);
  const hasHighlight = items.some((i) => i.isHighlightedNext);

  return (
    <nav
      className={cn(
        "ce-lesson-navigation ce-glass scroll-mt-28 rounded-2xl border border-border/80 p-4 sm:p-5",
        className,
      )}
      aria-label="Навигация по уроку и модулю"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
          Навигация
        </h2>
        {hasHighlight ? (
          <span className="font-mono text-[10px] text-muted-foreground">Рекомендуемый шаг отмечен</span>
        ) : null}
      </div>
      <ul className="mt-4 flex w-full min-w-0 flex-col gap-3">
        {items.map((item) => (
          <li key={item.kind} className="min-w-0">
            <LessonNavRow item={item} />
          </li>
        ))}
      </ul>
    </nav>
  );
}

function LessonNavRow({ item }: { item: LessonNavItem }) {
  const Icon = item.kind === "current-lesson" ? BookOpen : KIND_ICONS[item.kind];
  const showLockReason = item.disabled && item.lockReason;
  const lockReasonId = showLockReason ? lessonNavLockReasonId(item.kind) : undefined;

  const rowClass = cn(
    "flex w-full min-w-0 gap-3 rounded-xl border px-3 py-3 transition-colors motion-reduce:transition-none",
    item.isCurrent && "border-primary/35 bg-primary/8 ring-1 ring-primary/20",
    item.isHighlightedNext &&
      !item.isCurrent &&
      "border-primary/25 bg-primary/5 shadow-[0_0_20px_-10px_hsl(var(--primary)/0.35)]",
    item.isCompleted &&
      !item.isCurrent &&
      !item.isHighlightedNext &&
      "border-emerald-500/20 bg-emerald-500/5",
    !item.isCurrent &&
      !item.isHighlightedNext &&
      !item.isCompleted &&
      (item.disabled
        ? "border-dashed border-border/80 bg-muted/15"
        : "border-border/80 bg-card/60 hover:border-primary/30 hover:bg-primary/5"),
  );

  const body = (
    <>
      <Icon
        className={cn(
          "mt-0.5 size-4 shrink-0",
          item.isCurrent
            ? "text-primary"
            : item.isCompleted
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-primary",
        )}
        aria-hidden
      />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold text-pretty break-words text-foreground">{item.title}</p>
          {item.isCurrent ? (
            <span className="rounded-full bg-primary/15 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wide text-primary">
              Сейчас
            </span>
          ) : null}
          {item.isCompleted && !item.isCurrent ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:text-emerald-400">
              <Check className="size-3 shrink-0" aria-hidden />
              Пройдено
            </span>
          ) : null}
          {item.isHighlightedNext ? (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
              Рекомендуем
            </span>
          ) : null}
          {item.disabled ? (
            <span className="rounded-full border border-dashed border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-800 dark:text-amber-300">
              Недоступно
            </span>
          ) : null}
        </div>
        <p className="mt-0.5 text-xs leading-relaxed text-pretty break-words text-muted-foreground">
          {item.description}
        </p>
        {showLockReason ? (
          <p id={lockReasonId} className="mt-1.5 text-xs font-medium text-amber-700 dark:text-amber-300">
            {item.lockReason}
          </p>
        ) : null}
      </div>
      {!item.disabled && item.href ? (
        <ArrowRight className="mt-1 size-4 shrink-0 text-muted-foreground" aria-hidden />
      ) : null}
    </>
  );

  if (item.isCurrent || item.disabled || !item.href) {
    return (
      <div
        className={rowClass}
        aria-current={item.isCurrent ? "page" : undefined}
        aria-disabled={item.disabled ? true : undefined}
        aria-describedby={lockReasonId}
      >
        {body}
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      className={cn(
        rowClass,
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      )}
    >
      {body}
    </Link>
  );
}
