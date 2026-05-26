"use client";

import { Shield, ShieldAlert, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { TutorPipelineMeta } from "@/lib/ai/tutor/types";
import {
  difficultyToSecurityLevel,
  refusalCodeHint,
  resolveSafeResponseState,
  safeResponseLabel,
  securityLevelLabel,
  topicToThreatCategory,
} from "@/lib/ai/mentor-ui/badges";
import { cn } from "@/lib/utils";

const levelVariant = {
  awareness: "cyan" as const,
  analyst: "primary" as const,
  specialist: "warning" as const,
};

export function MentorMessageMeta({ meta }: { meta?: TutorPipelineMeta }) {
  if (!meta) return null;

  const level = difficultyToSecurityLevel(meta.difficulty);
  const safe = resolveSafeResponseState(meta);
  const hint = refusalCodeHint(meta.refusalCode);

  return (
    <div className="mt-2 flex flex-wrap items-center gap-1.5 border-t border-cyan/10 pt-2">
      <Badge variant={levelVariant[level]} className="font-mono text-2.5 uppercase tracking-wide">
        {securityLevelLabel(level)}
      </Badge>
      <Badge variant="outline" className="text-2.5">
        {topicToThreatCategory(meta.topic)}
      </Badge>
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-2.5 font-medium",
          safe === "safe" && "border-success/30 bg-success/10 text-success",
          safe === "refusal" && "border-warning/35 bg-warning/12 text-warning",
          safe === "policy" && "border-danger/30 bg-danger/10 text-danger",
        )}
      >
        {safe === "safe" ? <ShieldCheck className="size-3" /> : safe === "refusal" ? <ShieldAlert className="size-3" /> : <Shield className="size-3" />}
        {safeResponseLabel(safe)}
      </span>
      {hint ? <span className="w-full text-2.5 text-muted-foreground">{hint}</span> : null}
    </div>
  );
}
