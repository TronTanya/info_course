import { afterEach, describe, expect, it, vi } from "vitest";
import {
  buildContentSecurityPolicy,
  getEnforceReadyCsp,
  isProductionSecurity,
  resolveCspMode,
  securityHeadersList,
} from "@/lib/security/headers";

const ENV_KEYS = ["CSP_MODE", "ENVIRONMENT", "NODE_ENV", "CSP_REPORT_URI", "NEXT_PUBLIC_APP_URL"] as const;

function saveEnv(): Record<string, string | undefined> {
  const snap: Record<string, string | undefined> = {};
  for (const k of ENV_KEYS) snap[k] = process.env[k];
  return snap;
}

function restoreEnv(snap: Record<string, string | undefined>) {
  for (const k of ENV_KEYS) {
    if (snap[k] === undefined) delete process.env[k];
    else process.env[k] = snap[k];
  }
}

describe("security/headers", () => {
  const snap = saveEnv();

  afterEach(() => {
    restoreEnv(snap);
  });

  it("defaults to report-only CSP in production security", () => {
    process.env.ENVIRONMENT = "production";
    delete process.env.CSP_MODE;
    expect(resolveCspMode()).toBe("report-only");
    const names = securityHeadersList().map((h) => h.key);
    expect(names).toContain("Content-Security-Policy-Report-Only");
    expect(names).not.toContain("Content-Security-Policy");
  });

  it("enforce mode sets Content-Security-Policy", () => {
    process.env.ENVIRONMENT = "production";
    process.env.CSP_MODE = "enforce";
    const names = securityHeadersList().map((h) => h.key);
    expect(names).toContain("Content-Security-Policy");
    expect(names).not.toContain("Content-Security-Policy-Report-Only");
  });

  it("dev defaults CSP off", () => {
    process.env.ENVIRONMENT = "development";
    process.env.NODE_ENV = "development";
    delete process.env.CSP_MODE;
    expect(resolveCspMode()).toBe("off");
    expect(securityHeadersList().some((h) => h.key.includes("Content-Security-Policy"))).toBe(false);
  });

  it("includes baseline security headers", () => {
    process.env.CSP_MODE = "off";
    const map = Object.fromEntries(securityHeadersList().map((h) => [h.key, h.value]));
    expect(map["X-Frame-Options"]).toBe("DENY");
    expect(map["X-Content-Type-Options"]).toBe("nosniff");
    expect(map["Referrer-Policy"]).toBe("strict-origin-when-cross-origin");
    expect(map["Permissions-Policy"]).toContain("camera=()");
    expect(buildContentSecurityPolicy()).toContain("frame-ancestors 'none'");
  });

  it("HSTS only when production security", () => {
    process.env.CSP_MODE = "off";
    process.env.ENVIRONMENT = "development";
    process.env.NODE_ENV = "development";
    expect(securityHeadersList().some((h) => h.key === "Strict-Transport-Security")).toBe(false);

    process.env.ENVIRONMENT = "production";
    const hsts = securityHeadersList().find((h) => h.key === "Strict-Transport-Security");
    expect(hsts?.value).toMatch(/max-age=63072000/);
    expect(hsts?.value).toContain("includeSubDomains");
  });

  it("CSP allows Next.js assets and API connect", () => {
    process.env.NEXT_PUBLIC_APP_URL = "https://app.example.com";
    const csp = buildContentSecurityPolicy();
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("img-src 'self' data: blob:");
    expect(csp).toContain("font-src 'self' data:");
    expect(csp).toContain("worker-src 'self' blob:");
    expect(csp).toContain("connect-src 'self'");
    expect(csp).toContain("https://app.example.com");
    expect(getEnforceReadyCsp()).toBe(csp);
  });

  it("isProductionSecurity respects ENVIRONMENT=development (Docker dev image)", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("ENVIRONMENT", "development");
    expect(isProductionSecurity()).toBe(false);
    vi.unstubAllEnvs();
  });
});
