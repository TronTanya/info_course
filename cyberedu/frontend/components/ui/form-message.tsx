import { cn } from "@/lib/utils";

const variants = {
  error: "border-danger/30 bg-danger/10 text-danger",
  success: "border-primary/25 bg-primary/5 text-foreground",
  info: "border-border bg-muted/50 text-foreground",
} as const;

export function FormMessage({
  children,
  variant = "error",
  className,
  id,
}: {
  children: React.ReactNode;
  variant?: keyof typeof variants;
  className?: string;
  id?: string;
}) {
  return (
    <p
      id={id}
      role="alert"
      className={cn("rounded-lg border px-3 py-2 text-sm", variants[variant], className)}
    >
      {children}
    </p>
  );
}
