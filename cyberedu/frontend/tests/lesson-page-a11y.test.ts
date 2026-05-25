import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  LESSON_LOCKED_REASON_ID,
  LESSON_PAGE_MAIN_ID,
  LESSON_PAGE_TITLE_ID,
  LESSON_READING_PROGRESS_LABEL_ID,
  checkpointReactionStatusLabel,
  lessonNavLockReasonId,
} from "@/lib/lesson-page-a11y";
import { LESSON_CALLOUT_HEADINGS } from "@/lib/lesson-callout-types";
import { buildCheckpointReaction } from "@/lib/mini-checkpoint-ui";

const root = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(root, relative), "utf8");
}

describe("lesson page a11y constants", () => {
  it("exposes stable ids for h1 and main landmark", () => {
    expect(LESSON_PAGE_TITLE_ID).toBe("lesson-page-title");
    expect(LESSON_PAGE_MAIN_ID).toBe("lesson-page-main");
    expect(LESSON_LOCKED_REASON_ID).toBe("lesson-locked-reason");
    expect(LESSON_READING_PROGRESS_LABEL_ID).toBe("lesson-reading-progress-label");
  });

  it("builds unique nav lock reason ids", () => {
    expect(lessonNavLockReasonId("test")).toBe("lesson-nav-lock-test");
  });

  it("checkpoint status labels are textual, not color-only", () => {
    expect(checkpointReactionStatusLabel("positive")).toBe("Верно");
    expect(checkpointReactionStatusLabel("reflect")).toBe("Почти");
    const reaction = buildCheckpointReaction("yes", "Пояснение", "Отлично");
    expect(reaction.statusLabel).toBe("Верно");
    expect(reaction.feedback).not.toMatch(/^Верно\./);
  });
});

describe("LESSON_CALLOUT_HEADINGS", () => {
  it("provides visible text labels for every callout type", () => {
    expect(Object.values(LESSON_CALLOUT_HEADINGS).every((h) => h.length > 2)).toBe(true);
  });
});

describe("lesson page a11y markup contract", () => {
  it("uses a single h1 in lesson header", () => {
    const header = readSrc("components/lesson/lesson-header.tsx");
    expect(header.match(/<h1\b/g)?.length).toBe(1);
    expect(header).toContain("LESSON_PAGE_TITLE_ID");
  });

  it("main landmark references page title", () => {
    const layout = readSrc("components/lesson/premium/lesson-premium-layout.tsx");
    expect(layout).toContain("LESSON_PAGE_MAIN_ID");
    expect(layout).toContain("LESSON_PAGE_TITLE_ID");
    expect(layout).toContain('aria-label="Оглавление и AI-наставник"');
  });

  it("premium content uses article inside main", () => {
    const screen = readSrc("components/lesson/premium/lesson-premium-screen.tsx");
    expect(screen).toContain("<article");
    expect(screen).toContain('aria-labelledby="lesson-main-heading"');
  });

  it("structured lesson text uses article and heading levels", () => {
    const structured = readSrc("components/lesson/lesson-structured-text.tsx");
    expect(structured).toContain("<article");
    expect(structured).toContain("<h2");
    expect(structured).toContain("<h3");
  });

  it("mini checkpoint supports keyboard and live feedback", () => {
    const cp = readSrc("components/lesson/mini-checkpoint.tsx");
    expect(cp).toContain('role="radiogroup"');
    expect(cp).toContain("onKeyDown={handleGroupKeyDown}");
    expect(cp).toContain('aria-live="polite"');
    expect(cp).toContain('role="progressbar"');
    expect(cp).toContain("focus-visible:ring-2");
  });

  it("navigation exposes lock reasons to assistive tech", () => {
    const nav = readSrc("components/lesson/lesson-navigation.tsx");
    expect(nav).toContain("<nav");
    expect(nav).toContain("aria-describedby={lockReasonId}");
    expect(nav).toContain("lessonNavLockReasonId");
  });

  it("header exposes locked reason id", () => {
    const header = readSrc("components/lesson/lesson-header.tsx");
    expect(header).toContain("LESSON_LOCKED_REASON_ID");
    expect(header).toContain("aria-describedby");
  });

  it("reading progress uses progressbar with label", () => {
    const bar = readSrc("components/lesson/lesson-reading-progress.tsx");
    expect(bar).toContain('role="progressbar"');
    expect(bar).toContain("LESSON_READING_PROGRESS_LABEL_ID");
  });

  it("globals define focus and reduced motion for lesson page", () => {
    const css = readSrc("app/globals.css");
    expect(css).toContain(".ce-lesson-premium-layout a:focus-visible");
    expect(css).toContain("prefers-reduced-motion: reduce");
    expect(css).toContain(".ce-lesson-premium-layout .text-muted-foreground");
  });
});
