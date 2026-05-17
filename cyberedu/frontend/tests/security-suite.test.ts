/**
 * Сводный чеклист безопасности: контракты в коде + ссылки на поведенческие тесты.
 * Падение здесь = регрессия до merge.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { verifyApiCsrf } from "@/lib/security/csrf";
import { NextRequest } from "next/server";

const root = process.cwd();
const read = (rel: string) => readFileSync(join(root, rel), "utf8");

describe("security suite / CSRF negative cases", () => {
  const ORIGIN = "http://localhost:3100";

  beforeEach(() => {
    process.env.AUTH_URL = ORIGIN;
  });

  it("rejects cross-site Origin on /api/*", () => {
    const r = verifyApiCsrf(
      new NextRequest(`${ORIGIN}/api/ai/chat`, {
        method: "POST",
        headers: { origin: "https://evil.example" },
      }),
    );
    expect(r.ok).toBe(false);
  });

  it("middleware exempts /api/auth/* from CSRF (NextAuth callbacks)", () => {
    const mw = read("middleware.ts");
    expect(mw).toMatch(/!pathname\.startsWith\("\/api\/auth\/"\)/);
  });

  it("middleware returns 403 for mutating /api without Origin", async () => {
    process.env.AUTH_SECRET = "ci-security-suite-csrf-secret-min-32-chars";
    vi.resetModules();
    const { middleware } = await import("@/middleware");
    const res = await middleware(
      new NextRequest(`${ORIGIN}/api/ai/chat`, { method: "POST" }),
    );
    expect(res.status).toBe(403);
  });
});

describe("security suite / RBAC & auth redirects", () => {
  it("requireAdmin redirects USER (see security-rbac.test.ts)", () => {
    const perms = read("lib/permissions.ts");
    expect(perms).toMatch(/requireAdmin/);
    expect(perms).toMatch(/redirect\("\/"\)/);
  });

  it("middleware protects /admin for USER and anonymous", () => {
    const mw = read("middleware.ts");
    expect(mw).toContain('pathname.startsWith("/admin")');
    expect(mw).toMatch(/role !== "ADMIN"/);
    expect(mw).toMatch(/\/auth\/login/);
  });
});

describe("security suite / upload validation wired", () => {
  it("practice upload API routes use validatePracticeUpload + sandbox", () => {
    const uploadRoute = read("app/api/practice/upload-file/route.ts");
    const combinedRoute = read("app/api/practice/submit-combined/route.ts");
    expect(uploadRoute).toMatch(/validatePracticeUpload/);
    expect(combinedRoute).toMatch(/validatePracticeUpload/);
    const sandbox = read("lib/security/upload-sandbox.ts");
    expect(sandbox).toMatch(/rejectExecutableMagic/);
  });
});

describe("security suite / rate limit & production submit", () => {
  it("test action calls enforceServerActionRateLimit before prisma", () => {
    const src = read("lib/actions/test.ts");
    const rl = src.indexOf("enforceServerActionRateLimit");
    const db = src.indexOf("prisma.");
    expect(rl).toBeGreaterThan(-1);
    expect(db).toBeGreaterThan(rl);
  });

  it("practice actions call enforceServerActionRateLimit for text/interactive/structured", () => {
    const src = read("lib/actions/practice.ts");
    expect(src).toMatch(/enforceServerActionRateLimit\("practiceText"/);
    expect(src).toMatch(/enforceServerActionRateLimit\("practiceInteractive"/);
    expect(src).toMatch(/enforceServerActionRateLimit\("practiceStructured"/);
  });

  it("authorize() rate-limits credentials callback in Node (not Edge middleware)", () => {
    const auth = read("lib/auth.ts");
    expect(auth).toMatch(/checkCredentialsCallbackRateLimit/);
    const mw = read("middleware.ts");
    expect(mw).not.toMatch(/applyMiddlewareRateLimit/);
  });
});

describe("security suite / certificate verification", () => {
  it("verify page uses enforceRateLimit and safe copy", () => {
    const page = read("app/certificate/verify/[verificationCode]/page.tsx");
    expect(page).toMatch(/enforceRateLimit/);
    expect(page).toMatch(/RATE_LIMIT_POLICIES\.certVerify/);
    expect(page).toMatch(/Запись с таким кодом не найдена/);
  });
});

describe("security suite / AI tutor academic integrity", () => {
  it("tutor moderation and system prompt block ready answers", () => {
    const mod = read("lib/ai/tutor/moderation/pipeline.ts");
    expect(mod).toMatch(/exam_spoiler|runPreLlmModeration/);
    const prompt = read("lib/ai/tutor/prompts/system.ts");
    expect(prompt).toMatch(/готовые ответы/i);
  });
});
