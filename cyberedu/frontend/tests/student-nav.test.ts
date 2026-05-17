import { describe, expect, it } from "vitest";
import { dashboardSectionBreadcrumbs, moduleStepBreadcrumbs } from "@/lib/student-nav";

describe("student-nav breadcrumbs", () => {
  it("builds module step trail", () => {
    const items = moduleStepBreadcrumbs("mod-1", 3, "Тест");
    expect(items).toHaveLength(4);
    expect(items[2]?.href).toBe("/dashboard/course/mod-1");
    expect(items[3]?.label).toBe("Тест");
  });

  it("builds dashboard section trail", () => {
    const items = dashboardSectionBreadcrumbs("Сертификат");
    expect(items).toHaveLength(2);
    expect(items[0]?.href).toBe("/dashboard");
    expect(items[1]?.label).toBe("Сертификат");
  });
});
