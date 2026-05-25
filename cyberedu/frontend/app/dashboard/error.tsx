"use client";

import { DashboardPageLoadError } from "@/components/dashboard/dashboard-page-states";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { logError } from "@/lib/log/structured";
import { useEffect } from "react";

export default function DashboardError({
  error,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logError("dashboard_route_error", {
      digest: error.digest,
      code: error.message?.slice(0, 120),
    });
  }, [error]);

  return (
    <DashboardShell>
      <DashboardPageLoadError kind="dashboard" />
    </DashboardShell>
  );
}
