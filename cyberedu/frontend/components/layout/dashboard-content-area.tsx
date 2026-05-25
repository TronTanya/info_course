"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { DashboardBottomNav } from "@/components/layout/dashboard-bottom-nav";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { isImmersiveDashboardPath, isLessonDashboardPath } from "@/lib/immersive-dashboard-path";
import { cn } from "@/lib/utils";

export { isImmersiveDashboardPath } from "@/lib/immersive-dashboard-path";

export function DashboardContentArea({
  children,
  stack = "default",
  className,
}: {
  children: ReactNode;
  stack?: "tight" | "default" | "loose";
  className?: string;
}) {
  const pathname = usePathname() ?? "";
  const immersive = isImmersiveDashboardPath(pathname);
  const lessonPage = isLessonDashboardPath(pathname);

  return (
    <div
      className={cn(
        "dashboard-content ce-app-main-panel ce-lab-panel min-w-0 p-3 sm:p-6 lg:p-9",
        lessonPage && "ce-lab-panel--page-scroll",
        lessonPage ? "overflow-visible" : "overflow-x-clip",
        immersive && !lessonPage && "ce-lab-panel--page-scroll max-h-none overflow-visible",
        !immersive && "ce-dashboard-main-pad",
        className,
      )}
    >
      <DashboardLayout stack={stack}>{children}</DashboardLayout>
      {!immersive ? <DashboardBottomNav /> : null}
    </div>
  );
}
