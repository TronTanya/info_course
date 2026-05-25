import { describe, expect, it } from "vitest";
import { buildLessonJourneySteps } from "@/lib/lesson-journey-ui";

describe("buildLessonJourneySteps", () => {
  it("marks all completed when lesson finished", () => {
    const steps = buildLessonJourneySteps({
      lessonCompleted: true,
      readingPercent: 40,
      hasKeyTerms: true,
      hasLearningBlocks: false,
      hasCheckpoint: true,
    });
    expect(steps.every((s) => s.status === "completed")).toBe(true);
  });

  it("includes terms step when key terms exist", () => {
    const steps = buildLessonJourneySteps({
      lessonCompleted: false,
      readingPercent: 0,
      hasKeyTerms: true,
      hasLearningBlocks: false,
      hasCheckpoint: false,
    });
    expect(steps.some((s) => s.id === "terms")).toBe(true);
    expect(steps[0]?.status).toBe("current");
  });
});
