import { cn } from "@/lib/utils";

export function ReviewStars({
  value,
  className,
  size = "md",
}: {
  value: number;
  className?: string;
  size?: "sm" | "md";
}) {
  const starClass = size === "sm" ? "size-3.5" : "size-4";
  return (
    <div className={cn("flex gap-0.5", className)} role="img" aria-label={`Оценка ${value} из 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={cn(
            starClass,
            i < value ? "text-warning" : "text-muted-foreground/35",
          )}
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}
