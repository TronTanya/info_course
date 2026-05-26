import { AdminShell } from "@/components/layout/admin-shell";
import { CardGridSkeleton, PageHeaderSkeleton } from "@/components/ui/page-skeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export type AdminRouteLoadingProps = {
  variant?: "table" | "form" | "dashboard";
  className?: string;
};

export function AdminRouteLoading({ variant = "table", className }: AdminRouteLoadingProps) {
  return (
    <AdminShell>
      <div className={cn("space-y-6", className)} aria-busy="true" aria-label="Загрузка раздела">
        <PageHeaderSkeleton />
        {variant === "dashboard" ? <CardGridSkeleton count={6} /> : null}
        {variant === "table" ? (
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <div className="flex flex-wrap gap-3 border-b border-border p-4">
              <Skeleton className="h-10 w-full max-w-xs rounded-xl" />
              <Skeleton className="h-10 w-28 rounded-xl" />
            </div>
            <div className="space-y-2 p-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-lg" />
              ))}
            </div>
          </div>
        ) : null}
        {variant === "form" ? (
          <div className="space-y-4 rounded-2xl border border-border bg-card p-6">
            <Skeleton className="h-10 w-full max-w-md" />
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
            <div className="flex gap-2 pt-2">
              <Skeleton className="h-10 w-28 rounded-xl" />
              <Skeleton className="h-10 w-24 rounded-xl" />
            </div>
          </div>
        ) : null}
      </div>
    </AdminShell>
  );
}

export default function AdminRouteLoadingPage(props: AdminRouteLoadingProps) {
  return <AdminRouteLoading {...props} />;
}
