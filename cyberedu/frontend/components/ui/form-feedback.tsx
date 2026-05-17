import { classifyFormFeedback } from "@/lib/form-feedback";
import { cn } from "@/lib/utils";

const kindStyles = {
  rate_limit: "border-warning/35 bg-warning/10 text-foreground",
  unavailable: "border-warning/35 bg-warning/10 text-foreground",
  validation: "border-danger/30 bg-danger/10 text-danger",
  generic: "border-danger/30 bg-danger/10 text-danger",
} as const;

export function FormFeedback({ message, className }: { message: string | null; className?: string }) {
  if (!message?.trim()) return null;

  const fb = classifyFormFeedback(message);

  return (
    <div role="alert" className={cn("rounded-xl border px-3 py-2.5 text-sm", kindStyles[fb.kind], className)}>
      <p className="font-semibold leading-snug">{fb.title}</p>
      <p
        className={cn(
          "mt-1 leading-relaxed",
          fb.kind === "validation" || fb.kind === "generic" ? "opacity-95" : "text-muted-foreground",
        )}
      >
        {fb.description}
      </p>
    </div>
  );
}
