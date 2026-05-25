import type { LessonStatusView } from "@/lib/lesson-premium-ui";
import { LessonHeader, type LessonHeaderProps, type LessonHeaderStatus } from "@/components/lesson/lesson-header";

export type LessonPremiumHeaderProps = {
  moduleOrderNumber: number;
  lessonOrderLabel?: string;
  lessonTitle: string;
  description: string | null;
  readingTimeLabel: string;
  difficulty: string;
  status: LessonStatusView;
  readingPercent: number;
  onAskMentor?: () => void;
  className?: string;
  courseTitle?: string;
  courseHref?: string;
  moduleTitle?: string;
  moduleHref?: string;
  continueHref?: string | null;
};

function mapStatus(status: LessonStatusView): LessonHeaderStatus {
  return { tone: status.tone, label: status.label, hint: status.hint };
}

/** @deprecated Используйте `LessonHeader` с полным набором props. */
export function LessonPremiumHeader({
  moduleOrderNumber,
  lessonOrderLabel = "Урок 1",
  lessonTitle,
  description,
  readingTimeLabel,
  difficulty,
  status,
  readingPercent,
  onAskMentor,
  className,
  courseHref = "/dashboard/course",
  continueHref = null,
}: LessonPremiumHeaderProps) {
  const lessonNumber = Number.parseInt(lessonOrderLabel.replace(/\D/g, ""), 10) || 1;

  const props: LessonHeaderProps = {
    courseHref,
    moduleNumber: moduleOrderNumber,
    lessonNumber,
    lessonTitle,
    description,
    readingTimeLabel,
    status: mapStatus(status),
    readingPercent,
    lessonCompleted: status.tone === "completed",
    continueHref,
    difficulty,
    onAskMentor,
    className,
  };

  return <LessonHeader {...props} />;
}
