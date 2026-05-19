import Link from "next/link";
import { ArrowRight, ClipboardCheck, FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type NextLessonCardProps = {
  title: string;
  description: string;
  href: string;
  ctaLabel: string;
  kind?: "test" | "practice" | "module";
  className?: string;
};

const icons = {
  test: ClipboardCheck,
  practice: FlaskConical,
  module: ArrowRight,
} as const;

export function NextLessonCard({
  title,
  description,
  href,
  ctaLabel,
  kind = "test",
  className,
}: NextLessonCardProps) {
  const Icon = icons[kind];

  return (
    <section
      className={cn(
        "rounded-2xl border border-primary/30 bg-linear-to-br from-primary/10 via-card to-card p-5 shadow-card ring-1 ring-primary/15 sm:p-6",
        className,
      )}
    >
      <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-primary">Следующий шаг</p>
      <div className="mt-3 flex gap-4">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-primary/25 bg-primary/15 text-primary">
          <Icon className="size-5" strokeWidth={1.75} aria-hidden />
        </span>
        <div className="min-w-0 flex-1 space-y-1">
          <h3 className="font-display text-lg font-semibold text-foreground">{title}</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
        </div>
      </div>
      <Button asChild className="mt-4 w-full sm:w-auto" size="lg">
        <Link href={href}>
          {ctaLabel}
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </Button>
    </section>
  );
}
