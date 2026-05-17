import { describe, expect, it } from "vitest";
import { readinessStatus } from "@/lib/health/readiness";

describe("readinessStatus", () => {
  it("returns ok when database check passes", () => {
    expect(readinessStatus({ database: "ok", redis: "skipped" })).toBe("ok");
  });

  it("returns degraded when database check fails", () => {
    expect(readinessStatus({ database: "error", redis: "skipped" })).toBe("degraded");
  });

  it("returns degraded when redis is required but unavailable", () => {
    expect(readinessStatus({ database: "ok", redis: "error" })).toBe("degraded");
  });

  it("returns ok when redis is ok in production", () => {
    expect(readinessStatus({ database: "ok", redis: "ok" })).toBe("ok");
  });
});
