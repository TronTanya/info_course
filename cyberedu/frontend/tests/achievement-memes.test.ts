import { describe, expect, it } from "vitest";
import { ACHIEVEMENT_CATALOG } from "@/lib/achievements";
import { ACHIEVEMENT_MEME_BY_SLUG, ACHIEVEMENT_MEME_SRCS } from "@/lib/achievement-memes";

describe("achievement-memes", () => {
  it("has 17 catalog badges with meme images", () => {
    expect(ACHIEVEMENT_CATALOG).toHaveLength(17);
    expect(Object.keys(ACHIEVEMENT_MEME_BY_SLUG)).toHaveLength(17);
  });

  it("maps every catalog slug to a meme image", () => {
    for (const { slug } of ACHIEVEMENT_CATALOG) {
      expect(ACHIEVEMENT_MEME_BY_SLUG[slug], `missing meme for ${slug}`).toBeDefined();
    }
  });

  it("uses unique image paths (no duplicate files)", () => {
    const unique = new Set(ACHIEVEMENT_MEME_SRCS);
    expect(unique.size).toBe(ACHIEVEMENT_MEME_SRCS.length);
  });
});
