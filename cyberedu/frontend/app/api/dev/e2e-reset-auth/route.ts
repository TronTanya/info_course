import { NextResponse } from "next/server";
import { clearLoginAttempts, resetLoginLockoutMemoryStore } from "@/lib/security/login-attempts";
import { resetRateLimitServiceForTests } from "@/lib/security/rate-limit-service";

const E2E_IPS = ["direct", "unknown", "127.0.0.1", "::1"] as const;

const E2E_RATE_LIMIT_KEYS = E2E_IPS.flatMap((ip) => [
  `rl:auth:login:ip:${ip}`,
  `rl:auth:credentials:ip:${ip}`,
  `rl:auth:register:ip:${ip}`,
]);

function e2eRateLimitKeysForEmails(emails: string[]): string[] {
  return emails.flatMap((email) => `rl:auth:register:email:email:${email}`);
}

async function clearE2eRateLimitRedis(keys: string[]): Promise<void> {
  const url = process.env.REDIS_URL?.trim();
  if (!url || keys.length === 0) return;
  try {
    const redisMod = (await import("redis")) as typeof import("redis");
    const client = redisMod.createClient({ url });
    client.on("error", () => {});
    await client.connect();
    await client.del(keys as [string, ...string[]]);
    await client.disconnect();
  } catch {
    /* optional */
  }
}

function e2eResetAllowed(): boolean {
  if (process.env.NODE_ENV === "production") return false;
  const env = (process.env.ENVIRONMENT ?? "").trim().toLowerCase();
  return env !== "production" && env !== "prod";
}

export async function POST(req: Request) {
  if (!e2eResetAllowed()) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  resetLoginLockoutMemoryStore();
  resetRateLimitServiceForTests();
  const body = (await req.json().catch(() => ({}))) as { emails?: string[] };
  const emails = Array.isArray(body.emails)
    ? body.emails.map((e) => (typeof e === "string" ? e.trim().toLowerCase() : "")).filter(Boolean)
    : [];

  await clearE2eRateLimitRedis([...E2E_RATE_LIMIT_KEYS, ...e2eRateLimitKeysForEmails(emails)]);

  await Promise.all(
    emails.flatMap((email) => E2E_IPS.map((ip) => clearLoginAttempts(email, ip))),
  );

  return NextResponse.json({ ok: true });
}
