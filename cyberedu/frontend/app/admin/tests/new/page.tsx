import type { Metadata } from "next";
import Link from "next/link";
import { AdminShell } from "@/components/layout/admin-shell";
import { AdminTestCreateForm } from "@/components/admin/admin-test-create-form";
import { PageHeader } from "@/components/ui/page-header";
import { prisma } from "@/lib/db";

export const metadata: Metadata = {
  title: "Новый тест",
};

export default async function AdminNewTestPage() {
  const modules = await prisma.module.findMany({
    orderBy: { orderNumber: "asc" },
    select: { id: true, title: true, orderNumber: true },
  });

  return (
    <AdminShell>
      <PageHeader
        title="Новый тест"
        description="Тест привязывается к модулю. После создания добавьте вопросы и варианты ответов."
        breadcrumb={
          <Link href="/admin/tests" className="hover:text-foreground">
            ← Тесты
          </Link>
        }
      />
      <div className="mt-8">
        {modules.length === 0 ? (
          <p className="text-sm text-muted-foreground">Нет модулей — сначала создайте модуль курса.</p>
        ) : (
          <AdminTestCreateForm modules={modules} />
        )}
      </div>
    </AdminShell>
  );
}
