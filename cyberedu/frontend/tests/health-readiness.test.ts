import { describe, expect, it } from "vitest";
import { readinessStatus } from "@/lib/health/readiness";

describe("readinessStatus", () => {
  it("returns ok when database check passes", () => {
    expect(readinessStatus({ database: "ok" })).toBe("ok");
  });

  it("returns degraded when database check fails", () => {
    expect(readinessStatus({ database: "error" })).toBe("degraded");
  });
});
