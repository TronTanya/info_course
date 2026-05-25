import { getLockedUnlockHint, getModuleAction, getUiStatus } from "@/lib/course-path-ui";
import { buildRoadmapPreviewModules } from "@/lib/dashboard-ui";
import type { CourseEntityUiStatus } from "@/types/course-ui-status";
import type { CourseProgressModuleRow } from "@/lib/progress";
import type { DashboardRoadmapItemStatus } from "@/types/dashboard-view-model";

export const ROADMAP_PREVIEW_MIN = 3;
export const ROADMAP_PREVIEW_MAX = 5;
export const ROADMAP_PREVIEW_COURSE_HREF = "/dashboard/course";

export const ROADMAP_PREVIEW_STATUS_LABELS: Record<DashboardRoadmapItemStatus, string> = {
  completed: "Завершено",
  in_progress: "В процессе",
  available: "Доступно",
  locked: "Заблокировано",
};

export type RoadmapPreviewItem = {
  moduleId: string;
  orderNumber: number;
  title: string;
  status: DashboardRoadmapItemStatus;
  statusLabel: string;
  progressPercentage: number;
  href: string;
  lockedReason?: string;
  ctaLabel: string;
  ctaDisabled: boolean;
  isCurrent: boolean;
};

export function mapEntityStatusToRoadmapPreviewStatus(
  status: CourseEntityUiStatus,
): DashboardRoadmapItemStatus {
  switch (status) {
    case "completed":
      return "completed";
    case "in_progress":
    case "pending_review":
    case "needs_retry":
      return "in_progress";
    case "locked":
      return "locked";
    case "available":
    default:
      return "available";
  }
}

export function resolveRoadmapPreviewCta(
  row: CourseProgressModuleRow,
  previewStatus: DashboardRoadmapItemStatus,
): { label: string; href: string; disabled: boolean } {
  if (previewStatus === "locked") {
    return { label: "Заблокировано", href: `/dashboard/course/${row.module.id}`, disabled: true };
  }
  if (previewStatus === "completed") {
    return {
      label: "Открыть",
      href: `/dashboard/course/${row.module.id}`,
      disabled: false,
    };
  }

  const raw = getModuleAction(row);
  const href = raw.href && raw.href !== "#" ? raw.href : `/dashboard/course/${row.module.id}`;
  if (raw.label === "Начать" || raw.label === "Продолжить" || raw.label === "Открыть") {
    return { label: raw.label, href, disabled: false };
  }
  if (previewStatus === "available") {
    return { label: "Начать", href, disabled: false };
  }
  return { label: "Продолжить", href, disabled: false };
}

export function buildRoadmapPreviewItems(
  modules: CourseProgressModuleRow[],
  currentModuleId: string | null,
  limit = ROADMAP_PREVIEW_MAX,
): RoadmapPreviewItem[] {
  const capped = Math.min(ROADMAP_PREVIEW_MAX, Math.max(ROADMAP_PREVIEW_MIN, limit));
  const rows = buildRoadmapPreviewModules(modules, currentModuleId, capped);

  return rows.map((preview) => {
    const row = modules.find((m) => m.module.id === preview.moduleId);
    if (!row) {
      const status: DashboardRoadmapItemStatus = "locked";
      return {
        moduleId: preview.moduleId,
        orderNumber: preview.orderNumber,
        title: preview.title,
        status,
        statusLabel: ROADMAP_PREVIEW_STATUS_LABELS[status],
        progressPercentage: preview.progressPercent,
        href: preview.href,
        ctaLabel: "Заблокировано",
        ctaDisabled: true,
        isCurrent: preview.isCurrent,
      };
    }

    const status = mapEntityStatusToRoadmapPreviewStatus(getUiStatus(row));
    const cta = resolveRoadmapPreviewCta(row, status);

    return {
      moduleId: preview.moduleId,
      orderNumber: preview.orderNumber,
      title: preview.title,
      status,
      statusLabel: ROADMAP_PREVIEW_STATUS_LABELS[status],
      progressPercentage: preview.progressPercent,
      href: cta.disabled ? preview.href : cta.href,
      lockedReason: status === "locked" ? getLockedUnlockHint(row, modules) : undefined,
      ctaLabel: cta.label,
      ctaDisabled: cta.disabled,
      isCurrent: preview.isCurrent,
    };
  });
}
