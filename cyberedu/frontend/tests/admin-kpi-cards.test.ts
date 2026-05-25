import { describe, expect, it } from "vitest";
import {
  buildAdminKpiCardsView,
  resolveAdminKpiCardsInput,
} from "@/lib/admin-kpi-cards";

const base = {
  totalStudents: 42,
  activeStudents7d: 18,
  averageProgressPercentage: 55,
  pendingPracticeReviews: 3,
  issuedCertificates: 10,
  auditLogAvailable: true,
  failedLogins24h: 0,
  securityEvents24h: 0,
  trends: {},
};

describe("buildAdminKpiCardsView", () => {
  it("renders six KPI cards", () => {
    expect(buildAdminKpiCardsView(base)).toHaveLength(6);
  });

  it("shows em dash when audit is disabled", () => {
    const cards = buildAdminKpiCardsView({ ...base, auditLogAvailable: false });
    const sec = cards.find((c) => c.id === "security");
    expect(sec?.value).toBe("—");
    expect(sec?.emptyHint).toBe("Нет данных");
    expect(sec?.trend).toBeUndefined();
  });

  it("prefers failed logins over generic security count", () => {
    const cards = buildAdminKpiCardsView({
      ...base,
      failedLogins24h: 5,
      securityEvents24h: 2,
    });
    expect(cards.find((c) => c.id === "security")?.value).toBe("5");
  });

  it("uses security events when no failed logins", () => {
    const cards = buildAdminKpiCardsView({
      ...base,
      securityEvents24h: 4,
    });
    expect(cards.find((c) => c.id === "security")?.value).toBe("4");
  });

  it("shows no data for average progress when null", () => {
    const cards = buildAdminKpiCardsView({ ...base, averageProgressPercentage: null });
    expect(cards.find((c) => c.id === "avg-progress")?.value).toBe("—");
  });

  it("maps control center KPI shape (pendingSubmissions) without undefined values", () => {
    const input = resolveAdminKpiCardsInput({
      totalStudents: 5,
      activeStudents7d: 2,
      averageProgressPercent: 40,
      pendingSubmissions: 7,
      certificatesIssued: 11,
      failedLogins7d: 0,
      securityEvents7d: 0,
      auditLogAvailable: true,
      failedLogins24h: 0,
      securityEvents24h: 0,
      trends: {},
    });
    const cards = buildAdminKpiCardsView(input);
    expect(cards.find((c) => c.id === "pending-practice")?.value).toBe("7");
    expect(cards.find((c) => c.id === "certificates")?.value).toBe("11");
  });

  it("includes trend only when provided", () => {
    const cards = buildAdminKpiCardsView({
      ...base,
      trends: { activeStudents7d: { direction: "up", label: "+2 к прошлой неделе" } },
    });
    expect(cards.find((c) => c.id === "active-7d")?.trend?.label).toContain("+2");
    expect(cards.find((c) => c.id === "students")?.trend).toBeUndefined();
  });
});
