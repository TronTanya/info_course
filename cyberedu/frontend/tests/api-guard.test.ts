import { beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/security/rate-limit", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/security/rate-limit")>();
  return {
    ...actual,
    enforceRateLimit: vi.fn().mockResolvedValue({ allowed: true }),
  };
});

vi.mock("@/lib/security/audit", () => ({
  securityAudit: vi.fn(),
}));

import type { Session } from "next-auth";
import { auth } from "@/lib/auth";
import { withApiGuard, withAuthApiRoute, withPublicApiRoute } from "@/lib/security/api-guard";
import { securityAudit } from "@/lib/security/audit";
import { enforceRateLimit } from "@/lib/security/rate-limit";

function session(partial: Partial<Session["user"]> & { id: string }): Session {
  return {
    user: {
      id: partial.id,
      role: partial.role ?? "USER",
      email: partial.email ?? "u@example.com",
      name: partial.name ?? "User",
    },
    expires: new Date(Date.now() + 60_000).toISOString(),
  } as Session;
}

describe("security/api-guard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(enforceRateLimit).mockResolvedValue({ allowed: true });
  });

  it("withPublicApiRoute allows unauthenticated access", async () => {
    vi.mocked(auth).mockResolvedValue(null);
    const GET = withPublicApiRoute({}, async () => Response.json({ ok: true }));
    const res = await GET(new Request("http://localhost/api/health"));
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ ok: true });
  });

  it("withAuthApiRoute returns 401 without session", async () => {
    vi.mocked(auth).mockResolvedValue(null);
    const POST = withAuthApiRoute({}, async () => Response.json({ ok: true }));
    const res = await POST(new Request("http://localhost/api/private", { method: "POST" }));
    expect(res.status).toBe(401);
    expect(securityAudit).toHaveBeenCalledWith(
      expect.objectContaining({ event: "api.auth_denied" }),
    );
  });

  it("requireAdmin rejects non-admin", async () => {
    vi.mocked(auth).mockResolvedValue(session({ id: "u1", role: "USER" }));
    const POST = withApiGuard({ requireAdmin: true }, async () => Response.json({ ok: true }));
    const res = await POST(new Request("http://localhost/api/admin/export", { method: "POST" }));
    expect(res.status).toBe(403);
    expect(securityAudit).toHaveBeenCalledWith(
      expect.objectContaining({ event: "api.admin_denied", actorId: "u1" }),
    );
  });

  it("requireAdmin allows admin", async () => {
    vi.mocked(auth).mockResolvedValue(session({ id: "admin1", role: "ADMIN" }));
    const POST = withApiGuard({ requireAdmin: true }, async () => Response.json({ role: "admin" }));
    const res = await POST(new Request("http://localhost/api/admin/export", { method: "POST" }));
    expect(res.status).toBe(200);
  });

  it("validates JSON body with zod", async () => {
    vi.mocked(auth).mockResolvedValue(session({ id: "u1" }));
    const schema = z.object({ name: z.string().min(1) });
    const POST = withAuthApiRoute({ bodySchema: schema }, async ({ body }) =>
      Response.json(body),
    );

    const bad = await POST(
      new Request("http://localhost/api/x", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      }),
    );
    expect(bad.status).toBe(400);
    expect(securityAudit).toHaveBeenCalledWith(
      expect.objectContaining({ event: "api.validation_failed" }),
    );

    const good = await POST(
      new Request("http://localhost/api/x", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "test" }),
      }),
    );
    expect(good.status).toBe(200);
    await expect(good.json()).resolves.toEqual({ name: "test" });
  });

  it("returns 429 when rate limit exceeded", async () => {
    vi.mocked(auth).mockResolvedValue(session({ id: "u1" }));
    vi.mocked(enforceRateLimit).mockResolvedValue({ allowed: false, retryAfterMs: 5000 });
    const POST = withAuthApiRoute({ rateLimit: "aiChat" }, async () => Response.json({ ok: true }));
    const res = await POST(new Request("http://localhost/api/ai/chat", { method: "POST" }));
    expect(res.status).toBe(429);
    expect(securityAudit).toHaveBeenCalledWith(
      expect.objectContaining({ event: "api.rate_limited" }),
    );
  });

  it("returns safe 500 and audits unhandled handler errors", async () => {
    vi.mocked(auth).mockResolvedValue(session({ id: "u1" }));
    const POST = withAuthApiRoute({}, async () => {
      throw new Error("boom");
    });
    const res = await POST(new Request("http://localhost/api/x", { method: "POST" }));
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error).toMatch(/внутренняя ошибка/i);
    expect(securityAudit).toHaveBeenCalledWith(
      expect.objectContaining({
        event: "api.unhandled_error",
        actorId: "u1",
        meta: { errorType: "Error" },
      }),
    );
  });

  it("skipBodyParse skips zod parse for multipart handlers", async () => {
    vi.mocked(auth).mockResolvedValue(session({ id: "u1" }));
    const POST = withApiGuard({ requireAuth: true, skipBodyParse: true }, async ({ req }) => {
      const form = await req.formData();
      return Response.json({ file: form.get("file") === "1" });
    });
    const fd = new FormData();
    fd.set("file", "1");
    const res = await POST(
      new Request("http://localhost/api/upload", { method: "POST", body: fd }),
    );
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ file: true });
  });
});
