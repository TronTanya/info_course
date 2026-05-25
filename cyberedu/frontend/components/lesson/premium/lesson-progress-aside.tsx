import { ProgressTracker } from "@/components/lesson/lesson-ui/progress-tracker";
import type { LearningNavStepItem } from "@/lib/learning-nav";

export type LessonProgressAsideProps = {
  moduleProgressPercent: number;
  moduleStepsLabel: string;
  lessonCompleted: boolean;
  difficulty: string;
  steps: LearningNavStepItem[];
  lessonReadingPercent?: number;
};

export function LessonProgressAside(props: LessonProgressAsideProps) {
  return (
    <div className="border-t border-border/60 pt-3">
      <ProgressTracker {...props} />
    </div>
  );
}
