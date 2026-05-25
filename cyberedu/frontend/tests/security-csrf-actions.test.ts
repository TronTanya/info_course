/**
 * CSRF: Server Actions и NextAuth — не дублируем middleware; контракт покрытия.
 */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  CSRF_SERVER_ACTION_MODULES,
  CSRF_SURFACE_PROTECTION,
} from "@/lib/security/csrf-coverage";

const root = join(process.cwd());
const read = (rel: string) => readFileSync(join(root, rel), "utf8");

describe("security/csrf Server Actions coverage", () => {
  it("all lib/actions modules are use server (Next.js Origin CSRF)", () => {
    const dir = join(root, "lib/actions");
    const files = readdirSync(dir).filter((f) => f.endsWith(".ts"));
    expect(files.length).toBeGreaterThan(0);
    for (const file of files) {
      const src = readFileSync(join(dir, file), "utf8");
      expect(src, file).toMatch(/^"use server";/m);
    }
  });

  it("expected admin/student action files are listed in CSRF_SERVER_ACTION_MODULES", () => {
    const dir = join(root, "lib/actions");
    const onDisk = readdirSync(dir).filter((f) => f.endsWith(".ts")).sort();
    expect(onDisk).toEqual([...CSRF_SERVER_ACTION_MODULES].sort());
  });

  it("submitTestAttemptAction and practice actions exist (test/practice submit)", () => {
    expect(read("lib/actions/test.ts")).toMatch(/export async function submitTestAttemptAction/);
    expect(read("lib/actions/practice.ts")).toMatch(/export async function submit/);
  });

  it("register and logout use server actions", () => {
    expect(read("lib/actions/register.ts")).toMatch(/registerAction/);
    expect(read("lib/actions/logout.ts")).toMatch(/logoutAction/);
  });

  it("admin certificate revoke/issue use requireAdmin server actions", () => {
    const adminCert = read("lib/actions/admin-certificates.ts");
    expect(adminCert).toMatch(/requireAdmin/);
    expect(adminCert).toMatch(/revoke/i);
  });

  it("middleware does not apply Origin check to Server Action posts", () => {
    const mw = read("middleware.ts");
    expect(mw).toMatch(/verifyApiCsrf/);
    expect(mw).toMatch(/pathname\.startsWith\("\/api\/"\)/);
    expect(mw).not.toMatch(/Next-Action|next-action/i);
  });

  it("login uses NextAuth CSRF, not middleware Origin on auth routes", () => {
    expect(CSRF_SURFACE_PROTECTION.login.mechanism).toBe("nextauth_csrf");
    const authHelper = read("e2e/helpers/auth.ts");
    expect(authHelper).toMatch(/\/api\/auth\/csrf/);
    expect(authHelper).toMatch(/csrfToken/);
  });

  it("certificate issue API client uses POST (protected by middleware when browser sends Origin)", () => {
    const client = read("lib/certificate-issue-client.ts");
    expect(client).toMatch(/\/api\/certificates\/generate/);
    expect(client).toMatch(/method:\s*"POST"/);
  });
});
