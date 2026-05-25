import { describe, expect, it } from "vitest";
import { resolveAvatarImageSrc, userInitials } from "@/lib/avatar-display";
import { CUSTOM_AVATAR_API_PATH } from "@/lib/avatar-presets";

describe("resolveAvatarImageSrc", () => {
  it("maps preset and custom API paths", () => {
    expect(resolveAvatarImageSrc("/avatars/avatar-ai.svg")).toBe("/avatars/avatar-ai.svg");
    expect(resolveAvatarImageSrc(CUSTOM_AVATAR_API_PATH)).toBe(CUSTOM_AVATAR_API_PATH);
    expect(resolveAvatarImageSrc("/avatars/preset-10.svg")).toBe("/avatars/avatar-ai.svg");
  });

  it("returns null for empty or unsafe values", () => {
    expect(resolveAvatarImageSrc(null)).toBeNull();
    expect(resolveAvatarImageSrc("javascript:alert(1)")).toBeNull();
  });
});

describe("userInitials", () => {
  it("uses first letters of two-word names", () => {
    expect(userInitials("Иван Петров", "ivan@test.ru")).toBe("ИП");
  });
});
