import { describe, expect, it } from "vitest";
import { normalizeMentorMarkdownSource } from "@/components/ai/mentor/mentor-markdown";
import {
  normalizeUnpairedBoldMarkers,
  stripInlineHeadingMarkers,
  stripResidualMarkdownAsterisks,
} from "@/lib/markdown-inline";

describe("mentor markdown headings", () => {
  it("unwraps bold-wrapped h4 lines", () => {
    expect(normalizeMentorMarkdownSource("**#### 1. Что такое**\n\nТекст.")).toBe(
      "#### 1. Что такое\n\nТекст.",
    );
  });

  it("strips inline heading markers from paragraph fragments", () => {
    expect(stripInlineHeadingMarkers("#### остаток строки")).toBe("остаток строки");
  });
});

describe("mentor markdown asterisks", () => {
  it("removes unpaired double asterisks", () => {
    expect(normalizeUnpairedBoldMarkers("**Аналогия (")).toBe("Аналогия (");
  });

  it("strips residual asterisks after parsing gaps", () => {
    expect(stripResidualMarkdownAsterisks("текст * хвост")).toBe("текст  хвост");
    expect(stripResidualMarkdownAsterisks("**")).toBe("");
  });
});
