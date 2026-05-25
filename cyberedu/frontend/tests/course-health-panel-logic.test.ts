import { describe, expect, it } from "vitest";
import {
  buildCourseHealthPanelData,
  courseHealthPanelHasInsights,
  formatDifficultTopicLabel,
  mapHighFailTests,
} from "@/lib/course-health-panel-logic";

describe("course-health-panel-logic", () => {
  it("truncates difficult topic labels without exposing extra content", () => {
    const long = "А".repeat(200);
    expect(formatDifficultTopicLabel(long, 50).length).toBeLessThanOrEqual(50);
    expect(formatDifficultTopicLabel("  Краткий   вопрос  ")).toBe("Краткий вопрос");
  });

  it("maps high fail tests to admin edit hrefs", () => {
    const mapped = mapHighFailTests([
      {
        testId: "t1",
        title: "Тест 1",
        moduleTitle: "М1",
        failRatePercent: 60,
        attempts: 5,
      },
    ]);
    expect(mapped[0]?.href).toBe("/admin/tests/t1/edit");
    expect(mapped[0]?.failRatePercent).toBe(60);
  });

  it("detects when panel has no insights", () => {
    const empty = buildCourseHealthPanelData({
      hasStudentActivity: true,
      lowCompletionModules: [],
      highFailTests: [],
      difficultQuestions: [],
      progressDropOff: [],
      stuckPractices: [],
    });
    expect(courseHealthPanelHasInsights(empty)).toBe(false);
  });

  it("merges drop-off lists by stalled count", () => {
    const data = buildCourseHealthPanelData({
      hasStudentActivity: true,
      lowCompletionModules: [],
      highFailTests: [],
      difficultQuestions: [],
      progressDropOff: [
        {
          id: "p1",
          kind: "lesson",
          kindLabel: "Урок",
          title: "Модуль A",
          moduleTitle: "Модуль A",
          stalledCount: 3,
          href: "/admin/modules/a/edit",
        },
      ],
      stuckPractices: [
        {
          taskId: "task1",
          title: "Практика",
          moduleTitle: "Модуль B",
          stuckCount: 10,
          totalSubmissions: 12,
          stuckRatePercent: 83,
        },
      ],
    });
    expect(data.dropOffPoints[0]?.stalledCount).toBe(10);
    expect(data.dropOffPoints[0]?.kind).toBe("practice");
  });
});
