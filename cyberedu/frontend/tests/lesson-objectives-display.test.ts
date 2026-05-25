import { describe, expect, it } from "vitest";
import {
  LESSON_OBJECTIVE_PLACEHOLDER,
  resolveLessonDisplayObjectives,
} from "@/lib/lesson-objectives-display";

describe("resolveLessonDisplayObjectives", () => {
  it("returns up to four real objectives from content", () => {
    const { items, source } = resolveLessonDisplayObjectives(
      [
        { text: "Распознавать основные признаки фишингового письма." },
        { text: "Проверять отправителя и домен." },
        { text: "Объяснять, почему срочность — признак социальной инженерии." },
        { text: "Описывать безопасные действия при подозрительном письме." },
        { text: "Пятый пункт не должен попасть в UI." },
      ],
      null,
    );
    expect(source).toBe("content");
    expect(items).toHaveLength(4);
    expect(items[0]?.text).toContain("фишинг");
  });

  it("drops placeholder objective from mapper", () => {
    const { items, source } = resolveLessonDisplayObjectives(
      [{ text: LESSON_OBJECTIVE_PLACEHOLDER }],
      null,
    );
    expect(source).toBe("empty");
    expect(items).toHaveLength(0);
  });

  it("uses description fallback when content has no goals", () => {
    const { items, source } = resolveLessonDisplayObjectives([], "Понимать, как проверять подлинность отправителя письма.");
    expect(source).toBe("description");
    expect(items).toHaveLength(1);
    expect(items[0]?.text).toContain("отправителя");
  });

  it("returns empty when nothing to show", () => {
    const { items, source } = resolveLessonDisplayObjectives([], null);
    expect(source).toBe("empty");
    expect(items).toHaveLength(0);
  });
});
