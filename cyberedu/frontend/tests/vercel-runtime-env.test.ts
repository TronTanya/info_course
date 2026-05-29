import { afterEach, describe, expect, it } from "vitest";
import {
  bootstrapVercelRuntimeEnv,
  isVercelRuntime,
  resolveProductionAuthOrigin,
} from "@/lib/security/vercel-runtime-env";
import { isTrustedProxyEnabled } from "@/lib/security/request-ip";

describe("vercel runtime env", () => {
  const env = { ...process.env };

  afterEach(() => {
    process.env = { ...env };
  });

  it("detects Vercel runtime", () => {
    process.env.VERCEL = "1";
    expect(isVercelRuntime()).toBe(true);
  });

  it("bootstraps AUTH_* from VERCEL_URL", () => {
    process.env.VERCEL = "1";
    process.env.VERCEL_URL = "info-course-git-main-zooland530s-projects.vercel.app";
    delete process.env.AUTH_URL;
    delete process.env.NEXT_PUBLIC_APP_URL;
    delete process.env.NEXTAUTH_URL;

    bootstrapVercelRuntimeEnv();

    expect(process.env.AUTH_URL).toBe(
      "https://info-course-git-main-zooland530s-projects.vercel.app",
    );
    expect(process.env.NEXT_PUBLIC_APP_URL).toBe(process.env.AUTH_URL);
    expect(process.env.NEXTAUTH_URL).toBe(process.env.AUTH_URL);
  });

  it("prefers explicit AUTH_URL over Vercel host", () => {
    process.env.VERCEL = "1";
    process.env.VERCEL_URL = "preview.vercel.app";
    process.env.AUTH_URL = "https://custom.example.com";

    bootstrapVercelRuntimeEnv();

    expect(process.env.AUTH_URL).toBe("https://custom.example.com");
  });

  it("resolveProductionAuthOrigin returns bootstrapped origin", () => {
    process.env.VERCEL = "1";
    process.env.VERCEL_URL = "info-course-sigma.vercel.app";
    delete process.env.AUTH_URL;
    delete process.env.NEXT_PUBLIC_APP_URL;
    delete process.env.NEXTAUTH_URL;

    expect(resolveProductionAuthOrigin()).toBe("https://info-course-sigma.vercel.app");
  });

  it("enables trusted proxy on Vercel without TRUSTED_PROXY", () => {
    process.env.VERCEL = "1";
    delete process.env.TRUSTED_PROXY;
    expect(isTrustedProxyEnabled()).toBe(true);
  });
});
