import { describe, expect, it } from "vitest";
import {
  difficultyToSecurityLevel,
  resolveSafeResponseState,
  securityLevelLabel,
} from "@/lib/ai/mentor-ui/badges";
import { getSuggestedPrompts } from "@/lib/ai/mentor-ui/suggested-prompts";
import { resolveMentorContextKind } from "@/lib/ai/mentor-ui/context";

describe("mentor-ui", () => {
  it("resolves context kind", () => {
    expect(resolveMentorContextKind({ lessonId: "l1" })).toBe("lesson");
    expect(resolveMentorContextKind({ practicalTaskId: "p1" })).toBe("practice");
  });

  it("maps difficulty to security level labels", () => {
    expect(securityLevelLabel(difficultyToSecurityLevel("advanced"))).toBe("Specialist");
  });

  it("flags policy responses", () => {
    expect(
      resolveSafeResponseState({
        topic: "offensive_request",
        difficulty: "beginner",
        recommendations: [],
        refused: true,
        refusalCode: "offensive_attack",
      }),
    ).toBe("refusal");
  });

  it("returns prompts per context", () => {
    expect(getSuggestedPrompts("lesson").length).toBeGreaterThan(0);
    expect(getSuggestedPrompts("practice")[0].text).toMatch(/практическ/i);
  });
});
