import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

function readSrc(rel: string): string {
  return readFileSync(join(process.cwd(), rel), "utf8");
}

describe("scroll-into-container", () => {
  it("outline sync does not call scrollIntoView on active link", () => {
    const outline = readSrc("components/lesson/lesson-outline.tsx");
    expect(outline).toContain("scrollElementWithinNearestContainer");
    expect(outline).not.toMatch(/scrollActiveLinkIntoView[\s\S]*scrollIntoView/);
  });

  it("section nav sync scrolls inside horizontal strip only", () => {
    const nav = readSrc("components/lesson/lesson-section-nav.tsx");
    expect(nav).toMatch(
      /scrollLinkIntoView[\s\S]{0,280}scrollElementWithinNearestContainer/,
    );
  });
});
