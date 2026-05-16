import Link from "next/link";
import type { ComponentProps } from "react";
import type { ModuleHubStepStatus, ModuleHubStepView } from "@/lib/module-hub-steps";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
  return (
    <ol className="space-y-4">
      {steps.map((step) => (
        <li
          key={step.kind}
          className="rounded-2xl border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-card sm:p-5"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Шаг {step.order}</span>
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
        </li>
      ))}
    </ol>
  );
}
