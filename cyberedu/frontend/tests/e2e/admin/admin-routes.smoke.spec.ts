import { test } from "../../fixtures";
import { ADMIN_SMOKE_ROUTES, visitAdminRoute } from "../../helpers/admin";

test.describe.configure({ mode: "serial" });

test.describe("Admin panel navigation @smoke", () => {
  test("admin can open all primary sections", async ({ adminPage }) => {
    test.setTimeout(120_000);

    for (const route of ADMIN_SMOKE_ROUTES) {
      await visitAdminRoute(adminPage, route);
    }
  });
});
