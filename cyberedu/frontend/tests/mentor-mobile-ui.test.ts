import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = join(import.meta.dirname, "..");

function read(rel: string): string {
  return readFileSync(join(root, rel), "utf8");
}

describe("mentor mobile UX (stage 17)", () => {
  it("globals define mobile mentor layout tokens", () => {
    const css = read("app/globals.css");
    expect(css).toContain(".ce-ai-mentor-dialog");
    expect(css).toContain(".ce-mentor-messages");
    expect(css).toContain(".ce-mentor-footer--composer");
    expect(css).toContain(".ce-mentor-theme");
    expect(css).toContain("--mentor-fg");
    expect(css).toContain(".dark .ce-mentor-theme");
  });

  it("floating chat uses viewport inset and hides FAB when open on mobile", () => {
    const chat = read("components/ai/AiMentorChat.tsx");
    expect(chat).toContain("useVisualViewportInset");
    expect(chat).toContain("ce-ai-mentor-dialog");
    expect(chat).toContain("max-lg:invisible");
    expect(chat).toContain("ce-ai-mentor-backdrop");
  });

  it("floating chat does not auto-open on initial openSignal 0", () => {
    const chat = read("components/ai/AiMentorChat.tsx");
    expect(chat).toContain("prevOpenSignal");
    expect(chat).not.toMatch(
      /openSignal\][^\n]*\n[^\n]*queueMicrotask\(\(\) => setOpen\(true\)\)/,
    );
  });

  it("panel keeps composer at bottom with compact starter tools when empty", () => {
    const panel = read("components/ai/ai-mentor-chat-panel.tsx");
    const composer = read("components/ai/mentor/mentor-composer.tsx");
    const starterIdx = panel.indexOf("ce-mentor-starter");
    const composerIdx = panel.indexOf("<MentorComposer");
    expect(starterIdx).toBeGreaterThan(-1);
    expect(composerIdx).toBeGreaterThan(starterIdx);
    expect(panel).toContain('variant="compact"');
    expect(panel).toContain("ce-mentor-messages");
    expect(composer).toContain("ce-mentor-send");
    expect(panel).not.toContain("<MentorMemoryStrip");
  });

  it("lesson mentor is inline on mobile and sidebar only on lg+", () => {
    const lesson = read("components/lesson/premium/lesson-ai-mentor-panel.tsx");
    const screen = read("components/lesson/premium/lesson-premium-screen.tsx");
    expect(lesson).toContain('placement === "inline" && "lg:hidden"');
    expect(lesson).toContain('placement === "sidebar" && "hidden lg:block"');
    expect(screen).toContain("lg:hidden");
    expect(screen).toContain('placement="inline"');
  });

  it("practice mentor renders below main on mobile and in aside on lg+", () => {
    const session = read("components/practice/practice-lab-task-session.tsx");
    const layout = read("components/layout/practice-lab-layout.tsx");
    expect(session).toContain("mobileAfterMain={mentorPanel}");
    expect(session).toContain("hidden min-w-0 lg:block");
    expect(layout).toContain("MobileDrawer");
    expect(layout).toContain("practice-layout-mobile-footer");
  });
});
