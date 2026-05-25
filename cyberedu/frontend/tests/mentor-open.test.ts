import { afterEach, describe, expect, it, vi } from "vitest";
import { consumePendingMentorOpen, openMentorChat } from "@/lib/ai/mentor-ui/open";

describe("openMentorChat", () => {
  afterEach(() => {
    consumePendingMentorOpen();
  });

  it("queues open until chat lazy chunk mounts", () => {
    vi.stubGlobal(
      "CustomEvent",
      class MockCustomEvent {
        constructor(public type: string) {}
      },
    );
    vi.stubGlobal("window", { dispatchEvent: vi.fn() } as unknown as Window);
    openMentorChat();
    expect(consumePendingMentorOpen()).toBe(true);
    expect(consumePendingMentorOpen()).toBe(false);
  });
});
