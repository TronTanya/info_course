"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { BookOpen, Check, ClipboardCheck, FlaskConical, Lock, Menu, X } from "lucide-react";
import type { LearningNavModuleItem, LearningNavStepItem } from "@/lib/learning-nav";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const stepIcons = {
  lecture: BookOpen,
  video: BookOpen,
  test: ClipboardCheck,
  practice: FlaskConical,
  result: Check,
} as const;

function StepStatusDot({ status }: { status: LearningNavStepItem["status"] }) {
  if (status === "completed") {
    return (
      <span className="ce-learn-os-step-dot flex size-5 items-center justify-center rounded-full bg-success/15 text-success">
        <Check className="size-3" />
      </span>
    );
  }
  if (status === "blocked") {
    return (
      <span className="ce-learn-os-step-dot flex size-5 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Lock className="size-3" />
      </span>
    );
  }
  return <span className="ce-learn-os-step-dot size-2 rounded-full bg-primary" />;
}

export function LearningSidebarPanel({
  modules,
  steps,
  onNavigate,
}: {
  modules: LearningNavModuleItem[];
  steps: LearningNavStepItem[];
  onNavigate?: () => void;
}) {
  return (
    <div className="flex h-full flex-col gap-6">
      <div>
        <p className="ce-learn-os-eyebrow">Траектория курса</p>
        <ul className="mt-3 max-h-[min(40vh,280px)] space-y-1 overflow-y-auto pr-1">
          {modules.map((m) => (
            <li key={m.id}>
              <Link
                href={m.href}
                onClick={onNavigate}
                className={cn(
                  "flex min-h-11 items-center gap-2 rounded-xl px-3 py-2.5 text-sm transition-colors",
                  m.isCurrent && "ce-learn-os-step--active bg-primary/12 font-semibold text-primary ring-1 ring-primary/25",
                  !m.isCurrent && m.unlocked && "text-foreground hover:bg-muted/50",
                  !m.unlocked && "cursor-not-allowed text-muted-foreground opacity-70",
                )}
                aria-current={m.isCurrent ? "page" : undefined}
              >
                <span className="font-mono text-2.5 tabular-nums opacity-70">{m.orderNumber}</span>
                <span className="min-w-0 flex-1 truncate">{m.title}</span>
                {m.completed ? <Check className="size-3.5 shrink-0 text-success" aria-hidden /> : null}
                {!m.unlocked ? <Lock className="size-3.5 shrink-0 opacity-60" aria-hidden /> : null}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <p className="ce-learn-os-eyebrow text-muted-foreground">Шаги модуля</p>
        <ol className="mt-3 space-y-1">
          {steps.map((step) => {
            const Icon = stepIcons[step.kind] ?? BookOpen;
            const clickable = Boolean(step.actionHref) && step.status !== "blocked";
            const inner = (
              <>
                <StepStatusDot status={step.status} />
                <Icon className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
                <span className="min-w-0 flex-1 truncate">{step.title}</span>
              </>
            );
            return (
              <li
                key={step.kind}
                className={cn(step.status === "completed" && "ce-learn-os-step--completed")}
              >
                {clickable && step.actionHref ? (
                  <Link
                    href={step.actionHref}
                    onClick={onNavigate}
                    className={cn(
                      "relative flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors",
                      step.isActive && "ce-learn-os-step--active bg-primary/12 font-medium text-primary ring-1 ring-primary/30",
                      !step.isActive && "text-foreground hover:bg-white/4",
                    )}
                    aria-current={step.isActive ? "step" : undefined}
                  >
                    {step.isActive ? (
                      <motion.span
                        layoutId="learning-active-step"
                        className="pointer-events-none absolute inset-0 rounded-xl ring-2 ring-primary/25"
                        transition={{ type: "spring", stiffness: 380, damping: 32 }}
                      />
                    ) : null}
                    <span className="relative z-1 flex w-full items-center gap-2">{inner}</span>
                  </Link>
                ) : (
                  <span className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-muted-foreground opacity-80">
                    {inner}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

export function LearningSidebar({
  modules,
  steps,
  className,
}: {
  modules: LearningNavModuleItem[];
  steps: LearningNavStepItem[];
  className?: string;
}) {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className={cn("lg:hidden", className)}
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-controls="learning-sidebar-drawer"
      >
        <Menu className="size-4" aria-hidden />
        Содержание курса
      </Button>

      <AnimatePresence>
        {open ? (
          <>
            <motion.button
              type="button"
              className="fixed inset-0 z-40 bg-background/70 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduce ? 0 : 0.2 }}
              aria-label="Закрыть меню"
              onClick={() => setOpen(false)}
            />
            <motion.div
              id="learning-sidebar-drawer"
              role="dialog"
              aria-modal="true"
              aria-label="Навигация по курсу"
              className="ce-learn-os-sidebar fixed inset-y-0 left-0 z-50 flex w-[min(100%,20rem)] flex-col border-r border-white/10 shadow-2xl lg:hidden"
              initial={reduce ? false : { x: "-100%" }}
              animate={{ x: 0 }}
              exit={reduce ? undefined : { x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
            >
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <p className="font-semibold text-foreground">Содержание</p>
                <Button type="button" variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label="Закрыть">
                  <X className="size-5" />
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <LearningSidebarPanel modules={modules} steps={steps} onNavigate={() => setOpen(false)} />
              </div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </>
  );
}
