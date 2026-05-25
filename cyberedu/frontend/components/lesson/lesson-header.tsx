import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Clock,
  Lock,
  Sparkles,
} from "lucide-react";
import { LessonReadingProgressBar } from "@/components/lesson/lesson-reading-progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CircularProgress } from "@/components/ui/circular-progress";
import type { LessonHeaderStatusView } from "@/lib/lesson-header-ui";
import { LESSON_LOCKED_REASON_ID, LESSON_PAGE_TITLE_ID } from "@/lib/lesson-page-a11y";
import { cn } from "@/lib/utils";

export type LessonHeaderStatusTone = LessonHeaderStatusView["tone"];

export type LessonHeaderStatus = LessonHeaderStatusView;

const STATUS_BADGE_VARIANT: Record<
  LessonHeaderStatusTone,
  "success" | "primary" | "outline"
> = {
  completed: "success",
  in_progress: "primary",
  not_started: "outline",
  locked: "outline",
};

export type LessonHeaderProps = {
  courseHref?: string;
  moduleNumber: number;
  lessonNumber: number;
  lessonTitle: string;
  description: string | null;
  readingTimeLabel: string;
  status: LessonHeaderStatus;
  readingPercent: number;
  lessonCompleted: boolean;
  /** Причина блокировки (показывается при status.tone === locked). */
  lockedReason?: string | null;
  continueHref?: string | null;
  continueLabel?: string;
  continueDisabled?: boolean;
  difficulty?: string;
  onAskMentor?: () => void;
  /** Меньше отступов при завершённом уроке (100% прогресса). */
  compact?: boolean;
  className?: string;
};

