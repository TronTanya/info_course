import { describe, expect, it } from "vitest";
import { parsePracticeScenario } from "@/lib/practice-scenario-parse";
import { getPracticeLabState } from "@/lib/practice-lab-ui";

describe("practice-scenario-parse", () => {
  it("extracts hints and criteria from scenarioData without answers", () => {
    const parsed = parsePracticeScenario(
      "Описание лаборатории.",
      "Выполните анализ.",
      "log line 1",
      { hints: ["Подсказка 1", "Подсказка 2"], criteria: "Совпадение с эталоном." },
    );
    expect(parsed.hintLevels).toHaveLength(2);
    expect(parsed.expectedOutcome).toContain("эталон");
    expect(parsed.inputData).toBeNull();
    expect(parsed.evidence.some((e) => e.kind === "log" && e.lines.includes("log line 1"))).toBe(true);
  });

  it("builds URL evidence for URL_ANALYSIS without verdicts", () => {
    const parsed = parsePracticeScenario("", null, null, null, "URL_ANALYSIS");
    expect(parsed.evidence.some((e) => e.kind === "url_list")).toBe(true);
    const urls = parsed.evidence.find((e) => e.kind === "url_list");
    if (urls && urls.kind === "url_list") {
      expect(urls.urls.every((u) => u.href.startsWith("http"))).toBe(true);
    }
  });

  it("maps submission statuses to lab states", () => {
    expect(getPracticeLabState({ status: "ACCEPTED" })).toBe("passed");
    expect(getPracticeLabState({ status: "SUBMITTED" })).toBe("submitted");
    expect(getPracticeLabState({ status: "NEEDS_REVISION" })).toBe("needs_review");
  });
});
