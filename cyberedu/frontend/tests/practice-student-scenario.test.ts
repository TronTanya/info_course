import { describe, expect, it } from "vitest";
import { sanitizeScenarioDataForStudent } from "@/lib/practice-student-scenario";
import { buildPracticeGradingSummary } from "@/lib/practice-grading-ui";
import { mapSubmissionToDisplayStatus } from "@/lib/practice-submission-status-ui";

describe("practice-student-scenario", () => {
  it("strips answer keys from scenarioData", () => {
    const raw = {
      hints: ["Подсказка 1"],
      situations: [{ id: "s1", text: "Ситуация", expected: "yes" }],
      correctFlagIds: ["a", "b"],
      items: [{ id: "i1", sample: "pass", expectedStrength: "weak" }],
      hiddenRubric: { criteria: [] },
      privateStoragePath: "/data/secret.pdf",
    };
    const safe = sanitizeScenarioDataForStudent(raw) as Record<string, unknown>;
    expect(safe.hints).toEqual(["Подсказка 1"]);
    expect((safe.situations as { expected?: string }[])[0]?.expected).toBeUndefined();
    expect(safe.correctFlagIds).toBeUndefined();
    expect((safe.items as { expectedStrength?: string }[])[0]?.expectedStrength).toBeUndefined();
    expect(safe.hiddenRubric).toBeUndefined();
    expect(safe.privateStoragePath).toBeUndefined();
  });
});

describe("practice-grading-ui", () => {
  it("does not mention regex or expected command", () => {
    const summary = buildPracticeGradingSummary({
      taskType: "TRAINING_CONSOLE",
      checkType: "AUTO",
      maxScore: 10,
      minLength: 20,
      hasInteractiveAutoCheck: true,
      hasStructuredCommandStep: true,
      hasStructuredExplanationStep: true,
    });
    expect(summary.bullets.join(" ")).not.toMatch(/ping|regex|эталон.*ping/i);
    expect(summary.bullets.some((b) => b.includes("эталонная команда не показывается"))).toBe(true);
  });
});

describe("practice-submission-status-ui", () => {
  it("maps server statuses to display labels", () => {
    expect(mapSubmissionToDisplayStatus("CHECKING")).toBe("pending_review");
    expect(mapSubmissionToDisplayStatus("SUBMITTED")).toBe("submitted");
    expect(mapSubmissionToDisplayStatus("ACCEPTED")).toBe("approved");
    expect(mapSubmissionToDisplayStatus("NEEDS_REVISION")).toBe("needs_retry");
  });
});
