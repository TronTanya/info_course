import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ADMIN_EXPORT_FORBIDDEN_CSV_SUBSTRINGS } from "@/lib/admin-csv";
import { sanitizeAdminActionError } from "@/lib/admin-ui-states";

describe("admin security review — data sanitization", () => {
  it("sanitizeAdminActionError hides Prisma/stack details in UI strings", () => {
    expect(sanitizeAdminActionError('Invalid `prisma.user.findMany()` invocation:\nP2002')).toBe(
      "Не удалось выполнить действие. Повторите попытку или обратитесь к администратору платформы.",
    );
    expect(sanitizeAdminActionError("passwordHash leaked")).toBe(
      "Не удалось выполнить действие. Повторите попытку или обратитесь к администратору платформы.",
    );
    expect(sanitizeAdminActionError("Модуль сохранён.")).toBe("Модуль сохранён.");
  });

  it("admin error boundary does not render error.message to users", () => {
    const src = readFileSync(join(process.cwd(), "app/admin/(protected)/error.tsx"), "utf8");
    expect(src).not.toMatch(/error\.message/);
    expect(src).toContain("adminSafeErrorCode");
  });
});

describe("admin security review — export guardrails", () => {
  it("forbids sensitive column names in CSV export", () => {
    expect(ADMIN_EXPORT_FORBIDDEN_CSV_SUBSTRINGS).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/password/i),
        expect.stringMatching(/token/i),
      ]),
    );
  });
});

describe("admin security review — server actions", () => {
  const actionsDir = join(process.cwd(), "lib/actions");

  const adminActionFiles = [
    "admin-certificates.ts",
    "admin-lessons.ts",
    "admin-modules.ts",
    "admin-practical-tasks.ts",
    "admin-reviews.ts",
    "admin-submissions.ts",
    "admin-tests.ts",
    "admin-users.ts",
  ];

  it.each(adminActionFiles)("%s calls requireAdmin", (file) => {
    const src = readFileSync(join(actionsDir, file), "utf8");
    expect(src).toContain("requireAdmin");
  });
});

describe("admin security review — protected layout", () => {
  it("admin (protected) layout resolves access before children", () => {
    const src = readFileSync(
      join(process.cwd(), "app/admin/(protected)/layout.tsx"),
      "utf8",
    );
    expect(src).toContain("resolveAdminAccess");
    expect(src).toContain("unauthenticated");
    expect(src).toContain("unauthorized");
  });
});
