import { describe, expect, it } from "vitest";
import {
  DASHBOARD_METADATA_DESCRIPTION,
  DASHBOARD_METADATA_TITLE,
  buildDashboardHomeMetadata,
  buildDashboardRootMetadata,
  buildDashboardSectionMetadata,
} from "@/lib/dashboard-metadata";

describe("dashboard-metadata", () => {
  it("uses fixed public-safe title and description", () => {
    expect(DASHBOARD_METADATA_TITLE).toBe("Личный кабинет — CyberEdu");
    expect(DASHBOARD_METADATA_DESCRIPTION).toMatch(/прогресс обучения/i);
    expect(DASHBOARD_METADATA_TITLE).not.toMatch(/@|студент|userId/i);
  });

  it("buildDashboardRootMetadata disables indexing", () => {
    const meta = buildDashboardRootMetadata();
    expect(meta.robots).toMatchObject({ index: false, follow: false });
    expect(meta.description).toBe(DASHBOARD_METADATA_DESCRIPTION);
  });

  it("buildDashboardHomeMetadata uses absolute title", () => {
    const meta = buildDashboardHomeMetadata();
    expect(meta.title).toEqual({ absolute: DASHBOARD_METADATA_TITLE });
  });

  it("buildDashboardSectionMetadata does not embed user data", () => {
    const meta = buildDashboardSectionMetadata("Курс");
    expect(meta.title).toBe("Курс");
    expect(JSON.stringify(meta)).not.toMatch(/Иван|email/i);
  });
});
