"use client";

import { createElement } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  BookOpen,
  FlaskConical,
  LayoutGrid,
  Lightbulb,
  RotateCcw,
} from "lucide-react";
import {
  buildPracticeMentorChatBoot,
  type PracticeMentorQuickActionId,
} from "@/lib/practice-mentor-panel";
import type { PracticeNextStepAction, PracticeNextStepsPanel } from "@/lib/practice-next-step-ui";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/ui/section-card";
import { cn } from "@/lib/utils";

function linkIcon(href: string) {
  if (href.includes("/certificate")) return Award;
  if (href.includes("/lesson")) return BookOpen;
  if (href.includes("/practice")) return FlaskConical;
  if (href.includes("/test")) return FlaskConical;
  return LayoutGrid;
}

function scrollToAnchor(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export type PracticeNextStepPanelProps = {
  panel: PracticeNextStepsPanel;
  className?: string;
  onMentorAction?: (boot: ReturnType<typeof buildPracticeMentorChatBoot>) => void;
};

function ActionButton({
  action,
  onMentorAction,
}: {
  action: PracticeNextStepAction;
  onMentorAction?: PracticeNextStepPanelProps["onMentorAction"];
}) {
  const className = cn(
    "gap-2",
    action.variant === "primary" ? "w-full sm:w-auto" : "w-full",
  );

  if (action.type === "revise" && action.scrollToId) {
    return (
      <Button
        type="button"
        variant={action.variant === "primary" ? "primary" : action.variant}
        size="lg"
        className={className}
        onClick={() => scrollToAnchor(action.scrollToId!)}
      >
        <RotateCcw className="size-4" aria-hidden />
        {action.title}
        <ArrowRight className="size-4" aria-hidden />
      </Button>
    );
  }

  if (action.type === "mentor" && action.mentorActionId && onMentorAction) {
    return (
      <Button
        type="button"
        variant={action.variant === "primary" ? "primary" : action.variant}
        size={action.variant === "outline" ? "md" : "lg"}
        className={className}
        onClick={() =>
          onMentorAction(
            buildPracticeMentorChatBoot(action.mentorActionId as PracticeMentorQuickActionId),
          )
        }
      >
        <Lightbulb className="size-4" aria-hidden />
        {action.title}
      </Button>
    );
  }

  if (!action.href) return null;

  const Icon = linkIcon(action.href);
  return (
    <Button
      asChild
      variant={action.variant === "primary" ? "primary" : action.variant}
      size="lg"
      className={className}
    >
      <Link href={action.href}>
        {createElement(Icon, { className: "size-4", "aria-hidden": true })}
        {action.title}
        {action.variant === "primary" ? <ArrowRight className="size-4" aria-hidden /> : null}
      </Link>
    </Button>
  );
}

export function PracticeNextStepPanel({ panel, className, onMentorAction }: PracticeNextStepPanelProps) {
  const primary = panel.actions.find((a) => a.variant === "primary");
  const others = panel.actions.filter((a) => a !== primary);

  return (
    <SectionCard
      variant="lab"
      flushTitle
      className={cn("p-4 sm:p-6", className)}
      title="Следующий шаг"
    >
      <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 sm:p-5">
        <h3 className="font-display text-base font-semibold text-foreground sm:text-lg">{panel.headline}</h3>
        <p className="mt-2 text-sm text-pretty text-muted-foreground">{panel.description}</p>
        {primary ? (
          <div className="mt-4">
            <ActionButton action={primary} onMentorAction={onMentorAction} />
            {primary.hint ? (
              <p className="mt-2 text-xs text-muted-foreground">{primary.hint}</p>
            ) : null}
          </div>
        ) : null}
      </div>

      {others.length > 0 ? (
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {others.map((action) => (
            <div
              key={action.id}
              className={cn(
                "rounded-xl border border-border/70 bg-muted/15 p-4",
                action.type === "certificate" && "sm:col-span-2",
              )}
            >
              <ActionButton action={action} onMentorAction={onMentorAction} />
              {action.hint ? (
                <p className="mt-2 text-xs text-muted-foreground">{action.hint}</p>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
    </SectionCard>
  );
}
