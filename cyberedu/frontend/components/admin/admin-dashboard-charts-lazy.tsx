"use client";

import dynamic from "next/dynamic";
import type { AdminDashboardChartsData } from "@/lib/admin-dashboard-charts";
import { Skeleton } from "@/components/ui/skeleton";

function ChartsSkeleton() {
  return (
    <div className="grid gap-4 lg:grid-cols-2" aria-busy="true" aria-label="Загрузка диаграмм">
      <Skeleton className="h-70 rounded-2xl" />
      <Skeleton className="h-70 rounded-2xl" />
    </div>
  );
}

const AdminDashboardCharts = dynamic(
  () => import("@/components/admin/admin-dashboard-charts").then((m) => m.AdminDashboardCharts),
  { loading: () => <ChartsSkeleton />, ssr: false },
);

export function AdminDashboardChartsLazy({ data }: { data: AdminDashboardChartsData }) {
  return <AdminDashboardCharts data={data} />;
}
