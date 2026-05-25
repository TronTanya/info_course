import { describe, expect, it } from "vitest";
import type { CourseProgressModuleRow, ProgressRow } from "@/lib/progress";
import {
  ROADMAP_PREVIEW_MAX,
  ROADMAP_PREVIEW_STATUS_LABELS,
  buildRoadmapPreviewItems,
  mapEntityStatusToRoadmapPreviewStatus,
  resolveRoadmapPreviewCta,
} from "@/lib/roadmap-preview";

function moduleRow(over: Partial<CourseProgressModuleRow> & { id?: string }): CourseProgressModuleRow {
  const id = over.id ?? "m1";
  return {
    module: { id, title: `Module ${id}`, description: null, orderNumber: over.module?.orderNumber ?? 1 },
    requirements: {
      lessonRequired: true,
      videoRequired: false,
      testRequired: true,
      practiceRequired: false,
      totalSteps: 2,
      ...over.requirements,
    },
    contentCounts: { lessons: 1, tests: 1, practices: 0, ...over.contentCounts },
    progress:
      over.progress ??
      ({
        lessonCompleted: false,
        videoCompleted: false,
        testCompleted: false,
        practiceCompleted: false,
        moduleCompleted: false,
      } as ProgressRow),
    unlocked: over.unlocked ?? true,
    progressPercent: 0,
    score: 0,
    moduleCompleted: over.moduleCompleted ?? false,
    ...over,
  };
}

describe("roadmap-preview", () => {
  it("maps entity statuses to dashboard roadmap statuses", () => {
    expect(mapEntityStatusToRoadmapPreviewStatus("completed")).toBe("completed");
    expect(mapEntityStatusToRoadmapPreviewStatus("pending_review")).toBe("in_progress");
    expect(mapEntityStatusToRoadmapPreviewStatus("locked")).toBe("locked");
  });

  it("resolveRoadmapPreviewCta uses spec labels", () => {
    const locked = moduleRow({ id: "m2", unlocked: false });
    expect(resolveRoadmapPreviewCta(locked, "locked")).toMatchObject({
      label: "Заблокировано",
      disabled: true,
    });

    const done = moduleRow({ id: "m1", moduleCompleted: true, unlocked: true });
    expect(resolveRoadmapPreviewCta(done, "completed").label).toBe("Открыть");
  });

  it("buildRoadmapPreviewItems returns 3–5 modules with CTA and lock reason", () => {
    const modules = [
      moduleRow({ id: "m1", module: { id: "m1", title: "A", description: null, orderNumber: 1 }, moduleCompleted: true }),
      moduleRow({ id: "m2", module: { id: "m2", title: "B", description: null, orderNumber: 2 } }),
      moduleRow({ id: "m3", module: { id: "m3", title: "C", description: null, orderNumber: 3 }, unlocked: false }),
      moduleRow({ id: "m4", module: { id: "m4", title: "D", description: null, orderNumber: 4 }, unlocked: false }),
    ];
    const items = buildRoadmapPreviewItems(modules, "m2");
    expect(items.length).toBeGreaterThanOrEqual(3);
    expect(items.length).toBeLessThanOrEqual(ROADMAP_PREVIEW_MAX);
    expect(items.some((i) => i.isCurrent)).toBe(true);
    expect(items.find((i) => i.status === "completed")?.statusLabel).toBe(
      ROADMAP_PREVIEW_STATUS_LABELS.completed,
    );
    const locked = items.find((i) => i.status === "locked");
    if (locked) {
      expect(locked.ctaDisabled).toBe(true);
      expect(locked.ctaLabel).toBe("Заблокировано");
      expect(locked.lockedReason).toBeTruthy();
    }
  });
});
