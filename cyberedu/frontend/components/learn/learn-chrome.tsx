"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { CyberAmbient, CyberPageShell } from "@/components/cyber/cyber-shell";
import { CyberPageHeader } from "@/components/cyber/cyber-page-header";
import { CyberPanel } from "@/components/cyber/cyber-panel";
import { ScrollReveal } from "@/components/effects/scroll-reveal";
import type { BreadcrumbItem } from "@/components/ui/breadcrumbs";
import { motionPresets } from "@/lib/design-system/motion";
import { cn } from "@/lib/utils";

export function LearnAmbient() {
  return <CyberAmbient />;
}

export function LearnPageShell({ children, className }: { children: ReactNode; className?: string }) {
  return <CyberPageShell className={cn("min-w-0 overflow-x-clip", className)}>{children}</CyberPageShell>;
}

export function LearnSection({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <ScrollReveal delay={delay} className={className}>
      {children}
    </ScrollReveal>
  );
}

export function LearnPanel({
  children,
  className,
  beam = false,
}: {
  children: ReactNode;
  className?: string;
  beam?: boolean;
}) {
  return (
    <CyberPanel beam={beam} className={cn("card-gradient", className)}>
      {children}
    </CyberPanel>
  );
}

export function LearnPageHeader({
  backHref,
  backLabel = "← Назад",
  breadcrumbItems,
  eyebrow,
  title,
  subtitle,
  moduleProgressPercent,
  moduleStepsLabel,
  className,
}: {
  backHref: string;
  backLabel?: string;
  breadcrumbItems?: BreadcrumbItem[];
  eyebrow: string;
  title: string;
  subtitle?: string;
  moduleProgressPercent?: number;
  moduleStepsLabel?: string;
  className?: string;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <CyberPageHeader
        layout="split"
        backHref={backHref}
        backLabel={backLabel}
        breadcrumbItems={breadcrumbItems}
        eyebrow={eyebrow}
        title={title}
        subtitle={subtitle}
        moduleProgressPercent={moduleProgressPercent}
        moduleStepsLabel={moduleStepsLabel}
        className={className}
      />
    </motion.div>
  );
}

export function LearnEnter({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div className={className} {...motionPresets.fadeIn}>
      {children}
    </motion.div>
  );
}
