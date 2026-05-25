import { describe, expect, it } from "vitest";
import {
  buildLessonCompletionNextSteps,
  canShowLessonMarkComplete,
  isLessonCompletionLocked,
  lessonStatusLabel,
} from "@/lib/lesson-completion-ui";

describe("lesson-completion-ui", () => {
  it("lessonStatusLabel maps statuses", () => {
    expect(lessonStatusLabel("completed")).toBe("Завершено");
    expect(lessonStatusLabel("in_progress")).toBe("В процессе");
  });

  it("locks next steps until lesson completed", () => {
    const steps = buildLessonCompletionNextSteps({
      courseTitle: "Кибербезопасность",
      nextLesson: null,
      nextTest: { title: "Тест", href: "/test", disabled: false },
      nextPractice: null,
      hasTest: true,
      hasPractice: false,
      canAccessTest: false,
      canAccessPractice: false,
      lessonCompleted: false,
    });
    const test = steps.find((s) => s.id === "test");
    expect(test?.available).toBe(false);
    expect(steps.find((s) => s.id === "course")?.available).toBe(true);
  });

  it("canShowLessonMarkComplete blocks completed, locked, and pending", () => {
    expect(
      canShowLessonMarkComplete({
        lessonStatus: "in_progress",
        lessonCompleted: false,
        canMarkComplete: true,
        markPending: false,
      }),
    ).toBe(true);
    expect(
      canShowLessonMarkComplete({
        lessonStatus: "completed",
        lessonCompleted: true,
        canMarkComplete: true,
        markPending: false,
      }),
    ).toBe(false);
    expect(
      canShowLessonMarkComplete({
        lessonStatus: "locked",
        lessonCompleted: false,
        canMarkComplete: true,
        markPending: false,
      }),
    ).toBe(false);
    expect(isLessonCompletionLocked("locked")).toBe(true);
  });

  it("opens test after completion when allowed", () => {
    const steps = buildLessonCompletionNextSteps({
      courseTitle: "Кибербезопасность",
      nextLesson: null,
      nextTest: { title: "Тест", href: "/test", disabled: false },
      nextPractice: null,
      hasTest: true,
      hasPractice: false,
      canAccessTest: true,
      canAccessPractice: false,
      lessonCompleted: true,
    });
    expect(steps.find((s) => s.id === "test")?.available).toBe(true);
  });
});
