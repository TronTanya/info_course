import { describe, expect, it } from "vitest";
import {
  getLessonReadingTimeLabel,
  getLessonStatusView,
  limitSelfCheckItems,
} from "@/lib/lesson-premium-ui";

describe("getLessonStatusView", () => {
  it("marks completed lessons", () => {
    expect(getLessonStatusView("completed", 100).tone).toBe("completed");
  });
});

describe("getLessonReadingTimeLabel", () => {
  it("formats reading estimate", () => {
    expect(getLessonReadingTimeLabel(12, false)).toMatch(/мин/);
  });
});

describe("limitSelfCheckItems", () => {
  it("caps checkpoint count", () => {
    const items = [
      { question: "Q1" },
      { question: "Q2" },
      { question: "Q3" },
      { question: "Q4" },
    ];
    expect(limitSelfCheckItems(items, 3)).toHaveLength(3);
  });
});
