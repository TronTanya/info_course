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
          <div className="overflow-hidden rounded-2xl border border-border bg-card p-4 sm:p-6">
            <Skeleton className="mb-4 h-10 w-full max-w-md rounded-xl" shimmer={false} />
            <Skeleton className="h-[min(28rem,55vh)] w-full rounded-xl" shimmer={false} />
          </div>
        ) : null}
        {variant === "form" ? (
          <div className="space-y-4 rounded-2xl border border-border bg-card p-6">
            <Skeleton className="h-10 w-full max-w-md" shimmer={false} />
            <Skeleton className="h-32 w-full rounded-xl" shimmer={false} />
            <Skeleton className="h-32 w-full rounded-xl" shimmer={false} />
            <div className="flex gap-2 pt-2">
              <Skeleton className="h-10 w-28 rounded-xl" shimmer={false} />
              <Skeleton className="h-10 w-24 rounded-xl" shimmer={false} />
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
