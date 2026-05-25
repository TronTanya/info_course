import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminAccessGate } from "@/components/admin/admin-access-gate";
import { resolveAdminAccess } from "@/lib/admin-access";
import { adminPageMetadata } from "@/lib/admin-metadata";

export const metadata: Metadata = adminPageMetadata("Доступ ограничен");

export const dynamic = "force-dynamic";

/**
 * Точка входа для middleware (USER) и server redirect из requireAdmin.
 * ADMIN перенаправляется на обзор — без лишних деталей.
 */
export default async function AdminAccessDeniedPage() {
  const status = await resolveAdminAccess();
  if (status === "admin") redirect("/admin");
  if (status === "unauthenticated") redirect("/auth/login?callbackUrl=%2Fadmin");

  return <AdminAccessGate variant="forbidden" />;
}
