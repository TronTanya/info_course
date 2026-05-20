import { describe, expect, it } from "vitest";
import { submissionOutcome } from "@/lib/profile-course-stats";
import {
  buildProfileLearningStatus,
  buildProfileSkillsMap,
  profileRoleLabel,
} from "@/lib/profile-portfolio";
import type { CourseProgressModuleRow } from "@/lib/progress";

function moduleRow(title: string, percent: number, completed: boolean): CourseProgressModuleRow {
  return {
    module: { id: `m-${title}`, title, description: null, orderNumber: 1 },
    requirements: {
      lessonRequired: true,
      videoRequired: false,
      testRequired: true,
      practiceRequired: true,
      totalSteps: 3,
    },
    contentCounts: { lessons: 1, tests: 1, practices: 1 },
    progress: null,
    unlocked: true,
    progressPercent: percent,
    score: 0,
    moduleCompleted: completed,
  };
}

describe("profile-portfolio", () => {
  it("labels student role", () => {
    expect(profileRoleLabel("USER")).toBe("Студент");
    expect(profileRoleLabel("ADMIN")).toBe("Администратор");
  });

  it("builds learning status from stats", () => {
    expect(
      buildProfileLearningStatus({
        certificateIssued: true,
        allModulesComplete: true,
      } as Parameters<typeof buildProfileLearningStatus>[0]),
    ).toMatch(/сертификат/);
  });

  it("maps skills from module titles", () => {
    const skills = buildProfileSkillsMap([
      moduleRow("Модуль 3. Фишинг и социальная инженерия", 80, false),
      moduleRow("Модуль 2. Пароли и двухфакторная аутентификация", 100, true),
    ]);
    const phishing = skills.find((s) => s.id === "phishing");
    const passwords = skills.find((s) => s.id === "passwords");
    expect(phishing?.matchedModules).toBe(1);
    expect(passwords?.status).toBe("strong");
  });

  it("classifies submission outcomes", () => {
    expect(submissionOutcome("ACCEPTED")).toBe("passed");
    expect(submissionOutcome("REJECTED")).toBe("needs_improvement");
    expect(submissionOutcome("CHECKING")).toBe("pending");
  });
});
