import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminShell } from "@/components/layout/admin-shell";
import { UiKitShowcase } from "@/components/internal/ui-kit-showcase";
import { assertUiKitAccess } from "@/lib/ui-kit-access";

export const metadata: Metadata = {
  title: "UI Kit (dev)",
};

/** Только `development` и только ADMIN. В production маршрут отключён. */
export default async function DevUiKitPage() {
  if (process.env.NODE_ENV !== "development") {
    notFound();
  }
  await assertUiKitAccess();

  return (
    <AdminShell>
      <UiKitShowcase variant="dev" />
    </AdminShell>
  );
}
