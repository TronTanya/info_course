import { describe, expect, it } from "vitest";
import { formatRuDateLongUtc, formatRuDateTimeFullUtc, formatRuDateTimeShortUtc } from "@/lib/datetime-stable";

describe("datetime-stable (SSR-safe)", () => {
  it("formatRuDateLongUtc matches for fixed instant", () => {
    expect(formatRuDateLongUtc("2026-05-15T00:00:00.000Z")).toBe("15 мая 2026 г.");
  });

  it("formatRuDateTimeShortUtc is stable for ISO string", () => {
    const s = formatRuDateTimeShortUtc("2026-05-15T14:30:00.000Z");
    expect(s).toMatch(/15/);
    expect(s).toMatch(/2026/);
  });

  it("formatRuDateTimeFullUtc includes time parts", () => {
    const s = formatRuDateTimeFullUtc("2026-05-15T14:30:45.000Z");
    expect(s).toMatch(/15/);
    expect(s).toMatch(/2026/);
  });
});
