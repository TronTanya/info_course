import { LessonCompletionCard, type LessonCompletionCardProps } from "@/components/lesson/lesson-completion-card";

export type LessonCompletionCtaProps = LessonCompletionCardProps;

/** @deprecated Используйте `LessonCompletionCard`. */
export function LessonCompletionCta(props: LessonCompletionCtaProps) {
  return <LessonCompletionCard {...props} />;
}
