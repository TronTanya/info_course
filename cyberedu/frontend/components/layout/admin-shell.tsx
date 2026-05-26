import Link from "next/link";
import { cn } from "@/lib/utils";
import { AdminMobileNav } from "@/components/admin/admin-mobile-nav";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

export function AdminShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("dashboard-grid dashboard-grid--with-sidebar w-full min-w-0 overflow-x-clip", className)}>
      <AppSidebar variant="admin" />
      <section
        className="dashboard-content ce-admin-shell relative min-w-0 overflow-x-clip rounded-2xl border border-border bg-card p-3 pb-6 shadow-sm sm:p-6 lg:p-8"
        style={{
          background: "var(--card)",
          backdropFilter: "none",
          WebkitBackdropFilter: "none",
        }}
      >
        <div className="relative z-0 min-w-0">
          <AdminMobileNav />
          <p className="mb-4 mt-3 lg:hidden">
            <Link
              href="/dashboard/profile"
              className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/6 px-3 py-2 typo-caption font-semibold text-primary shadow-sm transition-colors hover:border-primary/35 hover:bg-primary/10"
            >
              ← В личный кабинет
            </Link>
          </p>
          <DashboardLayout stack="tight">{children}</DashboardLayout>
        </div>
      </section>
    </div>
  );
}
