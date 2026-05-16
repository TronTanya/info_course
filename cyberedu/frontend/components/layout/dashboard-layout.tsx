import * as React from "react";
import { cn } from "@/lib/utils";

export type DashboardLayoutProps = {
  children: React.ReactNode;
  className?: string;
  /** Плотность вертикальных отступов между секциями */
  stack?: "tight" | "default" | "loose";
};

const stackClass: Record<NonNullable<DashboardLayoutProps["stack"]>, string> = {
  tight: "space-y-6",
  default: "space-y-8",
  loose: "space-y-10",
};

/** Внутренний каркас страниц личного кабинета: одинаковые отступы между блоками. */
export function DashboardLayout({ children, className, stack = "default" }: DashboardLayoutProps) {
  return <div className={cn("min-w-0", stackClass[stack], className)}>{children}</div>;
}
