import { assertAdminDataAccess } from "@/lib/admin-access";
import { getAdminDashboardExtended, type AdminContentOverview } from "@/lib/admin-dashboard";
import {
  buildContentManagementPreviewData,
  type ContentManagementDrafts,
  type ContentManagementPreviewData,
} from "@/lib/content-management-preview-logic";
import { prisma } from "@/lib/db";

export type { ContentManagementPreviewData } from "@/lib/content-management-preview-logic";

async function loadContentDraftCounts(courseId: string): Promise<ContentManagementDrafts> {
  const [inactiveModules, testsWithoutQuestions] = await Promise.all([
    prisma.module.count({ where: { courseId, isActive: false } }),
    prisma.test.count({
      where: { module: { courseId }, questions: { none: {} } },
    }),
  ]);
  return { inactiveModules, testsWithoutQuestions };
}

export async function getContentManagementPreviewData(
  content?: AdminContentOverview,
): Promise<ContentManagementPreviewData> {
  await assertAdminDataAccess();

  const overview = content ?? (await getAdminDashboardExtended()).content;
  const course = await prisma.course.findFirst({
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });

  const drafts = course ? await loadContentDraftCounts(course.id) : null;

  return buildContentManagementPreviewData({
    content: overview,
    drafts,
  });
}
