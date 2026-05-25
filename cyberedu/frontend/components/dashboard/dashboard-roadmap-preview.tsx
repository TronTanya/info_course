"use client";

import { RoadmapPreview } from "@/components/dashboard/roadmap-preview";
import { buildRoadmapPreviewItems } from "@/lib/roadmap-preview";
import type { CourseProgressModuleRow } from "@/lib/progress";

/** @deprecated Используйте `RoadmapPreview`. */
export function DashboardRoadmapPreview({
  modules,
  currentModuleId,
}: {
  modules: CourseProgressModuleRow[];
  currentModuleId: string | null;
}) {
  return <RoadmapPreview items={buildRoadmapPreviewItems(modules, currentModuleId)} />;
}
