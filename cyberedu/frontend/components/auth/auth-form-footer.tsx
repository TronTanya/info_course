import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function AuthFormFooter({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("text-center text-sm text-muted-foreground", className)}>{children}</p>;
}
