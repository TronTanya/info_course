const REDACT_SUBSTRINGS = [
  "password",
  "passwordhash",
  "secret",
  "token",
  "authorization",
  "cookie",
  "apikey",
  "api_key",
  "verificationcode",
  "refresh_token",
  "access_token",
];

function isRedactedKey(key: string): boolean {
  const k = key.toLowerCase();
  return REDACT_SUBSTRINGS.some((s) => k.includes(s));
}

function sanitizeValue(v: unknown): unknown {
  if (typeof v === "string") {
    return v.length > 500 ? `${v.slice(0, 500)}…` : v;
  }
  if (v === null || typeof v === "number" || typeof v === "boolean") return v;
  if (typeof v === "bigint") return v.toString();
  return "[omitted]";
}

/**
 * Структурированный аудит без секретов и длинных тел.
 */
export function securityLog(event: string, meta?: Record<string, unknown>): void {
  const safe: Record<string, unknown> = { channel: "security", event, ts: new Date().toISOString() };
  if (meta) {
    for (const [key, value] of Object.entries(meta)) {
      if (isRedactedKey(key)) continue;
      safe[key] = sanitizeValue(value);
    }
  }
  console.info(JSON.stringify(safe));
}
