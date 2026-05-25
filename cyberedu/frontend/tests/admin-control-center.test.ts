import { describe, expect, it } from "vitest";
import { adminKpiCardsFromControlCenter, buildAdminKpiCardsView } from "@/lib/admin-kpi-cards";
import { getAdminHeaderQuickActions } from "@/lib/admin-header-actions";
import { getStorageDriver } from "@/lib/storage";

describe("admin control center helpers", () => {
  it("storage driver label does not expose secrets", () => {
    const driver = getStorageDriver();
    expect(["local", "s3"]).toContain(driver);
  });

  it("builds six KPI cards including security when audit is on", () => {
    const cards = buildAdminKpiCardsView(
      adminKpiCardsFromControlCenter({
        totalStudents: 10,
        activeStudents7d: 4,
        averageProgressPercent: 55,
        pendingSubmissions: 2,
        certificatesIssued: 3,
        failedLogins7d: 1,
        securityEvents7d: 0,
        auditLogAvailable: true,
        failedLogins24h: 0,
        securityEvents24h: 0,
        trends: {},
      }),
    );
    expect(cards).toHaveLength(6);
    expect(cards.find((c) => c.id === "security")?.label).toBe("Безопасность");
  });

  it("header quick actions match control center spec", () => {
    expect(getAdminHeaderQuickActions().map((a) => a.id)).toEqual([
      "create-module",
      "review-practices",
      "export-csv",
      "security-watch",
    ]);
  });
});
