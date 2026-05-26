"use client";

import { Users, Layers, FlaskConical, Award, type LucideIcon } from "lucide-react";
import { AnimatedCounter } from "@/components/effects/animated-counter";
import { StaggerItem, StaggerReveal } from "@/components/effects/scroll-reveal";
import { cn } from "@/lib/utils";

const labels: { key: keyof LandingStatsData; label: string; icon: LucideIcon }[] = [
  { key: "totalUsers", label: "пользователей", icon: Users },
  { key: "activeModules", label: "модулей", icon: Layers },
  { key: "practiceTasks", label: "практик", icon: FlaskConical },
  { key: "certificatesIssued", label: "сертификатов", icon: Award },
];

export type LandingStatsData = {
  totalUsers: number;
  activeModules: number;
  practiceTasks: number;
  certificatesIssued: number;
};

export function LandingStatsGrid({ stats }: { stats: LandingStatsData }) {
  return (
    <StaggerReveal className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
      {labels.map(({ key, label, icon: Icon }) => (
        <StaggerItem key={key}>
          <div
            className={cn(
              "ds-card flex flex-col items-center rounded-2xl px-5 py-8 text-center shadow-card",
              "ring-1 ring-inset ring-white/50 dark:ring-cyan/10",
            )}
          >
            <div className="mb-4 flex size-12 items-center justify-center rounded-xl border border-primary/15 bg-primary/8 text-primary transition-transform duration-300 group-hover:scale-105">
              <Icon className="size-6" strokeWidth={1.5} aria-hidden />
            </div>
            <p className="font-mono text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              <AnimatedCounter value={stats[key]} />
            </p>
            <p className="mt-2 text-sm font-medium text-muted-foreground">{label}</p>
          </div>
        </StaggerItem>
      ))}
    </StaggerReveal>
  );
}
