import { afterEach, describe, expect, it } from "vitest";
import { assertSeedAllowed, existingUserSeedUpdateFields } from "@/lib/seed/ensure-demo-user";
import { Role } from "@prisma/client";

describe("seed password preservation", () => {
  it("existing user update payload never contains passwordHash", () => {
    const payload = existingUserSeedUpdateFields({
      role: Role.ADMIN,
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
    });
    expect(payload).not.toHaveProperty("passwordHash");
    expect(Object.keys(payload).sort()).toEqual(["createdAt", "role"]);
  });

  it("student update payload never contains passwordHash", () => {
    const payload = existingUserSeedUpdateFields({
      role: Role.USER,
      createdAt: new Date(),
    });
    expect(payload).not.toHaveProperty("passwordHash");
  });
});

describe("assertSeedAllowed", () => {
  const envSnapshot = { ...process.env };

  afterEach(() => {
    process.env = { ...envSnapshot };
  });

  it("throws in NODE_ENV=production", () => {
    process.env.NODE_ENV = "production";
    expect(() => assertSeedAllowed()).toThrow(/запрещён в production/i);
  });

  it("allows development", () => {
    process.env.NODE_ENV = "development";
    process.env.ENVIRONMENT = "development";
    expect(() => assertSeedAllowed()).not.toThrow();
  });
});
