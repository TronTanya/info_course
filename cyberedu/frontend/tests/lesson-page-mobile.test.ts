import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  LESSON_MOBILE_LAYOUT_MARKERS,
  LESSON_PAGE_BREAKPOINTS_PX,
  LESSON_PAGE_MOBILE_MAX_PX,
} from "@/lib/lesson-page-mobile";
import { lessonContentTableWrapClass } from "@/lib/lesson-content-typography";

const root = join(process.cwd());

function readSrc(relative: string): string {
  return readFileSync(join(root, relative), "utf8");
}

describe("lesson page mobile contract", () => {
  it("documents viewport widths for QA", () => {
    expect(LESSON_PAGE_BREAKPOINTS_PX).toEqual([360, 390, 768, 1024, 1440]);
    expect(LESSON_PAGE_MOBILE_MAX_PX).toBe(1023);
  });

  it("premium layout uses single column until lg and hides sidebar", () => {
    const layout = readSrc("components/lesson/premium/lesson-premium-layout.tsx");
    expect(layout).toContain(LESSON_MOBILE_LAYOUT_MARKERS.layout);
    expect(layout).toContain("grid-cols-1");
    expect(layout).toContain("lg:grid-cols-[minmax(0,1fr)_17.5rem]");
    expect(layout).toContain('hidden min-w-0 lg:block');
    expect(layout).toContain(LESSON_MOBILE_LAYOUT_MARKERS.mobileCta);
    expect(layout).toContain("lg:hidden");
  });

  it("places inline outline and AI mentor below main material on mobile", () => {
    const screen = readSrc("components/lesson/premium/lesson-premium-screen.tsx");
    const outlineIdx = screen.indexOf('placement="inline"');
    const mainIdx = screen.indexOf("<LessonMainContent");
    const aiIdx = screen.indexOf('placement="inline"', outlineIdx + 1);
    const checkpointIdx = screen.indexOf("<MiniCheckpoint");
    expect(outlineIdx).toBeGreaterThan(-1);
    expect(mainIdx).toBeGreaterThan(-1);
    expect(aiIdx).toBeGreaterThan(-1);
    expect(outlineIdx).toBeLessThan(mainIdx);
    expect(mainIdx).toBeLessThan(checkpointIdx);
    expect(checkpointIdx).toBeLessThan(aiIdx);
    expect(screen).toContain(LESSON_MOBILE_LAYOUT_MARKERS.footer);
  });

  it("outline is collapsible on mobile via details", () => {
    const outline = readSrc("components/lesson/lesson-outline.tsx");
    expect(outline).toContain("<details");
    expect(outline).toContain(LESSON_MOBILE_LAYOUT_MARKERS.outlineMobile);
    expect(outline).toContain("lg:hidden");
  });

  it("sticky tabs are not sticky below lg", () => {
    const tabs = readSrc("components/lesson/lesson-sticky-tabs.tsx");
    expect(tabs).toContain("max-lg:relative");
    expect(tabs).toContain("lg:sticky");
  });

  it("table wrap does not use negative horizontal margin", () => {
    expect(lessonContentTableWrapClass).not.toMatch(/-mx-/);
    expect(lessonContentTableWrapClass).toContain("overflow-x-auto");
    expect(lessonContentTableWrapClass).toContain("max-w-full");
  });

  it("globals constrain lesson page overflow on narrow viewports", () => {
    const css = readSrc("app/globals.css");
    expect(css).toContain(".ce-lesson-premium-layout");
    expect(css).toContain("overflow-x: clip");
    expect(css).toContain(".ce-lesson-page__footer");
    expect(css).toContain(".ce-lesson-sticky-tabs");
    expect(css).toMatch(/max-width:\s*1023px/);
  });
});
