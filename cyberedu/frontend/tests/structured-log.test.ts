import { describe, expect, it, vi } from "vitest";
import { logError } from "@/lib/log/structured";

describe("structured log", () => {
  it("emits JSON with level and message", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    logError("test_event", { path: "/api/health" });
    expect(spy).toHaveBeenCalledOnce();
    const line = spy.mock.calls[0]?.[0];
    expect(typeof line).toBe("string");
    const parsed = JSON.parse(String(line)) as { level: string; message: string; path?: string };
    expect(parsed.level).toBe("error");
    expect(parsed.message).toBe("test_event");
    expect(parsed.path).toBe("/api/health");
    spy.mockRestore();
  });
});
