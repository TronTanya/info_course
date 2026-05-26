import * as React from "react";
import { cn } from "@/lib/utils";

export type DashboardLayoutProps = {
  children: React.ReactNode;
  className?: string;
  stack?: "tight" | "default" | "loose";
};

const stackClass: Record<NonNullable<DashboardLayoutProps["stack"]>, string> = {
  tight: "space-y-6 ce-mobile-stack",
  default: "space-y-8 ce-mobile-stack",
  loose: "space-y-10 ce-mobile-stack ce-mobile-stack--loose",
};

/** Внутренний каркас страниц личного кабинета. */
export function DashboardLayout({ children, className, stack = "default" }: DashboardLayoutProps) {
  return <div className={cn("min-w-0", stackClass[stack], className)}>{children}</div>;
}
