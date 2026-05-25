import { describe, expect, it } from "vitest";
import { AnalyticsEvents } from "@/lib/analytics/events";
import { parseLearnHrefIds, sanitizeAnalyticsProps } from "@/lib/analytics/payload";

describe("sanitizeAnalyticsProps", () => {
  it("keeps only allowlisted opaque ids and source", () => {
    expect(
      sanitizeAnalyticsProps({
        moduleId: "mod_abc12345",
        lessonId: "les_xyz98765",
        source: "module_card",
        ...({ email: "user@test.com", answer: "secret" } as Record<string, string>),
      }),
    ).toEqual({
      moduleId: "mod_abc12345",
      lessonId: "les_xyz98765",
      source: "module_card",
    });
  });

  it("drops invalid ids and empty props", () => {
    expect(sanitizeAnalyticsProps({ moduleId: "x", source: "bad source!" })).toBeUndefined();
  });
});

describe("parseLearnHrefIds", () => {
  it("parses module and practice paths", () => {
    expect(parseLearnHrefIds("/dashboard/course/mod_abc12345/practice/prac_def67890")).toEqual({
      moduleId: "mod_abc12345",
      practiceId: "prac_def67890",
    });
  });

  it("parses module hub without step", () => {
    expect(parseLearnHrefIds("/dashboard/course/mod_abc12345")).toEqual({
      moduleId: "mod_abc12345",
    });
  });
});

describe("AnalyticsEvents", () => {
  it("exposes stable event names", () => {
    expect(AnalyticsEvents.testStarted).toBe("test_started");
    expect(AnalyticsEvents.certificateProgressOpened).toBe("certificate_progress_opened");
  });
});
