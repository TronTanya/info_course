import Link from "next/link";
import { ClipboardList } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionCard } from "@/components/ui/section-card";
import type { AdminImportantEvent } from "@/lib/admin-lms-dashboard";
import { cn } from "@/lib/utils";

function formatAt(iso: string): string {
  return new Date(iso).toLocaleString("ru-RU", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function AdminImportantEventsPanel({ events }: { events: AdminImportantEvent[] }) {
  return (
    <SectionCard variant="lab" flushTitle className="min-w-0 p-4 sm:p-6" id="important-events">
      <div className="flex items-center gap-2">
        <ClipboardList className="size-5 text-primary" aria-hidden />
        <h2 className="font-display text-base font-semibold text-foreground">Важные события</h2>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Отправки, регистрации и сигналы безопасности — сводка для быстрого обзора.
      </p>
      {events.length === 0 ? (
        <EmptyState
          className="mt-4 py-8"
          title="Пока нет событий"
          description="Активность появится после работы студентов."
        />
      ) : (
        <ul className="mt-4 space-y-2">
          {events.map((e) => (
            <li key={e.id}>
              <Link
                href={e.href}
                className={cn(
                  "flex flex-col gap-1 rounded-xl border px-3 py-2.5 transition-colors hover:border-primary/25 hover:bg-primary/5 sm:flex-row sm:items-center sm:justify-between",
                  e.tone === "warning" ? "border-warning/30 bg-warning/5" : "border-border/70",
                )}
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">{e.title}</p>
                  <p className="text-xs text-muted-foreground">{e.subtitle}</p>
                </div>
                <time className="shrink-0 text-[10px] tabular-nums text-muted-foreground sm:text-xs">
                  {formatAt(e.at)}
                </time>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}
