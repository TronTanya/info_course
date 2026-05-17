import { describe, expect, it } from "vitest";
import robots from "@/app/robots";

describe("robots config", () => {
  it("disallows private zones and allows marketing routes", () => {
    const config = robots();
    const rules = Array.isArray(config.rules) ? config.rules : [config.rules];
    const rule = rules[0];
    expect(rule).toBeDefined();
    expect(rule?.disallow).toEqual(expect.arrayContaining(["/dashboard/", "/admin/", "/api/"]));
    expect(rule?.allow).toEqual(expect.arrayContaining(["/", "/reviews"]));
    expect(config.sitemap).toMatch(/sitemap\.xml$/);
  });
});
