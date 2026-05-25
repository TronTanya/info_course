import { LESSON_OUTLINE_ANCHORS } from "@/lib/lesson-outline-ui";

export type LessonJourneyStepStatus = "completed" | "current" | "upcoming";

export type LessonJourneyStep = {
  id: string;
  label: string;
  href: string;
  status: LessonJourneyStepStatus;
};

export type BuildLessonJourneyStepsInput = {
  lessonCompleted: boolean;
  readingPercent: number;
  hasKeyTerms: boolean;
  hasLearningBlocks: boolean;
  hasCheckpoint: boolean;
  checkpointAnswered?: boolean;
};

export function buildLessonJourneySteps(input: BuildLessonJourneyStepsInput): LessonJourneyStep[] {
  const { lessonCompleted, readingPercent } = input;
  const r = lessonCompleted ? 100 : readingPercent;

  const steps: Omit<LessonJourneyStep, "status">[] = [
    { id: "goals", label: "Цели", href: `#${LESSON_OUTLINE_ANCHORS.goals}` },
  ];

  if (input.hasKeyTerms) {
    steps.push({ id: "terms", label: "Термины", href: `#${LESSON_OUTLINE_ANCHORS.terms}` });
  }

  steps.push(
    { id: "material", label: "Материал", href: `#${LESSON_OUTLINE_ANCHORS.material}` },
  );

  if (input.hasLearningBlocks) {
    steps.push({ id: "reinforce", label: "Закрепление", href: "#lesson-key-ideas" });
  }

  if (input.hasCheckpoint) {
    steps.push({
      id: "checkpoint",
      label: "Самопроверка",
      href: `#${LESSON_OUTLINE_ANCHORS.checkpoint}`,
    });
  }

  steps.push({
    id: "complete",
    label: "Завершение",
    href: `#${LESSON_OUTLINE_ANCHORS.completion}`,
  });

  const thresholds: Record<string, number> = {
    goals: 8,
    terms: 18,
    material: 35,
    reinforce: 55,
    checkpoint: 72,
    complete: 88,
  };

  if (lessonCompleted) {
    return steps.map((step) => ({ ...step, status: "completed" as const }));
  }

  let currentIndex = 0;
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i]!;
    const threshold = thresholds[step.id] ?? 50;
    if (r >= threshold) currentIndex = Math.min(i + 1, steps.length - 1);
  }

  return steps.map((step, index) => {
    if (input.checkpointAnswered && step.id === "checkpoint") {
      return { ...step, status: "completed" as const };
    }
    if (index < currentIndex) return { ...step, status: "completed" as const };
    if (index === currentIndex) return { ...step, status: "current" as const };
    return { ...step, status: "upcoming" as const };
  });
}
