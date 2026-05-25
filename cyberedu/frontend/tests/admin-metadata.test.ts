import { describe, expect, it } from "vitest";
import {
  ADMIN_DASHBOARD_DESCRIPTION,
  ADMIN_DASHBOARD_TITLE,
  adminDashboardMetadata,
  adminPageMetadata,
  adminRootMetadata,
} from "@/lib/admin-metadata";

describe("admin metadata", () => {
  it("uses specified dashboard title and description", () => {
    expect(ADMIN_DASHBOARD_TITLE).toBe("Админ-панель — CyberEdu");
    expect(ADMIN_DASHBOARD_DESCRIPTION).toContain("Управление курсом");
    expect(adminDashboardMetadata.title).toEqual({ absolute: ADMIN_DASHBOARD_TITLE });
    expect(adminDashboardMetadata.description).toBe(ADMIN_DASHBOARD_DESCRIPTION);
  });

  it("marks admin routes as noindex", () => {
    expect(adminRootMetadata.robots).toMatchObject({ index: false, follow: false });
    expect(adminDashboardMetadata.robots).toMatchObject({ index: false, follow: false });
  });

  it("page metadata does not embed dynamic admin data", () => {
    const meta = adminPageMetadata("Пользователь");
    expect(meta.title).toBe("Пользователь");
    expect(meta.description).toBe(ADMIN_DASHBOARD_DESCRIPTION);
    expect(JSON.stringify(meta)).not.toMatch(/@|password|token/i);
  });
});
