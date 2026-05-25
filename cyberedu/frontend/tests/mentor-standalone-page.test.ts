import { describe, expect, it } from "vitest";
import {
  buildMentorPageAIMentorContext,
  buildMentorPageContextOptions,
  MENTOR_PAGE_USAGE_RULES,
  MENTOR_STANDALONE_SAFE_EXAMPLES,
  resolveDefaultMentorPageScope,
} from "@/lib/mentor-standalone-page";
import type { ProfileCourseStats } from "@/lib/profile-course-stats";

const stats = {
  courseId: "c1",
  courseTitle: "Кибербезопасность",
  currentModuleId: "m1",
  currentModuleTitle: "Модуль 1",
} as ProfileCourseStats;

describe("mentor-standalone-page", () => {
  it("lists only safe example prompts", () => {
    expect(MENTOR_STANDALONE_SAFE_EXAMPLES).toHaveLength(5);
    expect(MENTOR_STANDALONE_SAFE_EXAMPLES.map((e) => e.text)).toContain("Объясни, что такое фишинг");
    for (const ex of MENTOR_STANDALONE_SAFE_EXAMPLES) {
      expect(ex.text).not.toMatch(/answer\s*key|готовый ответ|взлом/i);
    }
  });

  it("offers three context scopes with weak topics disabled when empty", () => {
    const opts = buildMentorPageContextOptions(stats, []);
    expect(opts).toHaveLength(3);
    expect(opts.find((o) => o.scope === "weak_topics")?.disabled).toBe(true);
  });

  it("defaults to course when no weak topics", () => {
    expect(resolveDefaultMentorPageScope(stats, [])).toBe("course");
  });

  it("defaults to weak_topics when recommendations exist", () => {
    const weak = [
      {
        id: "w1",
        title: "Тест",
        reason: "Не зачтён",
        href: "/x",
        tone: "warning" as const,
      },
    ];
    expect(resolveDefaultMentorPageScope(stats, weak)).toBe("weak_topics");
  });

  it("builds general context without module id", () => {
    const ctx = buildMentorPageAIMentorContext("general", stats, [], []);
    expect(ctx?.sourceType).toBe("general");
  });

  it("usage rules forbid cheating and solutions", () => {
    const joined = MENTOR_PAGE_USAGE_RULES.join(" ");
    expect(joined).toMatch(/не выдаёт готовые ответы/i);
    expect(joined).toMatch(/не решает практику/i);
  });
});
