"use client";

import { useEffect } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { LearnPageShell } from "@/components/learn/learn-chrome";
import { TestPageLoadError } from "@/components/test/test-page-states";
import { logError } from "@/lib/log/structured";

export default function ModuleTestError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logError("test_route_error", {
      digest: error.digest,
      code: error.message?.slice(0, 120),
    });
  }, [error]);

  return (
    <DashboardShell>
      <LearnPageShell>
        <TestPageLoadError kind="load" onRetry={reset} />
      </LearnPageShell>
    </DashboardShell>
  );
}
