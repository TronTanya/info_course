import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import type { Session } from "next-auth";
import {
  hasRole,
  isAdmin,
  isUser,
  requireAdmin,
  requireAuth,
} from "@/lib/permissions";
import {
  requireRole,
  roleHasPermission,
  sessionHasPermission,
} from "@/lib/security/rbac";

const redirectMock = vi.hoisted(() => vi.fn((url: string) => {
  const err = new Error("NEXT_REDIRECT");
  (err as Error & { digest: string }).digest = `NEXT_REDIRECT;${url}`;
  throw err;
}));

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("next-auth/jwt", () => ({
  getToken: vi.fn(),
}));

import { auth as getAuthSession } from "@/lib/auth";
import { getToken } from "next-auth/jwt";
import type { Mock } from "vitest";

const authMock = getAuthSession as unknown as Mock<() => Promise<Session | null>>;

function mockSession(role: "USER" | "ADMIN", id = "u1"): Session {
  return {
    user: { id, role, email: `${role.toLowerCase()}@test.local`, name: "Test" },
    expires: new Date(Date.now() + 60_000).toISOString(),
  } as Session;
}

describe("security/rbac permissions", () => {
  it("USER cannot admin:export; ADMIN can", () => {
    expect(roleHasPermission("USER", "admin:export")).toBe(false);
    expect(roleHasPermission("ADMIN", "admin:export")).toBe(true);
    expect(roleHasPermission("USER", "course:read")).toBe(true);
  });

  it("sessionHasPermission respects role", () => {
    expect(sessionHasPermission(mockSession("ADMIN"), "admin:users")).toBe(true);
    expect(sessionHasPermission(mockSession("USER"), "admin:users")).toBe(false);
  });

  it("requireRole gates admin-only roles", () => {
    expect(requireRole("ADMIN", "ADMIN")).toBe(true);
    expect(requireRole("USER", "ADMIN")).toBe(false);
    expect(requireRole(undefined, "USER")).toBe(false);
  });

  it("hasRole / isAdmin / isUser helpers", () => {
    expect(isAdmin("ADMIN")).toBe(true);
    expect(isAdmin("USER")).toBe(false);
    expect(isUser("USER")).toBe(true);
    expect(hasRole("USER", ["USER", "ADMIN"])).toBe(true);
  });
});

describe("security/rbac server layouts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("requireAuth redirects when unauthenticated", async () => {
    authMock.mockResolvedValue(null);
    await expect(requireAuth()).rejects.toThrow("NEXT_REDIRECT");
    expect(redirectMock).toHaveBeenCalledWith("/auth/login");
  });

  it("requireAdmin redirects USER to home", async () => {
    authMock.mockResolvedValue(mockSession("USER"));
    await expect(requireAdmin()).rejects.toThrow("NEXT_REDIRECT");
    expect(redirectMock).toHaveBeenCalledWith("/");
  });

  it("requireAdmin allows ADMIN session", async () => {
    authMock.mockResolvedValue(mockSession("ADMIN", "admin-1"));
    const s = await requireAdmin();
    expect(s.user.role).toBe("ADMIN");
    expect(redirectMock).not.toHaveBeenCalled();
  });
});

describe("security/rbac middleware routes", () => {
  const env = { ...process.env };

  beforeEach(() => {
    process.env.AUTH_URL = "http://localhost:3100";
    process.env.AUTH_SECRET = "ci-rbac-middleware-secret-minimum-32-ch";
    vi.resetModules();
  });

  afterEach(() => {
    process.env = { ...env };
  });

  async function runMiddleware(path: string) {
    const { middleware } = await import("@/middleware");
    return middleware(
      new NextRequest(`http://localhost:3100${path}`, {
        headers: { origin: "http://localhost:3100" },
      }),
    );
  }

  it("unauthenticated /admin redirects to login", async () => {
    vi.mocked(getToken).mockResolvedValue(null);
    const res = await runMiddleware("/admin/users");
    expect(res.status).toBeGreaterThanOrEqual(300);
    expect(res.status).toBeLessThan(400);
    expect(res.headers.get("location")).toMatch(/\/auth\/login/);
  });

  it("USER on /admin redirects to home", async () => {
    vi.mocked(getToken).mockResolvedValue({ sub: "u1", role: "USER" });
    const res = await runMiddleware("/admin/users");
    expect(res.status).toBeGreaterThanOrEqual(300);
    expect(res.headers.get("location")).toBe("http://localhost:3100/");
  });

  it("ADMIN on /admin proceeds", async () => {
    vi.mocked(getToken).mockResolvedValue({ sub: "admin1", role: "ADMIN" });
    const res = await runMiddleware("/admin/users");
    expect(res.status).toBe(200);
  });

  it("unauthenticated /dashboard redirects to login", async () => {
    vi.mocked(getToken).mockResolvedValue(null);
    const res = await runMiddleware("/dashboard");
    expect(res.headers.get("location")).toMatch(/\/auth\/login/);
  });
});
