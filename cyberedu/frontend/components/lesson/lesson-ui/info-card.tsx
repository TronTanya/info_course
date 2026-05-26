import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type InfoCardProps = {
  title: string;
  children: ReactNode;
  label?: string;
  className?: string;
  variant?: "info" | "success" | "accent";
};

const variants = {
  info: "border-primary/25 bg-primary/8 ring-primary/10",
  success: "border-success/30 bg-success/10 ring-success/15",
  accent: "border-cyan/25 bg-cyan/8 ring-cyan/10",
} as const;

const labelTone = {
  info: "text-primary",
  success: "text-success",
  accent: "text-cyan",
} as const;

export function InfoCard({ title, children, label = "Информация", className, variant = "info" }: InfoCardProps) {
  return (
    <section
      className={cn(
        "rounded-2xl border px-5 py-4 shadow-sm ring-1 ring-inset",
        variants[variant],
        className,
      )}
    >
      <p className={cn("font-mono text-2.5 font-semibold uppercase tracking-widest", labelTone[variant])}>{label}</p>
      <h3 className="mt-1.5 text-base font-semibold leading-snug text-foreground">{title}</h3>
      <div className="mt-2 text-base leading-relaxed text-muted-foreground">{children}</div>
    </section>
  );
}
