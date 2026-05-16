import { cn } from "@/lib/utils";
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
    <div className={cn("dashboard-grid flex-1", wide && "dashboard-grid--wide", className)}>
      <section className="dashboard-content ce-app-main-panel overflow-x-clip p-5 sm:p-7 lg:p-9">
        <DashboardLayout stack={stack}>{children}</DashboardLayout>
      </section>
    </div>
  );
}
