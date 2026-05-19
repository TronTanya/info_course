import type { ReactNode } from "react";
import { cyber } from "@/lib/design-system/cyber";
import { cn } from "@/lib/utils";

type CyberHeroProps = {
  children: ReactNode;
  className?: string;
  /** id для aria-labelledby на секции */
  id?: string;
  /** aria-labelledby */
  labelledBy?: string;
  as?: "section" | "div" | "header";
  padding?: "compact" | "default" | "spacious";
};

const paddingMap = {
  compact: "p-5 sm:p-6",
  default: "p-6 sm:p-8 lg:p-10",
  spacious: "p-6 sm:p-10 lg:p-12",
} as const;

export function CyberHero({
  children,
  className,
  id,
  labelledBy,
  as: Tag = "section",
  padding = "default",
}: CyberHeroProps) {
  return (
    <Tag
      id={id}
      className={cn(cyber.hero, paddingMap[padding], className)}
      {...(labelledBy ? { "aria-labelledby": labelledBy } : {})}
    >
      <div className={cyber.heroGrid} aria-hidden />
      <div className={cyber.heroGlow} aria-hidden />
      <div className="relative z-[1]">{children}</div>
    </Tag>
  );
}
