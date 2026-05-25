import { describe, expect, it } from "vitest";
import {
  buildMentorLiveAnnouncement,
  getMentorClearConfirmMessage,
  mentorComposerDescribedBy,
  MENTOR_COMPOSER_ERROR_ID,
  MENTOR_COMPOSER_INPUT_ID,
} from "@/lib/ai/mentor-ui/mentor-a11y";

describe("mentor-a11y (ETAP 18)", () => {
  it("exposes stable composer ids", () => {
    expect(MENTOR_COMPOSER_INPUT_ID).toBe("mentor-message-input");
    expect(MENTOR_COMPOSER_ERROR_ID).toBe("mentor-composer-error");
  });

  it("mentorComposerDescribedBy links error to textarea", () => {
    expect(
      mentorComposerDescribedBy({ draftOverLimit: false, hasError: true, modeActive: false }),
    ).toContain(MENTOR_COMPOSER_ERROR_ID);
  });

  it("buildMentorLiveAnnouncement announces loading and new assistant reply", () => {
    expect(
      buildMentorLiveAnnouncement({
        loading: true,
        historyLoading: false,
        error: null,
        showError: false,
        showDisabled: false,
        messages: [],
        lastAnnouncedAssistantId: null,
      }).text,
    ).toMatch(/готовит ответ/i);

    const r = buildMentorLiveAnnouncement({
      loading: false,
      historyLoading: false,
      error: null,
      showError: false,
      showDisabled: false,
      messages: [{ id: "a1", role: "assistant", content: "Краткий ответ по фишингу." }],
      lastAnnouncedAssistantId: null,
    });
    expect(r.text).toMatch(/Получен ответ/i);
    expect(r.lastAssistantId).toBe("a1");
  });

  it("clear confirm mentions server when applicable", () => {
    expect(getMentorClearConfirmMessage(true)).toMatch(/сервер/i);
    expect(getMentorClearConfirmMessage(false)).not.toMatch(/сервер/i);
  });
});
