import { cn } from "@/lib/utils";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { DashboardMobileNav } from "@/components/layout/dashboard-mobile-nav";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

export function DashboardShell({
  children,
  className,
  /** Учебные лаборатории: шире основной контент. */
  wide = false,
  /** Вертикальный ритм основного контента */
  stack = "default",
}: {
  children: React.ReactNode;
  className?: string;
  wide?: boolean;
  stack?: "tight" | "default" | "loose";
}) {
  return (
    <div
      className={cn(
        "dashboard-grid dashboard-grid--with-sidebar flex-1",
        wide && "dashboard-grid--wide",
        className,
      )}
    >
      <AppSidebar variant="student" />
      <section className="dashboard-content ce-app-main-panel min-w-0 overflow-x-clip p-4 sm:p-7 lg:p-9">
        <DashboardMobileNav />
        <DashboardLayout stack={stack}>{children}</DashboardLayout>
      </section>
    </div>
  );
}
