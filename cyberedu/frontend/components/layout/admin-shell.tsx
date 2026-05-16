import Link from "next/link";
import { cn } from "@/lib/utils";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

export function AdminShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("dashboard-grid flex-1", className)}>
      <section className="dashboard-content ce-admin-shell overflow-x-clip p-4 sm:p-6 lg:p-8">
        <p className="mb-5 lg:hidden">
          <Link
            href="/dashboard/profile"
            className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/6 px-3 py-2 typo-caption font-semibold text-primary shadow-sm transition-colors hover:border-primary/35 hover:bg-primary/10"
          >
            ← В личный кабинет
          </Link>
        </p>
        <DashboardLayout stack="tight">{children}</DashboardLayout>
      </section>
    </div>
  );
}
