import { describe, expect, it } from "vitest";
import {
  parseSanitizedCspReports,
  safeCspBlockedHost,
  safeCspUriPath,
} from "@/lib/security/csp-report";

describe("security/csp-report", () => {
  it("extracts safe fields from standard csp-report envelope", () => {
    const reports = parseSanitizedCspReports({
      "csp-report": {
        "document-uri": "https://app.example/dashboard?token=secret",
        "violated-directive": "script-src",
        "effective-directive": "script-src",
        "blocked-uri": "https://evil.example/inject.js?x=1",
        disposition: "report",
        "status-code": 200,
      },
    });
    expect(reports).toHaveLength(1);
    expect(reports[0].violatedDirective).toBe("script-src");
    expect(reports[0].documentPath).toBe("/dashboard");
    expect(reports[0].blockedHost).toBe("evil.example");
    expect(JSON.stringify(reports[0])).not.toContain("secret");
    expect(JSON.stringify(reports[0])).not.toContain("token=");
  });

  it("rejects empty or unrecognizable payloads", () => {
    expect(parseSanitizedCspReports(null)).toEqual([]);
    expect(parseSanitizedCspReports({ foo: "bar" })).toEqual([]);
  });

  it("safeCspUriPath blocks path traversal", () => {
    expect(safeCspUriPath("/admin/../etc/passwd")).toBeUndefined();
    expect(safeCspUriPath("/dashboard/course")).toBe("/dashboard/course");
  });

  it("safeCspBlockedHost returns hostname only", () => {
    expect(safeCspBlockedHost("https://cdn.example/a.js?q=1")).toBe("cdn.example");
  });

  it("csp-report route is wired with public guard and rate limit", async () => {
    const src = await import("node:fs/promises").then((fs) =>
      fs.readFile("app/api/csp-report/route.ts", "utf8"),
    );
    expect(src).toMatch(/withPublicApiRoute/);
    expect(src).toMatch(/rateLimit:\s*"cspReport"/);
    expect(src).toMatch(/SECURITY_ACTIONS\.SECURITY_CSP_REPORT/);
    expect(src).not.toMatch(/console\.log/);
  });
});
