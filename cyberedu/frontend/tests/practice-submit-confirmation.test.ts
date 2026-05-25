import { describe, expect, it } from "vitest";
import {
  buildChecklistSubmitSummary,
  buildCombinedSubmitSummary,
  buildTextSubmitSummary,
  formatPracticeSubmitSummaryLines,
  resolvePracticeSubmitEditPolicy,
} from "@/lib/practice-submit-confirmation-ui";

describe("resolvePracticeSubmitEditPolicy", () => {
  it("always reports no inline edit after submit", () => {
    expect(resolvePracticeSubmitEditPolicy(true).canEditAfterSubmit).toBe(false);
    expect(resolvePracticeSubmitEditPolicy(false).canEditAfterSubmit).toBe(false);
  });

  it("mentions resubmit when revision is allowed", () => {
    expect(resolvePracticeSubmitEditPolicy(true).message).toMatch(/доработк/i);
    expect(resolvePracticeSubmitEditPolicy(false).message).toMatch(/нельзя/i);
  });
});

describe("formatPracticeSubmitSummaryLines", () => {
  it("lists text length and files", () => {
    const lines = formatPracticeSubmitSummaryLines({
      textLength: 120,
      attachedFiles: [{ name: "report.pdf", sizeLabel: "1.2 МБ" }],
    });
    expect(lines.some((l) => l.includes("120"))).toBe(true);
    expect(lines.some((l) => l.includes("report.pdf"))).toBe(true);
  });

  it("falls back when summary empty", () => {
    expect(formatPracticeSubmitSummaryLines({})[0]).toMatch(/готов/i);
  });
});

describe("summary builders", () => {
  it("builds text and combined summaries", () => {
    expect(buildTextSubmitSummary("  hello  ").textLength).toBe(5);
    const combined = buildCombinedSubmitSummary("answer text here ok", {
      name: "lab.txt",
      size: 2048,
    } as File);
    expect(combined.textLength).toBeGreaterThan(0);
    expect(combined.attachedFiles?.[0]?.name).toBe("lab.txt");
  });

  it("builds checklist summary", () => {
    const s = buildChecklistSubmitSummary(3, 5, 80);
    expect(s.filledFields?.[0]).toMatch(/3 \/ 5/);
    expect(s.textLength).toBe(80);
  });
});
