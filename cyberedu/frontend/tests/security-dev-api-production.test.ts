import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("security: dev API surface in production", () => {
  it("middleware returns 404 for /api/dev/* when isProductionRuntime", () => {
    const src = readFileSync(join(process.cwd(), "middleware.ts"), "utf8");
    expect(src).toMatch(/isProductionRuntime\(\)/);
    expect(src).toMatch(/pathname\.startsWith\("\/api\/dev\/"\)/);
    expect(src).toMatch(/status:\s*404/);
  });

  it("next.config redirects /api/dev in production build", () => {
    const src = readFileSync(join(process.cwd(), "next.config.ts"), "utf8");
    expect(src).toMatch(/NODE_ENV === "production"/);
    expect(src).toMatch(/\/api\/dev\/:path\*/);
  });
});
