import { describe, expect, it } from "vitest";
import { shouldPersistTutorChatHistory } from "@/lib/ai/tutor/context/chat-history-policy";

describe("shouldPersistTutorChatHistory", () => {
  it("persists on lesson and test surfaces", () => {
    expect(shouldPersistTutorChatHistory("lesson")).toBe(true);
    expect(shouldPersistTutorChatHistory("test_result")).toBe(true);
    expect(shouldPersistTutorChatHistory("dashboard")).toBe(true);
  });

  it("does not persist on practice (avoid storing task answers)", () => {
    expect(shouldPersistTutorChatHistory("practice")).toBe(false);
  });
});
