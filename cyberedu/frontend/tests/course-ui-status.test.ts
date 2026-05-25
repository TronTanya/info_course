import { describe, expect, it } from "vitest";
import type { CourseProgressModuleRow, ProgressRow } from "@/lib/progress";
import {
  buildRoadmapInnerSteps,
  COURSE_LOCKED_MODULE_REASON,
  getInnerStepEntityStatus,
  getModuleContinueCta,
  getModuleEntityStatus,
  mapSubmissionStatusToCourseUi,
} from "@/lib/course-ui-status";

function row(over: Partial<CourseProgressModuleRow> = {}): CourseProgressModuleRow {
  return {
    module: { id: "m1", title: "M1", description: null, orderNumber: 1, ...over.module },
    requirements: {
      lessonRequired: true,
      videoRequired: false,
      testRequired: true,
      practiceRequired: true,
      totalSteps: 3,
      ...over.requirements,
    },
    contentCounts: { lessons: 1, tests: 1, practices: 1, ...over.contentCounts },
    progress: over.progress ?? null,
    unlocked: over.unlocked ?? true,
    progressPercent: over.progressPercent ?? 0,
    score: over.score ?? 0,
    moduleCompleted: over.moduleCompleted ?? false,
    ...over,
  };
}

describe("mapSubmissionStatusToCourseUi", () => {
  it("maps review and retry states", () => {
    expect(mapSubmissionStatusToCourseUi("SUBMITTED")).toBe("pending_review");
    expect(mapSubmissionStatusToCourseUi("CHECKING")).toBe("pending_review");
    expect(mapSubmissionStatusToCourseUi("NEEDS_REVISION")).toBe("needs_retry");
    expect(mapSubmissionStatusToCourseUi("REJECTED")).toBe("needs_retry");
    expect(mapSubmissionStatusToCourseUi("ACCEPTED")).toBeNull();
  });
});

describe("getModuleEntityStatus", () => {
  it("locked module uses standard reason via hint", () => {
    const modules = [
      row({ moduleCompleted: true }),
      row({ unlocked: false, module: { id: "m2", title: "M2", description: null, orderNumber: 2 } }),
    ];
    expect(getModuleEntityStatus(modules[1]!)).toBe("locked");
  });

  it("pending_review when practice awaiting check", () => {
    expect(
      getModuleEntityStatus(
        row({
          practicePendingReview: true,
          progress: { lessonCompleted: true, videoCompleted: false, testCompleted: true, practiceCompleted: false } as ProgressRow,
        }),
      ),
    ).toBe("pending_review");
  });

  it("needs_retry when test retry flag set", () => {
    expect(
      getModuleEntityStatus(
        row({
          testNeedsRetry: true,
          progress: { lessonCompleted: true, videoCompleted: false, testCompleted: false, practiceCompleted: false } as ProgressRow,
        }),
      ),
    ).toBe("needs_retry");
  });

  it("completed CTA opens module hub", () => {
    const cta = getModuleContinueCta(row({ moduleCompleted: true }));
    expect(cta.label).toBe("Открыть");
    expect(cta.href).toBe("/dashboard/course/m1");
    expect(cta.disabled).toBe(false);
  });

  it("locked CTA has no href", () => {
    const cta = getModuleContinueCta(row({ unlocked: false }));
    expect(cta.disabled).toBe(true);
    expect(cta.href).toBeNull();
  });

  it("pending_review CTA links to practice", () => {
    const cta = getModuleContinueCta(
      row({
        practicePendingReview: true,
        progress: { lessonCompleted: true, testCompleted: true, practiceCompleted: false } as ProgressRow,
      }),
    );
    expect(cta.label).toBe("Посмотреть отправку");
    expect(cta.href).toContain("/practice");
  });
});

describe("buildRoadmapInnerSteps", () => {
  it("does not link locked test", () => {
    const steps = buildRoadmapInnerSteps(row());
    const test = steps.find((s) => s.kind === "test");
    expect(test?.status).toBe("locked");
    expect(test?.href).toBeNull();
  });

  it("uses standard locked copy for modules", () => {
    expect(COURSE_LOCKED_MODULE_REASON).toContain("предыдущий модуль");
  });

  it("practice pending_review when flagged", () => {
    const steps = buildRoadmapInnerSteps(
      row({
        practicePendingReview: true,
        progress: { lessonCompleted: true, testCompleted: true, practiceCompleted: false } as ProgressRow,
      }),
    );
    expect(steps.find((s) => s.kind === "practice")?.status).toBe("pending_review");
  });
});

describe("getInnerStepEntityStatus", () => {
  it("marks available lesson before start", () => {
    expect(getInnerStepEntityStatus(row(), "lesson")).toBe("available");
  });
});
