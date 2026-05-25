import Link from "next/link";
import type { PracticeLabState } from "@/lib/practice-lab-ui";
import { LearningChecklist, type ChecklistItem } from "@/components/learn/learning-checklist";
import { PracticeAIMentorPanel } from "@/components/practice/practice-ai-mentor-panel";
import type { PracticeMentorChatBoot, PracticeMentorSafeContext } from "@/lib/practice-mentor-panel";
import { ProgressBar } from "@/components/ui/progress-bar";
import { cn } from "@/lib/utils";

export type PracticeLabAsideProps = {
  moduleId: string;
  practicalTaskId: string;
  labState: PracticeLabState;
  checklist: ChecklistItem[];
  attemptCount: number;
  recommendations: string[];
  moduleProgress: { percent: number; completed: number; total: number };
  mentorContext: PracticeMentorSafeContext;
  aiMentorConfigured: boolean;
  onOpenMentorChat: (boot: PracticeMentorChatBoot) => void;
  /** false — панель AI рендерится в main (mobile) отдельным слотом */
  showMentorPanel?: boolean;
  className?: string;
};

export function PracticeLabAside({
  moduleId,
  checklist,
  attemptCount,
  recommendations,
  moduleProgress,
  mentorContext,
  aiMentorConfigured,
  onOpenMentorChat,
  showMentorPanel = true,
  className,
}: PracticeLabAsideProps) {
  return (
    <div className={cn("space-y-5", className)}>
      <aside className="rounded-2xl border border-border/80 bg-card/80 p-4 shadow-card ring-1 ring-border/40 sm:p-5">
        <h2 className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-primary">Чеклист</h2>
        <div className="mt-3">
          <LearningChecklist items={checklist} className="border-0 bg-transparent p-0 ring-0" />
        </div>
      </aside>

      <aside className="rounded-2xl border border-border/80 bg-card/80 p-4 shadow-card sm:p-5">
        <h2 className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Попытки</h2>
        <p className="mt-2 font-display text-2xl font-semibold tabular-nums text-foreground">{attemptCount}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {attemptCount === 0
            ? "Первая попытка — изучите сценарий и перейдите к терминалу."
            : "Учитываются отправки, кроме черновиков."}
        </p>
      </aside>

      <aside className="rounded-2xl border border-primary/20 bg-primary/[0.04] p-4 ring-1 ring-primary/15 sm:p-5">
        <h2 className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-primary">Рекомендации</h2>
        <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground">
          {recommendations.map((line) => (
            <li key={line} className="flex gap-2 before:text-primary before:content-['•']">
              {line}
            </li>
          ))}
        </ul>
      </aside>

      <aside className="rounded-2xl border border-border/80 bg-card/80 p-4 shadow-card sm:p-5">
        <h2 className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Связанные уроки</h2>
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
        <ProgressBar
          className="mt-2"
          value={moduleProgress.percent}
          max={100}
          label={`Прогресс: ${moduleProgress.percent}%`}
          tone={moduleProgress.percent >= 100 ? "success" : "default"}
        />
      </aside>

      {showMentorPanel ? (
        <PracticeAIMentorPanel
          aiConfigured={aiMentorConfigured}
          context={mentorContext}
          onOpenMentorChat={onOpenMentorChat}
        />
      ) : null}
    </div>
  );
}
