import { describe, expect, it } from "vitest";
import { ADMIN_ACCESS_DENIED_PATH, isAdminAccessPublicPath } from "@/lib/admin-access-paths";

describe("admin-access-paths", () => {
  it("exposes access-denied path", () => {
    expect(ADMIN_ACCESS_DENIED_PATH).toBe("/admin/access-denied");
  });

  it("marks only access-denied as public admin path", () => {
    expect(isAdminAccessPublicPath("/admin/access-denied")).toBe(true);
    expect(isAdminAccessPublicPath("/admin/users")).toBe(false);
    expect(isAdminAccessPublicPath("/admin/access-denied/extra")).toBe(true);
  });
});
