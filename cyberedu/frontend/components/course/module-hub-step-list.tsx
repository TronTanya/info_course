"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import type { ComponentProps } from "react";
import type { ModuleHubStepStatus, ModuleHubStepView } from "@/lib/module-hub-steps";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const statusLabels: Record<ModuleHubStepStatus, string> = {
  not_started: "Не начато",
  available: "Доступно",
  completed: "Выполнено",
  blocked: "Заблокировано",
};

const badgeVariant: Record<ModuleHubStepStatus, NonNullable<ComponentProps<typeof Badge>["variant"]>> = {
  not_started: "outline",
  available: "cyan",
  completed: "success",
  blocked: "outline",
};

export function ModuleHubStepList({ steps }: { steps: ModuleHubStepView[] }) {
  const reduce = useReducedMotion();

  return (
    <ol className="space-y-4">
      {steps.map((step, index) => (
        <motion.li
          key={step.kind}
          initial={reduce ? false : { opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          whileHover={reduce ? undefined : { x: 4 }}
          className={cn(
            "ce-learn-panel ce-card-glow rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5",
            step.status === "available" && "ring-1 ring-cyan/20",
            step.status === "completed" && "ring-1 ring-success/15",
          )}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Шаг {step.order}
                </span>
                <Badge variant={badgeVariant[step.status] ?? "outline"}>{statusLabels[step.status]}</Badge>
              </div>
              <h3 className="text-base font-semibold text-foreground">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </div>
            {step.actionLabel && step.actionHref ? (
              <div className="w-full shrink-0 sm:w-auto sm:pt-6">
                <Button variant={step.status === "available" ? "primary" : "outline"} size="sm" className="w-full sm:w-auto" asChild>
                  <Link href={step.actionHref}>{step.actionLabel}</Link>
                </Button>
              </div>
            ) : null}
          </div>
        </motion.li>
      ))}
    </ol>
  );
}
