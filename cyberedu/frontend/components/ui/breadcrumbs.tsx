import Link from "next/link";
import { cn } from "@/lib/utils";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

export function Breadcrumbs({
  items,
  className,
  compact = false,
  "aria-label": ariaLabel = "Навигация",
}: {
  items: BreadcrumbItem[];
  className?: string;
  /** Узкие экраны: обрезка длинных подписей */
  compact?: boolean;
  "aria-label"?: string;
}) {
  if (items.length === 0) return null;

  return (
    <nav
      className={cn(
        "flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-sm",
        compact &&
          "[&_a]:max-w-[6.25rem] [&_a]:truncate min-[390px]:[&_a]:max-w-[7.5rem] [&_span:last-child]:max-w-[7.5rem] [&_span:last-child]:truncate min-[390px]:[&_span:last-child]:max-w-[9rem]",
        className,
      )}
      aria-label={ariaLabel}
    >
      {items.map((item, index) => (
        <span key={`${item.label}-${index}`} className="inline-flex min-w-0 max-w-full items-center gap-2">
          {index > 0 ? (
            <span className="text-muted-foreground/50" aria-hidden>
              /
            </span>
          ) : null}
          {item.href ? (
            <Link
              href={item.href}
              className="font-medium text-primary underline-offset-4 transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
            >
              {item.label}
            </Link>
          ) : (
            <span className="font-medium text-foreground">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
