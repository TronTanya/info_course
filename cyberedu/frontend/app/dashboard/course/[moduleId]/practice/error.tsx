"use client";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PracticePageLoadError } from "@/components/practice/practice-page-states";
import { logError } from "@/lib/log/structured";
import { useEffect } from "react";

export default function ModulePracticeError({
  error,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logError("practice_route_error", {
      digest: error.digest,
      code: error.message?.slice(0, 120),
    });
  }, [error]);

  return (
    <DashboardShell wide>
      <PracticePageLoadError kind="load" />
    </DashboardShell>
  );
}
