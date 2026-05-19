import { describe, expect, it } from "vitest";
import { computeTestMaxScore, formatPassingScore } from "@/lib/test-ui";

describe("test-ui", () => {
  it("computeTestMaxScore skips manual text questions", () => {
    expect(
      computeTestMaxScore([
        { points: 10, manualTextGrading: false },
        { points: 5, manualTextGrading: true },
      ]),
    ).toBe(10);
  });

  it("formatPassingScore shows points and percent", () => {
    expect(formatPassingScore(70, 100)).toBe("70 из 100 б. (70%)");
  });
});
