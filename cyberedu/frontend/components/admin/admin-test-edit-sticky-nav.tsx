"use client";

import Link from "next/link";
import { AdminFormStickyBar } from "@/components/admin/admin-form-sticky-bar";
import { Button } from "@/components/ui/button";

/** Навигация внизу длинной страницы редактирования теста. */
export function AdminTestEditStickyNav({
  moduleId,
}: {
  moduleId: string;
}) {
  return (
    <AdminFormStickyBar backHref="/admin/tests" backLabel="К списку тестов">
      <Button type="button" variant="outline" asChild>
        <Link href={`/admin/modules/${moduleId}/edit`}>К модулю</Link>
      </Button>
    </AdminFormStickyBar>
  );
}
