"use client";

import type { LearningPageContext } from "@/lib/learning-context";
import { LessonPremiumScreen } from "@/components/lesson/premium/lesson-premium-screen";
import type { LessonViewModel } from "@/types/lesson-view-model";

export type LessonAiSnapshotClient = {
  id: string;
  adaptedContent: string;
  interestsUsed: string;
  createdAt: string;
} | null;

export type LessonPageClientProps = {
  moduleId: string;
  moduleProgressPercent: number;
  moduleStepsLabel: string;
  learning: LearningPageContext;
  view: LessonViewModel;
    videoUrl: string | null;
    allowAiAdaptation: boolean;
  /** OPENAI_API_KEY / AI_API_KEY на сервере. */
  mentorAiConfigured: boolean;
  explanationAdaptation: LessonAiSnapshotClient;
  summaryAdaptation: LessonAiSnapshotClient;
};

/** Premium learning screen — см. `components/lesson/premium/`. */
export function LessonPageClient(props: LessonPageClientProps) {
  return <LessonPremiumScreen {...props} />;
}
