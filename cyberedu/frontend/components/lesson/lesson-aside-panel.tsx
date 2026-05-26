"use client";

import { Button } from "@/components/ui/button";
import { LearnOsPanel, LearnOsEyebrow } from "@/components/learn/learn-os-panel";
import { ProgressTracker } from "@/components/lesson/lesson-ui/progress-tracker";
import type { LearningNavStepItem } from "@/lib/learning-nav";
import type { LessonAiAction } from "@/lib/lesson-ai-meta";
import { cn } from "@/lib/utils";

const AI_BUTTONS: { action: LessonAiAction; label: string }[] = [
  { action: "simpler", label: "Проще" },
  { action: "adapt_interests", label: "Через интересы" },
  { action: "example", label: "Пример" },
  { action: "summary", label: "Конспект" },
];

export type LessonAsidePanelProps = {
  moduleProgressPercent: number;
  moduleStepsLabel: string;
  lessonCompleted: boolean;
  difficulty: string;
  steps: LearningNavStepItem[];
  lessonReadingPercent?: number;
  allowAiAdaptation: boolean;
  aiBusy: boolean;
  onRunAi: (action: LessonAiAction) => void;
  onAskOpen: () => void;
  markPending: boolean;
  onMarkStudied: () => void;
  showDesktopMark?: boolean;
};

export function LessonAsidePanel({
  moduleProgressPercent,
  moduleStepsLabel,
  lessonCompleted,
  difficulty,
  steps,
  lessonReadingPercent,
  allowAiAdaptation,
  aiBusy,
  onRunAi,
  onAskOpen,
  markPending,
  onMarkStudied,
  showDesktopMark = true,
}: LessonAsidePanelProps) {
  return (
    <div className="space-y-4">
      <ProgressTracker
        moduleProgressPercent={moduleProgressPercent}
        moduleStepsLabel={moduleStepsLabel}
        lessonCompleted={lessonCompleted}
        difficulty={difficulty}
        steps={steps}
        lessonReadingPercent={lessonReadingPercent}
      />

      {allowAiAdaptation ? (
        <LearnOsPanel variant="accent" animate={false} className="p-4!">
          <LearnOsEyebrow>AI copilot</LearnOsEyebrow>
          <h3 className="mt-1 font-heading text-sm font-semibold text-foreground">Наставник</h3>
          <p className="mt-1 text-xs text-muted-foreground">Упростить тему или получить пример — без ответов на тест.</p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {AI_BUTTONS.map((b) => (
              <Button
                key={b.action}
                type="button"
                variant="outline"
                size="sm"
                className="h-auto min-h-10 px-2 py-2 text-2.75 leading-snug"
                disabled={aiBusy}
                onClick={() => onRunAi(b.action)}
              >
                {b.label}
              </Button>
            ))}
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="col-span-2 w-full"
              disabled={aiBusy}
              onClick={onAskOpen}
            >
              Спросить AI по этому уроку
            </Button>
          </div>
        </LearnOsPanel>
      ) : null}

      {showDesktopMark && !lessonCompleted ? (
        <Button
          type="button"
          variant="primary"
          className={cn("hidden w-full lg:inline-flex")}
          loading={markPending}
          disabled={markPending}
          onClick={onMarkStudied}
        >
          Отметить как изучено
        </Button>
      ) : null}
    </div>
  );
}
