"use client";

import { CertificateProgressCard } from "@/components/certificate/certificate-progress-card";
import {
  DASHBOARD_CERTIFICATE_STATUS_LABELS,
  type CertificateProgressCardModel,
} from "@/lib/certificate-progress-card";
export type { CertificateProgressCardModel } from "@/lib/certificate-progress-card";
import { PremiumCard } from "@/components/ui/premium-card";
import { StatusPill } from "@/components/ui/status-pill";
import { cn } from "@/lib/utils";

export type DashboardCertificateCardProps = {
  model: CertificateProgressCardModel;
  compact?: boolean;
  className?: string;
};

function certificateStatusTone(
  status: CertificateProgressCardModel["status"],
): "locked" | "in_progress" | "success" | "completed" {
  switch (status) {
    case "issued":
      return "completed";
    case "ready":
      return "success";
    case "in_progress":
      return "in_progress";
    case "not_available":
    default:
      return "locked";
  }
}

/** Карточка дашборда: PremiumCard + статус + {@link CertificateProgressCard}. */
export function DashboardCertificateCard({ model, compact = false, className }: DashboardCertificateCardProps) {
  const issued = model.status === "issued";

  return (
    <PremiumCard
      variant="glow"
      padding={compact ? "sidebar" : "md"}
      className={cn(
        "flex h-full min-w-0 flex-col",
        compact && "ce-dashboard-certificate-card--compact",
        className,
      )}
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <StatusPill
          status={certificateStatusTone(model.status)}
          label={DASHBOARD_CERTIFICATE_STATUS_LABELS[model.status]}
        />
      </div>
      <CertificateProgressCard
        model={model}
        showRing={!compact && !issued}
        compact={compact}
        className={cn("flex-1", compact && "ce-certificate-progress-card--compact")}
      />
    </PremiumCard>
  );
}
