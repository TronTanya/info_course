import { describe, expect, it, vi } from "vitest";
import {
  certificateShareText,
  sanitizePublicVerifyShareUrl,
  sharePublicVerifyUrl,
} from "@/lib/certificate-share";

describe("certificate-share", () => {
  it("sanitizes public verify URL without query", () => {
    expect(sanitizePublicVerifyShareUrl("https://app.example/verify/CE-2026-ABCD1234")).toBe(
      "https://app.example/verify/CE-2026-ABCD1234",
    );
  });

  it("rejects dashboard URLs", () => {
    expect(sanitizePublicVerifyShareUrl("https://app.example/dashboard/certificate")).toBeNull();
  });

  it("rejects verify URLs with query params", () => {
    expect(sanitizePublicVerifyShareUrl("https://app.example/verify/CE-2026-X?email=a@b.c")).toBeNull();
  });

  it("builds share text without email", () => {
    const text = certificateShareText("CE-2026-TEST");
    expect(text).toContain("CE-2026-TEST");
    expect(text).not.toMatch(/@/);
  });

  it("share falls back to clipboard when Web Share unavailable", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", {
      share: undefined,
      clipboard: { writeText },
    });

    const result = await sharePublicVerifyUrl("https://learn.example/verify/CE-2026-SHARE01");
    expect(result).toBe("copied");
    expect(writeText).toHaveBeenCalledWith("https://learn.example/verify/CE-2026-SHARE01");

    vi.unstubAllGlobals();
  });
});
