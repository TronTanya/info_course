import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { verifyApiCsrf } from "@/lib/security/csrf";

const ORIGIN = "http://localhost:3100";

function apiRequest(
  path: string,
  init: { method?: string; headers?: Record<string, string> } = {},
): NextRequest {
  return new NextRequest(`${ORIGIN}${path}`, {
    method: init.method ?? "POST",
    headers: init.headers,
  });
}

describe("security/csrf (Origin/Referer for /api/*)", () => {
  const env = { ...process.env };

  beforeEach(() => {
    process.env.AUTH_URL = ORIGIN;
  });

  afterEach(() => {
    process.env = { ...env };
  });

  it("allows POST with matching Origin", () => {
    const r = verifyApiCsrf(
      apiRequest("/api/ai/chat", { headers: { origin: ORIGIN } }),
    );
    expect(r).toEqual({ ok: true });
  });

  it("allows POST with matching Referer when Origin is absent", () => {
    const r = verifyApiCsrf(
      apiRequest("/api/ai/chat", { headers: { referer: `${ORIGIN}/dashboard` } }),
    );
    expect(r).toEqual({ ok: true });
  });

  it("rejects POST without Origin/Referer on /api/*", () => {
    const r = verifyApiCsrf(apiRequest("/api/ai/chat"));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe("missing_origin");
  });

  it("rejects POST with wrong Origin (cross-site)", () => {
    const r = verifyApiCsrf(
      apiRequest("/api/ai/chat", { headers: { origin: "https://evil.example" } }),
    );
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe("origin_mismatch");
  });

  it("rejects POST with wrong Referer", () => {
    const r = verifyApiCsrf(
      apiRequest("/api/ai/chat", {
        headers: { referer: "https://attacker.example/phish" },
      }),
    );
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toMatch(/referer/);
  });

  it("allows GET without Origin", () => {
    const r = verifyApiCsrf(
      apiRequest("/api/health", { method: "GET" }),
    );
    expect(r).toEqual({ ok: true });
  });
});

vi.mock("next-auth/jwt", () => ({
  getToken: vi.fn().mockResolvedValue(null),
}));

describe("middleware CSRF enforcement", () => {
  const env = { ...process.env };

  beforeEach(() => {
    process.env.AUTH_URL = ORIGIN;
    process.env.AUTH_SECRET = "ci-middleware-csrf-secret-minimum-32-chars";
  });

  afterEach(() => {
    process.env = { ...env };
    vi.resetModules();
  });

  it("returns 403 JSON for POST /api/* without trusted Origin", async () => {
    const { middleware } = await import("@/middleware");
    const res = await middleware(apiRequest("/api/ai/chat"));
    expect(res.status).toBe(403);
    const body = (await res.json()) as { error?: string };
    expect(body.error).toMatch(/CSRF/i);
  });

  it("passes POST /api/* with valid Origin to next handler", async () => {
    const { middleware } = await import("@/middleware");
    const res = await middleware(
      apiRequest("/api/health", { method: "POST", headers: { origin: ORIGIN } }),
    );
    expect(res.status).not.toBe(403);
  });
});
