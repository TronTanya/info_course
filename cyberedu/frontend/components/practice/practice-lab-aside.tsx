import Link from "next/link";
import type { PracticeLabState } from "@/lib/practice-lab-ui";
import { LearningChecklist, type ChecklistItem } from "@/components/learn/learning-checklist";
import { PracticeSocraticHintPanel } from "@/components/practice/practice-socratic-hint";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type PracticeLabAsideProps = {
  moduleId: string;
  practicalTaskId: string;
  labState: PracticeLabState;
  checklist: ChecklistItem[];
  attemptCount: number;
  recommendations: string[];
  moduleProgress: { percent: number; completed: number; total: number };
  onOpenAiChat: () => void;
  className?: string;
};

export function PracticeLabAside({
  moduleId,
  practicalTaskId,
  labState,
  checklist,
  attemptCount,
  recommendations,
  moduleProgress,
  onOpenAiChat,
  className,
}: PracticeLabAsideProps) {
  return (
    <div className={cn("space-y-5", className)}>
      <aside className="ce-mission-panel p-4 sm:p-5">
        <h2 className="ce-learn-os-eyebrow">Mission checklist</h2>
        <div className="mt-3">
          <LearningChecklist items={checklist} className="border-0 bg-transparent p-0 ring-0" />
        </div>
      </aside>

      <aside className="ce-mission-panel p-4 sm:p-5">
        <h2 className="ce-learn-os-eyebrow text-muted-foreground">Attempts</h2>
        <p className="mt-2 font-display text-2xl font-semibold tabular-nums text-foreground">{attemptCount}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {attemptCount === 0
            ? "Первая попытка — изучите сценарий и перейдите к терминалу."
            : "Учитываются отправки, кроме черновиков."}
        </p>
      </aside>

      <aside className="ce-mission-panel ce-learn-os-panel--glow p-4 sm:p-5">
        <h2 className="ce-learn-os-eyebrow">AI intel</h2>
        <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground">
          {recommendations.map((line) => (
            <li key={line} className="flex gap-2 before:text-primary before:content-['•']">
              {line}
            </li>
          ))}
        </ul>
      </aside>

      <aside className="ce-mission-panel p-4 sm:p-5">
        <h2 className="ce-learn-os-eyebrow text-muted-foreground">Linked ops</h2>
        <ul className="mt-3 space-y-2 text-sm">
          <li>
            <Link href={`/dashboard/course/${moduleId}/lesson`} className="font-medium text-primary hover:underline">
              Лекция модуля
            </Link>
          </li>
          <li>
            <Link href={`/dashboard/course/${moduleId}/test`} className="text-muted-foreground hover:text-primary hover:underline">
              Тест модуля
            </Link>
          </li>
          <li>
            <Link href={`/dashboard/course/${moduleId}`} className="text-muted-foreground hover:text-primary hover:underline">
              Обзор модуля
            </Link>
          </li>
        </ul>
        <p className="mt-3 text-xs text-muted-foreground">Прогресс модуля: {moduleProgress.completed} / {moduleProgress.total}</p>
        <div className="mt-3 space-y-1.5">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Mission progress</span>
            <span className="font-mono tabular-nums text-foreground">{moduleProgress.percent}%</span>
          </div>
          <div className="ce-mission-progress-track">
            <div className="ce-mission-progress-fill" style={{ width: `${moduleProgress.percent}%` }} />
          </div>
        </div>
      </aside>

      <aside
        className={cn(
          "ce-mission-panel p-4 sm:p-5",
          labState === "passed" && "ce-learn-mission-card--complete",
        )}
      >
        <h2 className="ce-learn-os-eyebrow">Hint protocol</h2>
        <p className="mt-2 text-xs text-muted-foreground">Наводящие вопросы без готового ответа на практику.</p>
        <PracticeSocraticHintPanel
          moduleId={moduleId}
          practicalTaskId={practicalTaskId}
          className="mt-3 border-0 bg-transparent p-0 shadow-none"
        />
        <Button type="button" variant="primary" className="mt-4 w-full" onClick={onOpenAiChat}>
          AI-наставник
        </Button>
      </aside>
    </div>
  );
}
