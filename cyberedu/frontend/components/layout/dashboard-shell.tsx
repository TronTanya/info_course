import { cn } from "@/lib/utils";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { DashboardContentArea } from "@/components/layout/dashboard-content-area";

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
        "dashboard-grid dashboard-grid--with-sidebar min-w-0 flex-1 overflow-x-clip",
        wide && "dashboard-grid--wide",
        className,
      )}
    >
      <AppSidebar variant="student" />
      <DashboardContentArea stack={stack}>{children}</DashboardContentArea>
    </div>
  );
}
