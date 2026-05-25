import { describe, expect, it } from "vitest";
import { publicNavLinks } from "@/lib/design-system/nav-config";
import { LANDING_SECTION_IDS } from "@/lib/landing-content";

describe("landing a11y conventions", () => {
  it("maps public nav anchors to section ids", () => {
    const hashes = publicNavLinks.map((l) => l.href.replace("/#", ""));
    expect(hashes).toContain(LANDING_SECTION_IDS.program);
    expect(hashes).toContain(LANDING_SECTION_IDS.practice);
    expect(hashes).toContain(LANDING_SECTION_IDS.mentor);
    expect(hashes).toContain(LANDING_SECTION_IDS.security);
    expect(hashes).toContain(LANDING_SECTION_IDS.certificate);
    expect(hashes).toContain(LANDING_SECTION_IDS.faq);
  });

  it("does not mark hash-only links as current page", () => {
    for (const link of publicNavLinks) {
      if (link.href.startsWith("/#")) {
        expect(link.href).toMatch(/^\/#[a-z0-9-]+$/);
      }
    }
  });
});
