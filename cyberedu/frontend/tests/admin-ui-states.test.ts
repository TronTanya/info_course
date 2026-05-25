import { describe, expect, it } from "vitest";
import {
  ADMIN_ACTION_ERROR_FALLBACK,
  sanitizeAdminActionError,
} from "@/lib/admin-ui-states";

describe("admin-ui-states", () => {
  it("sanitizeAdminActionError keeps safe user-facing messages", () => {
    expect(sanitizeAdminActionError("Студент не выполнил условия курса.")).toBe(
      "Студент не выполнил условия курса.",
    );
  });

  it("sanitizeAdminActionError hides prisma and connection leaks", () => {
    expect(sanitizeAdminActionError("Prisma P1001: Can't reach database")).toBe(
      ADMIN_ACTION_ERROR_FALLBACK,
    );
    expect(sanitizeAdminActionError("invalid DATABASE_URL")).toBe(ADMIN_ACTION_ERROR_FALLBACK);
    expect(sanitizeAdminActionError("Error at /node_modules/foo.ts:12")).toBe(
      ADMIN_ACTION_ERROR_FALLBACK,
    );
  });

  it("sanitizeAdminActionError falls back on empty", () => {
    expect(sanitizeAdminActionError(null)).toBe(ADMIN_ACTION_ERROR_FALLBACK);
  });
});
