"use client";

import { useEffect } from "react";
import { AdminDashboardLoadError } from "@/components/admin/admin-states";
import { AdminShell } from "@/components/layout/admin-shell";
import { logError } from "@/lib/log/structured";
import { adminSafeErrorCode, adminSafeDigestRef } from "@/lib/admin-ui-states";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logError("admin_route_error", {
      digest: error.digest,
      code: adminSafeErrorCode(error),
    });
  }, [error]);

  return (
    <AdminShell>
      <AdminDashboardLoadError
        digest={adminSafeDigestRef(error.digest)}
        onRetry={reset}
      />
    </AdminShell>
  );
}
