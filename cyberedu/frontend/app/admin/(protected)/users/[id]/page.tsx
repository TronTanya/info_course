import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminStudentDetailView } from "@/components/admin/admin-student-detail-view";
import { AdminShell } from "@/components/layout/admin-shell";
import { adminPageMetadata } from "@/lib/admin-metadata";
import { ensureAdminPageAccess } from "@/lib/admin-page-guard";
import { getAdminUserDetail } from "@/lib/admin-user-detail";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata(): Promise<Metadata> {
  await ensureAdminPageAccess();
  return adminPageMetadata("Пользователь");
}

export default async function AdminUserDetailPage({ params }: Props) {
  await ensureAdminPageAccess();
  const { id } = await params;
  const data = await getAdminUserDetail(id);
  if (!data) notFound();

  return (
    <AdminShell>
      <AdminStudentDetailView data={data} />
    </AdminShell>
  );
}
