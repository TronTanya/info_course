import { describe, expect, it } from "vitest";
import {
  buildLessonCheckpoints,
  isPositiveSelfCheckOption,
  selfCheckFeedback,
  SELF_CHECK_OPTIONS,
} from "@/lib/lesson-checkpoints";

const CONTENT = `
- [ ] Могу объяснить фишинг

:::warning
Ошибка
Не переходите по незнакомым ссылкам.
:::
`;

describe("lesson-checkpoints", () => {
  it("buildLessonCheckpoints adds self-check options without correctOptionId", () => {
    const items = buildLessonCheckpoints(CONTENT, "les-1", 3);
    expect(items.length).toBeGreaterThan(0);
    expect(items.length).toBeLessThanOrEqual(3);
    for (const q of items) {
      expect("correctOptionId" in q).toBe(false);
      expect(q.options).toEqual(SELF_CHECK_OPTIONS);
    }
  });

  it("selfCheckFeedback uses positive and reflect prefixes", () => {
    expect(selfCheckFeedback("yes", "Подсказка").prefix).toMatch(/^Верно/);
    expect(selfCheckFeedback("retry", "Подсказка").prefix).toMatch(/^Почти/);
  });

  it("isPositiveSelfCheckOption recognizes safe ids", () => {
    expect(isPositiveSelfCheckOption("yes")).toBe(true);
    expect(isPositiveSelfCheckOption("retry")).toBe(false);
  });
});
