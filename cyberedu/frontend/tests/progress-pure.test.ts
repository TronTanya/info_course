import { describe, expect, it } from "vitest";
import type { ProgressRow } from "@/lib/progress";
import { getModuleRequirements, moduleProgressPercent, type ModuleForProgress } from "@/lib/progress";

function mod(over: Partial<ModuleForProgress> = {}): ModuleForProgress {
  return {
    id: "m1",
    courseId: "c1",
    orderNumber: 1,
    isActive: true,
    lessons: [],
    tests: [],
    practicalTasks: [],
    ...over,
  };
}

describe("getModuleRequirements", () => {
  it("ничего не требует при пустом модуле", () => {
    const r = getModuleRequirements(mod());
    expect(r.lessonRequired).toBe(false);
    expect(r.videoRequired).toBe(false);
    expect(r.testRequired).toBe(false);
    expect(r.practiceRequired).toBe(false);
    expect(r.totalSteps).toBe(0);
  });

  it("требует лекцию при наличии уроков", () => {
    const r = getModuleRequirements(mod({ lessons: [{ videoUrl: null }] }));
    expect(r.lessonRequired).toBe(true);
    expect(r.videoRequired).toBe(false);
    expect(r.totalSteps).toBe(1);
  });

  it("требует видео если у урока есть videoUrl", () => {
    const r = getModuleRequirements(mod({ lessons: [{ videoUrl: "https://x" }] }));
    expect(r.lessonRequired).toBe(true);
    expect(r.videoRequired).toBe(true);
    expect(r.totalSteps).toBe(2);
  });

  it("учитывает тесты и практику", () => {
    const r = getModuleRequirements(
      mod({
        lessons: [{ videoUrl: null }],
        tests: [{ id: "t1" }],
        practicalTasks: [{ id: "p1" }],
      }),
    );
    expect(r.testRequired).toBe(true);
    expect(r.practiceRequired).toBe(true);
    expect(r.totalSteps).toBe(3);
  });
});

describe("moduleProgressPercent", () => {
  it("0% при нуле шагов", () => {
    const req = getModuleRequirements(mod());
    expect(moduleProgressPercent(req, null)).toBe(0);
  });

  it("100% когда все требуемые шаги отмечены", () => {
    const m = mod({
      lessons: [{ videoUrl: "v" }],
      tests: [{ id: "t1" }],
    });
    const req = getModuleRequirements(m);
    const p = {
      id: "p",
      userId: "u",
      moduleId: m.id,
      lessonCompleted: true,
      videoCompleted: true,
      testCompleted: true,
      practiceCompleted: false,
      moduleCompleted: false,
      score: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as ProgressRow;
    expect(moduleProgressPercent(req, p)).toBe(100);
  });

  it("округляет долю шагов", () => {
    const m = mod({
      lessons: [{ videoUrl: null }],
      tests: [{ id: "t1" }],
      practicalTasks: [{ id: "p1" }],
    });
    const req = getModuleRequirements(m);
    const p = {
      id: "p",
      userId: "u",
      moduleId: m.id,
      lessonCompleted: true,
      videoCompleted: false,
      testCompleted: false,
      practiceCompleted: false,
      moduleCompleted: false,
      score: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as ProgressRow;
    expect(moduleProgressPercent(req, p)).toBe(33);
  });
});
