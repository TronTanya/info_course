import { describe, expect, it } from "vitest";
import { ADMIN_EXPORT_ANCHOR } from "@/lib/admin-export-types";
import {
  ADMIN_HEADER_QUICK_ACTIONS,
  getAdminHeaderQuickActions,
} from "@/lib/admin-header-actions";

describe("admin header quick actions", () => {
  it("exposes four control-center actions in spec order", () => {
    const actions = getAdminHeaderQuickActions();
    expect(actions).toHaveLength(4);
    expect(actions.map((a) => a.label)).toEqual([
      "Создать модуль",
      "Проверить практики",
      "Экспорт",
      "Безопасность",
    ]);
  });

  it("links to existing routes only", () => {
    for (const action of ADMIN_HEADER_QUICK_ACTIONS) {
      expect(action.href).toMatch(/^(\/admin(\/|#)|#admin-|#security-watch)/);
      if (action.id === "export-csv") {
        expect(action.href).toBe(`/admin${ADMIN_EXPORT_ANCHOR}`);
        expect(action.external).toBeUndefined();
      }
    }
  });
});
