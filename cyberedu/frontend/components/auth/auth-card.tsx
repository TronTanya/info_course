import { GlassCard } from "@/components/ui/glass-card";

export function AuthCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <GlassCard glow className="w-full max-w-lg min-w-0">
      <div className="border-b border-border/60 p-6 pb-4">
        <h1 className="font-display text-xl font-semibold tracking-tight text-card-foreground">{title}</h1>
        {description ? <p className="mt-1.5 text-sm text-muted-foreground">{description}</p> : null}
      </div>
      <div className="space-y-4 p-6 pt-4">{children}</div>
    </GlassCard>
  );
}