export function LessonHeader({
  courseHref = "/dashboard/course",
  moduleNumber,
  lessonNumber,
  lessonTitle,
  description,
  readingTimeLabel,
  status,
  readingPercent,
  lessonCompleted,
  lockedReason,
  continueHref = null,
  continueLabel = "Продолжить",
  continueDisabled = false,
  difficulty,
  onAskMentor,
  compact = false,
  className,
}: LessonHeaderProps) {
  const isLocked = status.tone === "locked";
  const lockMessage = (lockedReason?.trim() || status.hint).trim();
  const ringTone = lessonCompleted ? "success" : isLocked ? "default" : "default";
  const progressValue = isLocked ? 0 : lessonCompleted ? 100 : readingPercent;
  const canContinue =
    !isLocked && Boolean(continueHref) && !continueDisabled;
  const showDisabledContinue =
    !isLocked && continueDisabled && Boolean(continueHref);
  const showMentor = Boolean(onAskMentor) && !isLocked;

  return (
    <header
      className={cn(
        "ce-lesson-header ce-glass relative w-full max-w-none overflow-hidden rounded-2xl border border-primary/20",
        "bg-linear-to-br from-card/95 via-card/90 to-primary/[0.06]",
        compact ? "p-3.5 shadow-sm sm:p-4" : "p-3 shadow-[0_0_48px_-16px_hsl(var(--primary)/0.35)] sm:p-5 lg:p-6",
        isLocked && "border-muted-foreground/25 opacity-[0.98]",
        compact && "ce-lesson-header--compact",
        className,
      )}
      aria-labelledby={LESSON_PAGE_TITLE_ID}
    >
      <div
        className="pointer-events-none absolute -left-8 -top-20 size-56 rounded-full bg-cyan/10 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-10 top-0 size-44 rounded-full bg-primary/15 blur-3xl"
        aria-hidden
      />

      <div className={cn("relative min-w-0", compact ? "space-y-2.5" : "space-y-3 sm:space-y-4")}>
        <div
          className={cn(
            "grid min-w-0 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start",
            compact ? "gap-3 lg:gap-4" : "gap-4 lg:gap-6",
          )}
        >
          <div className={cn("min-w-0", compact ? "space-y-2" : "space-y-2.5 sm:space-y-3")}>
            <div
              className="ce-lesson-header__badges flex flex-wrap items-center gap-1.5 sm:gap-2"
              role="list"
              aria-label="Метки урока"
            >
              <Badge
                variant="primary"
                className="font-mono text-[10px] uppercase tracking-wider sm:text-[11px]"
                role="listitem"
              >
                Модуль {moduleNumber}
              </Badge>
              <Badge
                variant="outline"
                className="font-mono text-[10px] uppercase tracking-wider sm:text-[11px]"
                role="listitem"
              >
                Урок {lessonNumber}
              </Badge>
              <Badge
                variant={STATUS_BADGE_VARIANT[status.tone]}
                className={cn(
                  "text-[11px] sm:text-xs",
                  isLocked && "gap-1 border-muted-foreground/40 text-muted-foreground",
                )}
                role="listitem"
              >
                {isLocked ? <Lock className="size-3 shrink-0" aria-hidden /> : null}
                <span className="sr-only">Статус: </span>
                {status.label}
              </Badge>
              {difficulty && !isLocked ? (
                <Badge
                  variant="outline"
                  className="max-w-[9rem] truncate text-[11px] sm:max-w-[12rem] sm:text-xs"
                  role="listitem"
                >
                  {difficulty}
                </Badge>
              ) : null}
            </div>

            <div className="min-w-0 space-y-1.5 sm:space-y-2">
              <h1
                id={LESSON_PAGE_TITLE_ID}
                className={cn(
                  "font-display font-semibold leading-snug text-pretty break-words text-foreground [overflow-wrap:anywhere]",
                  compact
                    ? "text-lg min-[380px]:text-xl sm:text-2xl"
                    : "text-xl min-[380px]:text-2xl sm:text-3xl lg:text-3xl",
                )}
              >
                {lessonTitle}
              </h1>
              {description ? (
                <p
                  className={cn(
                    "max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground",
                    compact ? "line-clamp-2 sm:line-clamp-2" : "line-clamp-3 sm:line-clamp-none sm:text-base",
                  )}
                >
                  {description}
                </p>
              ) : (
                <p className="max-w-2xl text-pretty text-sm text-muted-foreground/80">
                  {isLocked
                    ? "Урок недоступен, пока не выполнены предыдущие шаги модуля."
                    : "Изучите материал и закрепите тему перед тестом модуля."}
                </p>
              )}
            </div>

            {isLocked ? (
              <div
                id={LESSON_LOCKED_REASON_ID}
                className="flex gap-3 rounded-xl border border-border/70 bg-muted/20 px-3 py-3 sm:px-4"
                role="status"
                aria-live="polite"
              >
                <Lock className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
                <p className="min-w-0 text-sm leading-relaxed text-pretty text-muted-foreground">
                  <span className="font-medium text-foreground">Заблокировано: </span>
                  {lockMessage}
                </p>
              </div>
            ) : null}

            <ul
              className="ce-lesson-header__meta flex min-w-0 flex-col gap-1 text-xs text-muted-foreground sm:flex-row sm:flex-wrap sm:gap-x-4 sm:gap-y-2 sm:text-sm"
              aria-label="Сведения об уроке"
            >
              <li className="inline-flex min-w-0 items-center gap-1.5">
                <Clock className="size-3.5 shrink-0 text-primary sm:size-4" aria-hidden />
                <span className="truncate">
                  <span className="sr-only">Примерное время: </span>
                  {readingTimeLabel}
                </span>
              </li>
              {!isLocked ? (
                <li className="inline-flex min-w-0 items-start gap-1.5 sm:items-center">
                  <BookOpen className="mt-0.5 size-3.5 shrink-0 text-primary sm:mt-0 sm:size-4" aria-hidden />
                  <span className="line-clamp-2 min-w-0 text-pretty sm:line-clamp-none">{status.hint}</span>
                </li>
              ) : null}
            </ul>

            {!isLocked && !compact ? (
              <LessonReadingProgressBar
                percent={progressValue}
                lessonCompleted={lessonCompleted}
                className="w-full max-w-xl"
              />
            ) : null}

            <div className="ce-lesson-header__actions flex flex-col gap-2 pt-0.5 sm:flex-row sm:flex-wrap sm:items-center">
              <Button
                variant="outline"
                className="min-h-11 w-full touch-manipulation border-primary/25 sm:w-auto"
                asChild
              >
                <Link href={courseHref}>
                  <ArrowLeft className="size-4" aria-hidden />
                  Вернуться к курсу
                </Link>
              </Button>
              {canContinue ? (
                <Button variant="primary" className="min-h-11 w-full touch-manipulation sm:w-auto" asChild>
                  <Link href={continueHref!}>
                    {continueLabel}
                    <ArrowRight className="size-4" aria-hidden />
                  </Link>
                </Button>
              ) : showDisabledContinue ? (
                <Button
                  variant="primary"
                  className="min-h-11 w-full touch-manipulation sm:w-auto"
                  disabled
                  aria-describedby={isLocked ? LESSON_LOCKED_REASON_ID : undefined}
                >
                  {continueLabel}
                  <ArrowRight className="size-4" aria-hidden />
                </Button>
              ) : null}
            </div>
          </div>

          <div
            className={cn(
              "ce-lesson-header__aside flex min-w-0 flex-row items-center sm:gap-3 lg:flex-col lg:items-center",
              compact
                ? "gap-2 border-t border-border/50 pt-2.5 lg:border-0 lg:pt-0"
                : "gap-3 border-t border-border/50 pt-3 sm:gap-4 lg:border-0 lg:pt-0",
            )}
          >
            <CircularProgress
              value={progressValue}
              size={compact ? 64 : 72}
              strokeWidth={compact ? 5 : 6}
              tone={ringTone}
              label={isLocked ? "Закрыто" : "Чтение"}
              glow={lessonCompleted && !isLocked}
              className={cn("shrink-0", isLocked && "opacity-60")}
            />
            {showMentor ? (
              <Button
                type="button"
                variant="outline"
                className="min-h-11 min-w-0 flex-1 touch-manipulation gap-2 border-cyan/30 lg:w-full"
                onClick={onAskMentor}
              >
                <Sparkles className="size-4 shrink-0 text-cyan" aria-hidden />
                <span className="truncate sm:hidden">AI-наставник</span>
                <span className="hidden truncate sm:inline">Спросить AI</span>
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
