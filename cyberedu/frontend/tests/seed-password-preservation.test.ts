import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Role } from "@prisma/client";

const prismaMock = vi.hoisted(() => ({
  user: {
    findUnique: vi.fn(),
    update: vi.fn(),
    create: vi.fn(),
  },
}));

vi.mock("@/lib/db", () => ({
  prisma: prismaMock,
}));

vi.mock("bcryptjs", () => ({
  default: {
    hash: vi.fn(async (plain: string) => `bcrypt:${plain}`),
  },
}));

import {
  assertSeedAllowed,
  ensureDemoUser,
  existingUserSeedUpdateFields,
} from "@/lib/seed/ensure-demo-user";

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

  it("throws when ENVIRONMENT=production (even if NODE_ENV=production in Docker)", () => {
    vi.stubEnv("NODE_ENV", "production");
    process.env.ENVIRONMENT = "production";
    delete process.env.E2E_PRODUCTION_SMOKE;
    expect(() => assertSeedAllowed()).toThrow(/запрещён в production/i);
  });

  it("allows seed when E2E_PRODUCTION_SMOKE=1 (isolated CI DB only)", () => {
    process.env.ENVIRONMENT = "production";
    process.env.E2E_PRODUCTION_SMOKE = "1";
    expect(() => assertSeedAllowed()).not.toThrow();
  });

  it("allows seed when ENVIRONMENT=development and NODE_ENV=production", () => {
    vi.stubEnv("NODE_ENV", "production");
    process.env.ENVIRONMENT = "development";
    expect(() => assertSeedAllowed()).not.toThrow();
  });
});

describe("ensureDemoUser", () => {
  const createdAt = new Date("2026-01-01T00:00:00.000Z");

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates user with hashed password when absent", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.user.create.mockResolvedValue({
      id: "new-id",
      email: "admin@cyberedu.local",
      passwordHash: "bcrypt:Admin12345!",
      role: Role.ADMIN,
      createdAt,
    });

    const result = await ensureDemoUser({
      email: "admin@cyberedu.local",
      role: Role.ADMIN,
      createdAt,
      passwordPlain: "Admin12345!",
    });

    expect(result.created).toBe(true);
    expect(prismaMock.user.create).toHaveBeenCalledOnce();
    expect(prismaMock.user.update).not.toHaveBeenCalled();
  });

  it("does not change passwordHash for existing admin", async () => {
    const existingHash = "$2a$12$existinghashvalue";
    prismaMock.user.findUnique.mockResolvedValue({ id: "admin-id", passwordHash: existingHash });
    prismaMock.user.update.mockResolvedValue({
      id: "admin-id",
      email: "admin@cyberedu.local",
      passwordHash: existingHash,
      role: Role.ADMIN,
      createdAt,
    });

    const result = await ensureDemoUser({
      email: "admin@cyberedu.local",
      role: Role.ADMIN,
      createdAt,
      passwordPlain: "DifferentDemoPassword!",
    });

    expect(result.created).toBe(false);
    expect(result.passwordHashUnchanged).toBe(true);
    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: "admin-id" },
      data: existingUserSeedUpdateFields({ role: Role.ADMIN, createdAt }),
    });
    expect(prismaMock.user.create).not.toHaveBeenCalled();
  });
});
