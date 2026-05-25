import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { cyber } from "@/lib/design-system/cyber";
import { getAdminHeaderQuickActions } from "@/lib/admin-header-actions";
import { cn } from "@/lib/utils";

const SUBTITLE =
  "Управление курсом, студентами, практиками и сертификатами." as const;

export function AdminHeader({
  pendingSubmissions = 0,
  className,
}: {
  /** Опционально: число работ в очереди (без загрузки данных в самом header). */
  pendingSubmissions?: number;
  className?: string;
}) {
  const actions = getAdminHeaderQuickActions();

  return (
    <header
      className={cn(
        "ce-admin-header",
        cyber.hero,
        "rounded-2xl border-primary/15 p-5 sm:p-7",
        className,
      )}
    >
      <div className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-primary/10 blur-3xl" aria-hidden />
      <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 space-y-2">
          <h1 className="typo-h1 wrap-break-word text-balance sm:text-3xl">Админ-панель</h1>
          <p className="max-w-2xl text-sm leading-relaxed text-pretty text-muted-foreground sm:text-base">
            {SUBTITLE}
          </p>
          <p className="text-sm font-medium text-foreground">Роль: Администратор</p>
          {pendingSubmissions > 0 ? (
            <div className="pt-1">
              <Badge variant="warning">{pendingSubmissions} практик на проверке</Badge>
            </div>
          ) : null}
        </div>

        <nav
          className="grid w-full min-w-0 grid-cols-1 gap-2 sm:grid-cols-2 lg:max-w-md lg:grid-cols-1 xl:grid-cols-2"
          aria-label="Быстрые действия админ-панели"
        >
          {actions.map((action) => {
            const Icon = action.icon;
            const itemClass =
              "ce-touch-target flex min-h-11 w-full items-center gap-3 rounded-xl border border-border/80 px-3 py-2.5 text-left text-sm font-semibold transition-colors hover:border-primary/30 hover:bg-primary/5 touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

            const inner = (
              <>
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="size-4" aria-hidden />
                </span>
                <span className="min-w-0 truncate">{action.label}</span>
              </>
            );

            if (action.external) {
              return (
                <a key={action.id} href={action.href} className={itemClass}>
                  {inner}
                </a>
              );
            }

            if (action.href.startsWith("#")) {
              return (
                <a key={action.id} href={action.href} className={itemClass}>
                  {inner}
                </a>
              );
            }

            return (
              <Link key={action.id} href={action.href} className={itemClass}>
                {inner}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
