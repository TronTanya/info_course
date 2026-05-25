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

  it("middleware exempts /api/auth/* and /api/csp-report from CSRF", () => {
    const mw = read("middleware.ts");
    expect(mw).toMatch(/!pathname\.startsWith\("\/api\/auth\/"\)/);
    expect(mw).toMatch(/\/api\/csp-report/);
  });

  it("csp-report route exists with public guard", () => {
    const route = read("app/api/csp-report/route.ts");
    expect(route).toMatch(/withPublicApiRoute/);
    expect(route).toMatch(/parseSanitizedCspReports/);
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
    expect(perms).toMatch(/ADMIN_ACCESS_DENIED_PATH/);
    expect(perms).toMatch(/redirect\(ADMIN_ACCESS_DENIED_PATH\)/);
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

  it("AI chat API uses Redis enforceRateLimit via enforceAiMentorApiRateLimit (not sync dev limiter)", () => {
    const route = read("app/api/ai/chat/route.ts");
    expect(route).toMatch(/rateLimit:\s*"aiChat"/);
    const guard = read("lib/security/api-guard.ts");
    expect(guard).toMatch(/enforceAiMentorApiRateLimit/);
    expect(route).not.toMatch(/consumeRateLimitSync/);
    expect(read("lib/security/ai-rate-limit.ts")).toMatch(/enforceRateLimit/);
  });
});

describe("security suite / certificate verification", () => {
  it("verify page uses server verify flow and safe copy", () => {
    const page = read("app/verify/[certificateNumber]/page.tsx");
    expect(page).toMatch(/runPublicCertificateVerify/);
    const states = read("lib/certificate-ui-states.ts");
    expect(states).toMatch(/Сертификат не найден/i);
    expect(read("components/certificate/certificate-verify-view.tsx")).toMatch(
      /CertificatePublicNotFoundState/,
    );
    expect(page).not.toMatch(/PrismaClient|DATABASE_URL/i);
  });
});

describe("security suite / AI tutor academic integrity", () => {
  it("tutor moderation and system prompt block ready answers", () => {
    const mod = read("lib/ai/tutor/moderation/pipeline.ts");
    expect(mod).toMatch(/exam_spoiler|runPreLlmModeration/);
    const prompt = read("lib/ai/tutor/prompts/system.ts");
    expect(prompt).toMatch(/готовые ответы/i);
  });

  it("AI chat route uses auth, rate limit, server context rebuild, safe errors", () => {
    const route = read("app/api/ai/chat/route.ts");
    expect(route).toMatch(/withAuthApiRoute/);
    expect(route).toMatch(/rateLimit: "aiChat"/);
    expect(route).toMatch(/mentorChatBodySchema/);
    expect(route).toMatch(/buildServerAIMentorContext/);
    expect(route).toMatch(/runTutorPipeline/);
    expect(route).toMatch(/handleMentorChatRouteError/);
    expect(route).toMatch(/assertMentorChatConfigured/);
    expect(route).not.toMatch(/console\.error/);
  });

  it("mentor chat API strips forbidden context before zod", () => {
    const api = read("lib/ai/mentor-chat-api.ts");
    expect(api).toMatch(/stripForbiddenFromUnknown/);
    expect(api).toMatch(/safeContext/);
    expect(api).toMatch(/MENTOR_CHAT_UNAVAILABLE_USER_MESSAGE/);
    expect(api).toMatch(/MENTOR_CHAT_PROVIDER_FALLBACK_REPLY/);
  });

  it("mentor chat history API is auth-gated and does not use localStorage", () => {
    const route = read("app/api/ai/chat/history/route.ts");
    expect(route).toMatch(/withAuthApiRoute/);
    expect(route).toMatch(/loadMentorChatHistoryForDisplay/);
    expect(route).toMatch(/clearTrustedChatHistory/);
    const client = read("lib/ai/mentor-ui/chat-history-client.ts");
    expect(client).not.toMatch(/localStorage\s*\./);
    expect(client).toMatch(/credentials: "same-origin"/);
  });
});
