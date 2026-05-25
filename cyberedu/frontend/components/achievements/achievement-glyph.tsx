import { ACHIEVEMENT_MEME_BY_SLUG } from "@/lib/achievement-memes";
import { cn } from "@/lib/utils";

const iconSizes = {
  xs: "size-10",
  sm: "size-11",
  md: "size-14",
  lg: "size-16",
} as const;

export function AchievementGlyph({
  slug,
  unlocked,
  size = "md",
  variant = "icon",
  className,
}: {
  slug: string;
  unlocked: boolean;
  size?: keyof typeof iconSizes;
  /** Крупный мем на карточке достижения в профиле */
  variant?: "icon" | "card";
  className?: string;
}) {
  const meme = ACHIEVEMENT_MEME_BY_SLUG[slug];
  if (meme) {
    if (variant === "card") {
      return (
        <div
          className={cn(
            "relative mx-auto aspect-square w-full max-w-30 overflow-hidden rounded-2xl shadow-sm ring-2 transition",
            unlocked ? "ring-primary/40" : "ring-border/70 opacity-75 saturate-[0.35]",
            className,
          )}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={meme.src} alt={meme.alt} className="size-full object-cover object-center" loading="lazy" />
        </div>
      );
    }

    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={meme.src}
        alt={meme.alt}
        width={64}
        height={64}
        loading="lazy"
        className={cn(
          iconSizes[size],
          "ce-achievement-glyph-img shrink-0 rounded-xl object-cover object-center transition",
          unlocked ? "saturate-100" : "opacity-60 saturate-[0.25]",
          className,
        )}
      />
    );
  }

  const tone = unlocked ? "text-primary" : "text-muted-foreground/50";
  return (
    <svg
      className={cn(iconSizes[size], tone, className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden
    >
      <circle cx="12" cy="12" r="9" />
    </svg>
  );
}
