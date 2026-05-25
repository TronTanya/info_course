import type { AdminDayActivity } from "@/lib/admin-security-dashboard";
import { cn } from "@/lib/utils";

const CHART_HEIGHT_PX = 120;

const SEGMENTS = [
  { key: "registrations" as const, label: "Регистрации", className: "bg-cyan/85" },
  { key: "tests" as const, label: "Тесты", className: "bg-primary/85" },
  { key: "practice" as const, label: "Практика", className: "bg-accent/90" },
];

export function AdminActivityByDayChart({ days }: { days: AdminDayActivity[] }) {
  const maxActivity = Math.max(1, ...days.map((d) => d.count));
  const totalEvents = days.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="space-y-3">
      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground" aria-hidden>
        {SEGMENTS.map((s) => (
          <li key={s.key} className="flex items-center gap-1.5">
            <span className={cn("size-2.5 rounded-sm", s.className)} />
            {s.label}
          </li>
        ))}
      </ul>

      {totalEvents === 0 ? (
        <p className="rounded-xl border border-dashed border-border/70 bg-muted/20 px-4 py-10 text-center text-sm text-muted-foreground">
          За последние 14 дней событий пока нет
        </p>
      ) : (
        <div
          className="flex items-end gap-1 sm:gap-1.5"
          role="img"
          aria-label={`Активность за 14 дней: всего ${totalEvents} событий`}
        >
          {days.map((d) => {
            const barHeightPx =
              d.count === 0 ? 2 : Math.max(8, Math.round((d.count / maxActivity) * CHART_HEIGHT_PX));

            return (
              <div key={d.date} className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
                {d.count > 0 ? (
                  <span className="font-mono text-[10px] tabular-nums leading-none text-muted-foreground">
                    {d.count}
                  </span>
                ) : (
                  <span className="h-[14px]" aria-hidden />
                )}
                <div
                  className="flex w-full flex-col-reverse overflow-hidden rounded-t-md border border-border/40 bg-muted/20"
                  style={{ height: barHeightPx }}
                  title={`${d.label}: ${d.count} — рег. ${d.registrations}, тесты ${d.tests}, практика ${d.practice}`}
                >
                  {d.count === 0 ? (
                    <div className="h-full w-full bg-muted/50" />
                  ) : (
                    SEGMENTS.map((s) => {
                      const value = d[s.key];
                      if (value <= 0) return null;
                      const segmentPx = Math.max(2, Math.round((value / d.count) * barHeightPx));
                      return (
                        <div
                          key={s.key}
                          className={cn("w-full shrink-0", s.className)}
                          style={{ height: segmentPx }}
                          title={`${s.label}: ${value}`}
                        />
                      );
                    })
                  )}
                </div>
                <span className="max-w-full truncate text-center text-[9px] leading-tight text-muted-foreground">
                  {d.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
