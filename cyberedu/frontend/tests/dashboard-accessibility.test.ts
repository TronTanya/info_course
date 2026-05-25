import { describe, expect, it } from "vitest";
import { motionWithReducedMotion, motionPresets } from "@/lib/design-system/motion";

describe("dashboard accessibility helpers", () => {
  it("motionWithReducedMotion disables entrance animation when reduced motion is preferred", () => {
    const reduced = motionWithReducedMotion(motionPresets.fadeIn, true);
    expect(reduced.initial).toBe(false);
    expect(reduced.transition).toEqual({ duration: 0 });
  });

  it("motionWithReducedMotion keeps preset when motion is allowed", () => {
    const normal = motionWithReducedMotion(motionPresets.fadeIn, false);
    expect(normal.initial).toEqual(motionPresets.fadeIn.initial);
  });
});
