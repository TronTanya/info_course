import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminSubmissionReviewView } from "@/components/admin/admin-submission-review-view";
import { AdminShell } from "@/components/layout/admin-shell";
import { getAdminSubmissionReviewData } from "@/lib/admin-submission-review";
import { ensureAdminPageAccess } from "@/lib/admin-page-guard";
import { prisma } from "@/lib/db";

type Props = { params: Promise<{ submissionId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  await ensureAdminPageAccess();
  const { submissionId } = await params;
  const s = await prisma.submission.findUnique({
    where: { id: submissionId },
    select: { practicalTask: { select: { title: true } } },
  });
  return { title: s ? `Проверка: ${s.practicalTask.title}` : "Отправка" };
}

export default async function AdminSubmissionDetailPage({ params }: Props) {
  await ensureAdminPageAccess();
  const { submissionId } = await params;

  const data = await getAdminSubmissionReviewData(submissionId);
  if (!data) notFound();

  return (
    <AdminShell>
      <AdminSubmissionReviewView data={data} />
    </AdminShell>
  );
}
