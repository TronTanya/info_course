import { describe, expect, it } from "vitest";
import {
  buildCheckpointReaction,
  formatCheckpointProgress,
  MINI_CHECKPOINT_DISCLAIMER,
  MINI_CHECKPOINT_EMPTY_MESSAGE,
} from "@/lib/mini-checkpoint-ui";

describe("mini-checkpoint-ui", () => {
  it("uses stage-9 copy", () => {
    expect(MINI_CHECKPOINT_EMPTY_MESSAGE).toBe("Самопроверка появится после обновления урока.");
    expect(MINI_CHECKPOINT_DISCLAIMER).toBe("Самопроверка не влияет на итоговую оценку.");
  });

  it("formats progress in Russian", () => {
    expect(formatCheckpointProgress(1, 3)).toBe("1 из 3");
  });

  it("splits feedback, status label, and explanation", () => {
    const r = buildCheckpointReaction("yes", "Потому что домен важен.", "Краткий отклик.");
    expect(r.statusLabel).toBe("Верно");
    expect(r.feedback).toBe("Краткий отклик.");
    expect(r.explanation).toBe("Потому что домен важен.");
  });

  it("does not expose graded answer fields in reaction shape", () => {
    const r = buildCheckpointReaction("retry", "Подсказка");
    expect(r).not.toHaveProperty("correctAnswerId");
    expect(r).not.toHaveProperty("correctOptionId");
  });
});
