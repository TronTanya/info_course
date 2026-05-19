"use client";

import { LayoutList, Rows3, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type AdminTableDensity = "comfortable" | "compact";

type FilterChip = { id: string; label: string };

export function AdminTableToolbar({
  search,
  onSearchChange,
  searchPlaceholder = "Поиск…",
  filters,
  activeFilter,
  onFilterChange,
  density,
  onDensityChange,
  resultCount,
  totalCount,
  className,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filters?: FilterChip[];
  activeFilter?: string;
  onFilterChange?: (id: string) => void;
  density?: AdminTableDensity;
  onDensityChange?: (density: AdminTableDensity) => void;
  resultCount: number;
  totalCount: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 border-b border-border/60 bg-muted/20 px-4 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:px-5",
        className,
      )}
    >
      <div className="relative min-w-0 flex-1 sm:max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="h-10 w-full rounded-xl border border-border/80 bg-background/90 pl-9 pr-9 text-sm text-foreground shadow-sm outline-none transition-[border-color,box-shadow] placeholder:text-muted-foreground focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-ring/30"
          aria-label={searchPlaceholder}
        />
        {search ? (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Очистить поиск"
          >
            <X className="size-4" />
          </button>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {filters?.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => onFilterChange?.(f.id)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
              activeFilter === f.id
                ? "border-primary/40 bg-primary/12 text-primary"
                : "border-border/70 bg-card/80 text-muted-foreground hover:border-border hover:text-foreground",
            )}
          >
            {f.label}
          </button>
        ))}

        {onDensityChange && density ? (
          <div className="flex rounded-xl border border-border/70 bg-card/80 p-0.5" role="group" aria-label="Плотность таблицы">
            <button
              type="button"
              onClick={() => onDensityChange("comfortable")}
              className={cn(
                "rounded-lg p-2 transition-colors",
                density === "comfortable" ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground",
              )}
              aria-pressed={density === "comfortable"}
              aria-label="Обычная плотность таблицы"
              title="Обычная плотность"
            >
              <LayoutList className="size-4" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => onDensityChange("compact")}
              className={cn(
                "rounded-lg p-2 transition-colors",
                density === "compact" ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground",
              )}
              aria-pressed={density === "compact"}
              aria-label="Компактная плотность таблицы"
              title="Компактная плотность"
            >
              <Rows3 className="size-4" aria-hidden />
            </button>
          </div>
        ) : null}

        <p className="w-full text-xs text-muted-foreground sm:w-auto sm:text-right">
          Показано <span className="font-semibold tabular-nums text-foreground">{resultCount}</span>
          {totalCount !== resultCount ? (
            <>
              {" "}
              из <span className="font-semibold tabular-nums text-foreground">{totalCount}</span>
            </>
          ) : null}
        </p>
      </div>
    </div>
  );
}
