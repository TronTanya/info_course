import * as React from "react";
import { PremiumCard, type PremiumCardProps } from "@/components/ui/premium-card";

export type GlassCardProps = Omit<PremiumCardProps, "variant"> & {
  glow?: boolean;
};

/** @deprecated Предпочитайте PremiumCard. Сохранён для обратной совместимости. */
export function GlassCard({ glow = false, ...props }: GlassCardProps) {
  return <PremiumCard variant={glow ? "glow" : "default"} {...props} />;
}
