import { describe, expect, it } from "vitest";
import {
  LESSON_NAV_LOCK_MESSAGES,
  buildLessonNavigationItems,
  resolveNextCourseModule,
} from "@/lib/lesson-navigation-ui";

const base = {
  lessonTitle: "Фишинг",
  lessonCompleted: false,
  courseHref: "/dashboard/course",
  courseTitle: "Кибербезопасность",
  currentModuleId: "m1",
  courseModules: [
    { id: "m1", orderNumber: 1, title: "М1", unlocked: true, completed: false, isCurrent: true, href: "/dashboard/course/m1" },
    { id: "m2", orderNumber: 2, title: "М2", unlocked: false, completed: false, isCurrent: false, href: "/dashboard/course/m2" },
  ],
  previousLesson: null,
  nextLesson: null,
  nextTest: { title: "Тест", href: "/dashboard/course/m1/test", disabled: false },
  nextPractice: { title: "Практика", href: "/dashboard/course/m1/practice", disabled: true },
  hasTest: true,
  hasPractice: true,
  canAccessTest: false,
  canAccessPractice: false,
};

describe("buildLessonNavigationItems", () => {
  it("includes current lesson and course roadmap", () => {
    const items = buildLessonNavigationItems(base);
    expect(items[0]?.kind).toBe("current-lesson");
    expect(items.at(-1)?.kind).toBe("roadmap");
    expect(items.at(-1)?.title).toBe("Назад к карте курса");
    expect(items.at(-1)?.href).toBe("/dashboard/course");
  });

  it("shows previous lesson only for lesson routes", () => {
    const withLessonPrev = buildLessonNavigationItems({
      ...base,
      previousLesson: {
        title: "Урок 1",
        href: "/dashboard/course/m1/lesson",
        disabled: false,
      },
    });
    expect(withLessonPrev.some((i) => i.kind === "previous-lesson")).toBe(true);
  });

  it("locks test with module lessons message", () => {
    const test = buildLessonNavigationItems(base).find((i) => i.kind === "test");
    expect(test?.disabled).toBe(true);
    expect(test?.lockReason).toBe(LESSON_NAV_LOCK_MESSAGES.TEST_NEEDS_LESSONS);
  });

  it("locks practice with test-first message", () => {
    const practice = buildLessonNavigationItems(base).find((i) => i.kind === "practice");
    expect(practice?.disabled).toBe(true);
    expect(practice?.lockReason).toBe("Сначала сдайте тест модуля.");
  });

  it("suggests next module or certificate when hub complete", () => {
    const items = buildLessonNavigationItems({
      ...base,
      lessonCompleted: true,
      canAccessTest: true,
      canAccessPractice: true,
      nextPractice: { title: "Практика", href: "/dashboard/course/m1/practice", disabled: false },
      courseModules: [
        { id: "m1", orderNumber: 1, title: "М1", unlocked: true, completed: true, isCurrent: true, href: "/dashboard/course/m1" },
        { id: "m2", orderNumber: 2, title: "М2", unlocked: true, completed: false, isCurrent: false, href: "/dashboard/course/m2" },
      ],
      hubSteps: [
        { kind: "lecture", order: 1, title: "Лекция", description: "", status: "completed", actionHref: "/l" },
        { kind: "test", order: 2, title: "Тест", description: "", status: "completed", actionHref: "/t" },
        { kind: "practice", order: 3, title: "Практика", description: "", status: "completed", actionHref: "/p" },
      ],
    });
    expect(items.some((i) => i.kind === "next-module")).toBe(true);
    expect(items.some((i) => i.kind === "certificate")).toBe(true);
  });
});

describe("resolveNextCourseModule", () => {
  it("returns first unlocked module after current", () => {
    const modules = [
      { id: "m1", orderNumber: 1, title: "М1", unlocked: true, completed: true, isCurrent: true, href: "/dashboard/course/m1" },
      { id: "m2", orderNumber: 2, title: "М2", unlocked: true, completed: false, isCurrent: false, href: "/dashboard/course/m2" },
    ];
    const link = resolveNextCourseModule(modules, "m1");
    expect(link?.href).toBe("/dashboard/course/m2");
  });
});
