import type { AchievementRow } from "@/lib/achievements";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

function IconLock({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function IconCheck({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function AchievementGlyph({ slug, unlocked }: { slug: string; unlocked: boolean }) {
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

function formatUnlockedAt(iso: string): string {
  return new Date(iso).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
}

export function ProfileAchievements({ rows }: { rows: AchievementRow[] }) {
  const unlockedCount = rows.filter((r) => r.unlocked).length;

  return (
    <section className="space-y-4" aria-labelledby="achievements-heading">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-cyan">Мотивация</p>
          <h3 id="achievements-heading" className="mt-1 text-lg font-semibold text-foreground">
            Достижения
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Открывайте бейджи по мере прохождения — {unlockedCount} из {rows.length} уже у вас.
          </p>
        </div>
        <Badge variant="primary" className="tabular-nums">
          {unlockedCount}/{rows.length}
        </Badge>
      </div>

      <div className="responsive-card-grid">
        {rows.map((a) => (
          <Card
            key={a.kind}
            className={cn(
              "relative flex flex-col overflow-hidden border transition-all duration-300",
              a.unlocked
                ? "border-primary/30 bg-linear-to-b from-primary/[0.08] to-card shadow-[var(--shadow-card-hover)] ring-1 ring-primary/10"
                : "border-border/70 bg-muted/15 opacity-95 ring-1 ring-inset ring-border/40",
            )}
          >
            {a.unlocked ? (
              <div className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
                <IconCheck className="size-3.5" />
              </div>
            ) : (
              <div className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full border border-border bg-muted/80 text-muted-foreground">
                <IconLock className="size-3.5" />
              </div>
            )}
            <CardContent className="flex flex-1 flex-col gap-3 p-4 pt-5">
              <AchievementGlyph slug={a.slug} unlocked={a.unlocked} />
              <div>
                <p className="font-semibold leading-snug text-foreground">{a.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{a.unlocked ? a.description : a.hintLocked}</p>
              </div>
              {a.unlocked && a.unlockedAt ? (
                <p className="mt-auto text-[10px] font-medium uppercase tracking-wide text-primary/90">
                  {formatUnlockedAt(a.unlockedAt)}
                </p>
              ) : (
                <p className="mt-auto text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Закрыто</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
