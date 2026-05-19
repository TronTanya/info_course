"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Lock, Trophy } from "lucide-react";
import { AchievementGlyph } from "@/components/achievements/achievement-glyph";
import type { AchievementRow } from "@/lib/achievements";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CircularProgress } from "@/components/ui/circular-progress";
import { cn } from "@/lib/utils";

function formatUnlockedAt(iso: string): string {
  return new Date(iso).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
}

export function ProfileAchievementsPanel({ rows }: { rows: AchievementRow[] }) {
  const reduce = useReducedMotion();
  const unlockedCount = rows.filter((r) => r.unlocked).length;
  const percent = rows.length > 0 ? Math.round((unlockedCount / rows.length) * 100) : 0;
  const nextLocked = rows.find((r) => !r.unlocked);

  return (
    <section className="space-y-5 p-4 sm:p-6" aria-labelledby="achievements-heading">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <motion.div
          className="min-w-0 flex-1"
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-cyan">Мотивация</p>
          <h3 id="achievements-heading" className="mt-1 text-lg font-semibold text-foreground">
            Достижения
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Открывайте бейджи по мере прохождения — {unlockedCount} из {rows.length} уже у вас.
          </p>
          {nextLocked ? (
            <p className="mt-2 text-xs text-muted-foreground">
              Следующая цель: <span className="font-medium text-foreground">{nextLocked.title}</span> — {nextLocked.hintLocked}
            </p>
          ) : null}
        </motion.div>
        <div className="flex items-center gap-3">
          <CircularProgress value={percent} size={72} strokeWidth={6} tone={percent >= 100 ? "success" : "cyan"} label="Доля открытых достижений" />
          <Badge variant="primary" className="tabular-nums">
            {unlockedCount}/{rows.length}
          </Badge>
        </div>
      </div>

      <div className="responsive-card-grid">
        {rows.map((a, index) => (
          <motion.div
            key={a.kind}
            initial={reduce ? false : { opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: index * 0.06, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            whileHover={reduce ? undefined : { y: -3 }}
          >
            <article
              className={cn(
                "ce-achievement-card relative flex h-full flex-col overflow-hidden rounded-2xl border p-4 pt-5 transition-shadow duration-300",
                a.unlocked
                  ? "border-primary/35 bg-linear-to-b from-primary/[0.1] to-card shadow-(--shadow-card-hover) ring-1 ring-primary/15"
                  : "border-border/70 bg-muted/15 opacity-95 ring-1 ring-inset ring-border/40",
              )}
            >
              {a.unlocked ? (
                <div className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
                  <Trophy className="size-3.5" aria-hidden />
                </div>
              ) : (
                <div className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full border border-border bg-muted/80 text-muted-foreground">
                  <Lock className="size-3.5" aria-hidden />
                </div>
              )}
              <div className="flex flex-1 flex-col gap-3">
                <AchievementGlyph slug={a.slug} unlocked={a.unlocked} />
                <div>
                  <p className="font-semibold leading-snug text-foreground">{a.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {a.unlocked ? a.description : a.hintLocked}
                  </p>
                </div>
                {a.unlocked && a.unlockedAt ? (
                  <p className="mt-auto text-[10px] font-medium uppercase tracking-wide text-primary/90">
                    {formatUnlockedAt(a.unlockedAt)}
                  </p>
                ) : (
                  <p className="mt-auto text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Закрыто</p>
                )}
              </div>
            </article>
          </motion.div>
        ))}
      </div>

      <div className="flex justify-end">
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/course">К карте курса</Link>
        </Button>
      </div>
    </section>
  );
}
