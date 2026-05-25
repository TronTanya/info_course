import { cn } from "@/lib/utils";

export function navLinkClass(mobile?: boolean, active?: boolean) {
  return cn(
    "rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    mobile
      ? cn(
          "flex min-h-11 w-full items-center gap-3 border px-4 py-3 text-base text-foreground",
          active
            ? "border-primary/35 bg-primary/[0.08] text-primary shadow-sm"
            : "border-border/60 bg-card hover:bg-muted",
        )
      : cn(
          "px-3 py-2",
          active ? "bg-primary/10 text-primary ring-1 ring-primary/20" : "text-muted-foreground hover:bg-muted hover:text-foreground",
        ),
  );
}
