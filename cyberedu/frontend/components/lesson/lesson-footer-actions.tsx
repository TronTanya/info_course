import Link from "next/link";
import { ArrowRight, ClipboardCheck, FlaskConical, Sparkles } from "lucide-react";
import type { LearningStepLink } from "@/lib/learning-nav";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/ui/section-card";
import { cn } from "@/lib/utils";

export type LessonFooterActionsProps = {
  lessonCompleted: boolean;
  markPending: boolean;
  onMarkStudied: () => void;
  testHref: string;
  practiceHref: string;
  hasTest: boolean;
  hasPractice: boolean;
  nextStep: LearningStepLink | null;
  onAskMentor: () => void;
  showMentor: boolean;
};

export function LessonFooterActions({
  lessonCompleted,
  markPending,
  onMarkStudied,
  testHref,
  practiceHref,
  hasTest,
  hasPractice,
  nextStep,
  onAskMentor,
  showMentor,
}: LessonFooterActionsProps) {
  return (
    <SectionCard variant="lab" flushTitle className="scroll-mt-24 p-5 sm:p-6" aria-labelledby="lesson-next-heading">
      <h2 id="lesson-next-heading" className="font-display text-lg font-semibold text-foreground">
        Что дальше
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {lessonCompleted
          ? "Лекция отмечена как изученная — закрепите материал в тесте и практике."
          : "После чтения отметьте урок изученным и переходите к следующему шагу модуля."}
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {hasTest ? (
          <ActionTile
            href={testHref}
            icon={ClipboardCheck}
            title="Пройти тест"
            description="Проверка знаний по модулю"
            primary={lessonCompleted}
            disabled={!lessonCompleted}
            disabledHint="Сначала отметьте урок изученным"
          />
        ) : null}
        {hasPractice ? (
          <ActionTile
            href={practiceHref}
            icon={FlaskConical}
            title="Открыть практику"
            description="Лабораторный сценарий"
            primary={false}
          />
        ) : null}
        {nextStep && !nextStep.disabled ? (
          <ActionTile
            href={nextStep.href}
            icon={ArrowRight}
            title={nextStep.href.includes("/lesson") ? "Следующий урок" : nextStep.label}
            description={
              nextStep.hint ?? (nextStep.href.includes("/lesson") ? "Продолжить лекцию" : "Следующий шаг модуля")
            }
            primary={!hasTest || lessonCompleted}
          />
        ) : null}
      </div>

      <div className="mt-5 flex flex-col gap-2 border-t border-border/70 pt-5 sm:flex-row sm:flex-wrap">
        {!lessonCompleted ? (
          <Button
            type="button"
            variant="primary"
            size="lg"
            className="w-full sm:w-auto"
            loading={markPending}
            disabled={markPending}
            onClick={onMarkStudied}
          >
            Отметить как изучено
          </Button>
        ) : null}
        {showMentor ? (
          <Button type="button" variant="outline" size="lg" className="w-full gap-2 border-cyan/30 sm:w-auto" onClick={onAskMentor}>
            <Sparkles className="size-4 text-cyan" aria-hidden />
            Спросить AI-наставника по уроку
          </Button>
        ) : null}
      </div>
    </SectionCard>
  );
}

function ActionTile({
  href,
  icon: Icon,
  title,
  description,
  primary,
  disabled,
  disabledHint,
}: {
  href: string;
  icon: typeof ClipboardCheck;
  title: string;
  description: string;
  primary?: boolean;
  disabled?: boolean;
  disabledHint?: string;
}) {
  if (disabled) {
    return (
      <div
        className="flex flex-col rounded-xl border border-dashed border-border/80 bg-muted/20 px-4 py-3 opacity-80"
        title={disabledHint}
      >
        <Icon className="size-5 text-muted-foreground" aria-hidden />
        <p className="mt-2 text-sm font-semibold text-foreground">{title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{disabledHint ?? description}</p>
      </div>
    );
  }

  return (
    <Link
      href={href}
      className={cn(
        "group flex flex-col rounded-xl border px-4 py-3 transition-colors",
        "hover:shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        primary
          ? "border-primary/35 bg-primary/10 hover:bg-primary/15"
          : "border-border/80 bg-card hover:border-primary/25 hover:bg-muted/30",
      )}
    >
      <Icon className={cn("size-5", primary ? "text-primary" : "text-muted-foreground group-hover:text-primary")} aria-hidden />
      <p className="mt-2 text-sm font-semibold text-foreground">{title}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
    </Link>
  );
}
