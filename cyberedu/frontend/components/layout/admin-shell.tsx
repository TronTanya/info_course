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
    <div className={cn("dashboard-grid dashboard-grid--with-sidebar min-w-0 flex-1 overflow-x-clip", className)}>
      <AppSidebar variant="admin" />
      <section className="dashboard-content ce-admin-shell ce-app-main-panel ce-lab-panel relative isolate overflow-x-clip p-3 pb-6 sm:p-6 lg:p-8">
        <div className="ce-learn-ambient pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]" aria-hidden>
          <div className="ce-learn-grid absolute inset-0 opacity-[0.08]" />
        </div>
        <div className="relative z-[1]">
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
