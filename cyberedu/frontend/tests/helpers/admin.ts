import { expect, type Page } from "@playwright/test";
import { gotoStable } from "./hydration";

export type AdminRoute = {
  path: string;
  heading: string | RegExp;
};

/** Ключевые read-only маршруты админки для smoke. */
export const ADMIN_SMOKE_ROUTES: AdminRoute[] = [
  { path: "/admin", heading: "Панель управления" },
  { path: "/admin/users", heading: "Пользователи" },
  { path: "/admin/modules", heading: "Модули курса" },
  { path: "/admin/lessons", heading: "Лекции" },
  { path: "/admin/tests", heading: "Тесты" },
  { path: "/admin/practical-tasks", heading: "Практические задания" },
  { path: "/admin/submissions", heading: "Практические отправки" },
  { path: "/admin/reviews", heading: "Отзывы" },
  { path: "/admin/certificates", heading: "Сертификаты" },
];

export async function expectAdminHeading(page: Page, heading: string | RegExp): Promise<void> {
  await expect(page.getByRole("heading", { name: heading }).first()).toBeVisible({ timeout: 20_000 });
}

export async function visitAdminRoute(page: Page, route: AdminRoute): Promise<void> {
  await gotoStable(page, route.path, { expectMain: true });
  await expectAdminHeading(page, route.heading);
}
