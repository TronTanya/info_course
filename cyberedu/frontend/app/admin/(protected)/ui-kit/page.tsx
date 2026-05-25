import type { Metadata } from "next";
import { AdminShell } from "@/components/layout/admin-shell";
import { UiKitShowcase } from "@/components/internal/ui-kit-showcase";
import { assertUiKitAccess } from "@/lib/ui-kit-access";

export const metadata: Metadata = {
  title: "UI Kit",
};

export default async function AdminUiKitPage() {
  await assertUiKitAccess();

  return (
    <AdminShell>
      <UiKitShowcase variant="admin" />
    </AdminShell>
  );
}
