"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { DashboardBottomNav } from "@/components/layout/dashboard-bottom-nav";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { cn } from "@/lib/utils";

/** Иммерсивные экраны: свой нижний бар (урок) или полноэкранный фокус (тест, практика). */
export function isImmersiveDashboardPath(pathname: string): boolean {
  return /\/lesson\/|\/practice\/|\/test(?:\/|$)/.test(pathname);
}

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

  return (
    <section
      data-mobile-tab-bar={immersive ? undefined : ""}
      className={cn(
        "dashboard-content ce-app-main-panel ce-mobile-app ce-cockpit-shell ce-lab-panel min-w-0 overflow-x-clip",
        immersive ? "p-3 sm:p-6 lg:p-9" : "ce-mobile-main-pad ce-dashboard-main-pad p-3 sm:p-6 lg:p-9",
        className,
      )}
    >
      <DashboardLayout stack={stack}>{children}</DashboardLayout>
      {!immersive ? <DashboardBottomNav /> : null}
    </section>
  );
}
