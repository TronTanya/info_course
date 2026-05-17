import { cn } from "@/lib/utils";

export function AchievementGlyph({ slug, unlocked }: { slug: string; unlocked: boolean }) {
  const tone = unlocked ? "text-primary" : "text-muted-foreground/50";
  switch (slug) {
    case "first-step":
      return (
        <svg className={cn("size-8", tone)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
          <path d="M13 4v16M7 8l6-4 6 4M7 16l6 4 6-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "phishing-detective":
      return (
        <svg className={cn("size-8", tone)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
          <path d="M4 4h16v16H4z" strokeLinejoin="round" />
          <path d="m8 9 8 6M16 9l-8 6" strokeLinecap="round" />
        </svg>
      );
    case "account-defender":
      return (
        <svg className={cn("size-8", tone)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" strokeLinejoin="round" />
          <path d="M9 12h6" strokeLinecap="round" />
        </svg>
      );
    case "log-analyst":
      return (
        <svg className={cn("size-8", tone)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
          <path d="M4 6h16M4 12h10M4 18h14" strokeLinecap="round" />
          <path d="M18 10v8l3-2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "course-complete":
      return (
        <svg className={cn("size-8", tone)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
          <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M8 9h8v10a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2V9Z" strokeLinejoin="round" />
          <path d="M9 2v3M15 2v3" strokeLinecap="round" />
        </svg>
      );
    default:
      return (
        <svg className={cn("size-8", tone)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
          <circle cx="12" cy="12" r="9" />
        </svg>
      );
  }
}
