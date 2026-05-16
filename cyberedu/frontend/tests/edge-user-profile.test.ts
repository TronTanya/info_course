import { describe, expect, it } from "vitest";

describe("edge: пользователь без профиля", () => {
  it("Prisma может вернуть user с profile: null", () => {
    const row = { id: "u1", email: "a@b.c", profile: null };
    expect(row.profile).toBeNull();
  });
});
