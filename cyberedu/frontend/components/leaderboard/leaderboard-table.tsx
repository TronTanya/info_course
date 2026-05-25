import Link from "next/link";
import { Medal, Trophy } from "lucide-react";
import type { LeaderboardRow } from "@/lib/leaderboard";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

function rankDecoration(rank: number) {
  if (rank === 1) return { icon: Medal, className: "text-warning" };
  if (rank === 2) return { icon: Medal, className: "text-muted-foreground" };
  if (rank === 3) return { icon: Medal, className: "text-amber-700 dark:text-amber-500" };
  return null;
}

function RankCell({ rank }: { rank: number }) {
  const deco = rankDecoration(rank);
  if (deco) {
    const Icon = deco.icon;
    return (
      <span className={cn("inline-flex items-center gap-1.5 font-display text-lg font-bold tabular-nums", deco.className)}>
        <Icon className="size-5 shrink-0" aria-hidden />
        {rank}
      </span>
    );
  }
  return <span className="font-mono text-sm font-semibold tabular-nums text-muted-foreground">{rank}</span>;
}

function StudentAvatar({ row }: { row: LeaderboardRow }) {
  return (
    <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-linear-to-br from-primary/10 to-accent/10 text-sm font-bold text-primary ring-1 ring-border/60">
      {row.avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={row.avatarUrl} alt="" className="size-full object-cover" referrerPolicy="no-referrer" />
      ) : (
        row.initials
      )}
    </div>
  );
}

export function LeaderboardTable({ rows, currentUserId }: { rows: LeaderboardRow[]; currentUserId: string }) {
  if (rows.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border/70 bg-muted/20 px-4 py-8 text-center text-sm text-muted-foreground">
        Пока нет студентов в рейтинге — зарегистрируйтесь и заполните профиль.
      </p>
    );
  }

  return (
    <div className="min-w-0 overflow-x-auto rounded-2xl border border-border/70 bg-card/40 ring-1 ring-border/50">
      <table className="w-full min-w-[640px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-border/70 bg-muted/30 font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            <th className="px-4 py-3 w-14" scope="col">
              #
            </th>
            <th className="px-4 py-3" scope="col">
              Студент
            </th>
            <th className="hidden px-4 py-3 sm:table-cell" scope="col">
              Вуз
            </th>
            <th className="px-4 py-3" scope="col">
              Прогресс
            </th>
            <th className="px-4 py-3" scope="col">
              Модуль
            </th>
            <th className="px-4 py-3 text-right" scope="col">
              Баллы
            </th>
            <th className="px-4 py-3 text-right" scope="col">
              <span className="inline-flex items-center gap-1">
                <Trophy className="size-3.5" aria-hidden />
                Трофеи
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const isYou = row.userId === currentUserId;
            const href = `/dashboard/students/${row.userId}`;
            return (
              <tr
                key={row.userId}
                className={cn(
                  "border-b border-border/50 transition-colors last:border-b-0 hover:bg-primary/[0.04]",
                  isYou && "bg-primary/[0.06] ring-1 ring-inset ring-primary/20",
                )}
              >
                <td className="px-4 py-3 align-middle">
                  <RankCell rank={row.rank} />
                </td>
                <td className="px-4 py-3 align-middle">
                  <Link
                    href={href}
                    className="group flex min-w-0 items-center gap-3 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <StudentAvatar row={row} />
                    <span className="min-w-0">
                      <span className="block font-medium text-foreground group-hover:text-primary">
                        {row.fullName}
                        {isYou ? (
                          <Badge variant="primary" className="ml-2 align-middle text-[10px]">
                            Вы
                          </Badge>
                        ) : null}
                      </span>
                      <span className="mt-0.5 block text-xs text-muted-foreground sm:hidden">
                        {row.educationalInstitution ?? "—"}
                      </span>
                    </span>
                  </Link>
                </td>
                <td className="hidden max-w-[180px] truncate px-4 py-3 align-middle text-muted-foreground sm:table-cell">
                  {row.educationalInstitution ?? "—"}
                </td>
                <td className="px-4 py-3 align-middle tabular-nums">
                  <span className="font-semibold text-foreground">{row.progressPercent}%</span>
                  <span className="ml-1 text-xs text-muted-foreground">
                    ({row.completedModules}/{row.totalModules})
                  </span>
                </td>
                <td className="max-w-[200px] truncate px-4 py-3 align-middle text-muted-foreground">
                  {row.currentModuleTitle ?? "—"}
                </td>
                <td className="px-4 py-3 align-middle text-right font-mono tabular-nums">{row.totalScore}</td>
                <td className="px-4 py-3 align-middle text-right tabular-nums">
                  <Link href={href} className="font-medium text-primary hover:underline">
                    {row.achievementsUnlocked}
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
