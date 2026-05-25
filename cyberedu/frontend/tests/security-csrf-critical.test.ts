/**
 * CSRF: критичные mutating API (middleware + verifyApiCsrf).
 * Server Actions покрыты в security-csrf-actions.test.ts (Next.js Origin).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { verifyApiCsrf } from "@/lib/security/csrf";
import {
  CSRF_CRITICAL_MUTATING_API_PATHS,
  CSRF_SURFACE_PROTECTION,
  isCsrfExemptApiPath,
} from "@/lib/security/csrf-coverage";

const ORIGIN = "http://localhost:3100";
const EVIL = "https://evil.example";

function apiReq(path: string, method: string, headers?: Record<string, string>) {
  return new NextRequest(`${ORIGIN}${path}`, { method, headers });
}

vi.mock("next-auth/jwt", () => ({
  getToken: vi.fn().mockResolvedValue(null),
}));

describe("security/csrf critical API paths", () => {
  const env = { ...process.env };

  beforeEach(() => {
    process.env.AUTH_URL = ORIGIN;
    process.env.AUTH_SECRET = "ci-csrf-critical-secret-minimum-32-chars";
  });

  afterEach(() => {
    process.env = { ...env };
    vi.resetModules();
  });

  it.each(CSRF_CRITICAL_MUTATING_API_PATHS)(
    "verifyApiCsrf blocks cross-site POST %s",
    (path) => {
      const method = path.includes("/avatar") && !path.includes("upload") ? "PATCH" : "POST";
      const r = verifyApiCsrf(
        apiReq(path, method, { origin: EVIL }),
      );
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.reason).toBe("origin_mismatch");
    },
  );

  it.each(CSRF_CRITICAL_MUTATING_API_PATHS)(
    "middleware returns 403 for %s without Origin",
    async (path) => {
      const method =
        path === "/api/profile/avatar"
          ? "PATCH"
          : "POST";
      const { middleware } = await import("@/middleware");
      const res = await middleware(apiReq(path, method));
      expect(res.status).toBe(403);
      const body = (await res.json()) as { error?: string };
      expect(body.error).toMatch(/CSRF/i);
    },
  );

  it("middleware allows same-origin POST /api/certificates/generate", async () => {
    const { middleware } = await import("@/middleware");
    const res = await middleware(
      apiReq("/api/certificates/generate", "POST", { origin: ORIGIN }),
    );
    expect(res.status).not.toBe(403);
  });

  it("GET /api/admin/export is not blocked by CSRF (public read shape)", async () => {
    const r = verifyApiCsrf(apiReq("/api/admin/export?type=students", "GET"));
    expect(r).toEqual({ ok: true });
    const { middleware } = await import("@/middleware");
    const res = await middleware(apiReq("/api/admin/export?type=students", "GET"));
    expect(res.status).not.toBe(403);
  });

  it("POST /api/auth/callback/credentials is exempt (NextAuth CSRF token)", async () => {
    expect(isCsrfExemptApiPath("/api/auth/callback/credentials")).toBe(true);
    const { middleware } = await import("@/middleware");
    const res = await middleware(
      apiReq("/api/auth/callback/credentials", "POST"),
    );
    expect(res.status).not.toBe(403);
  });

  it("documents export as GET-only CSRF-safe surface", () => {
    expect(CSRF_SURFACE_PROTECTION.export.mechanism).toBe("get_safe");
  });
});
