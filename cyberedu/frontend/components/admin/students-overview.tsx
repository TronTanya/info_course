"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Search, Users } from "lucide-react";
import { AdminDualTable } from "@/components/admin/admin-dual-table";
import { AdminResponsiveFilters } from "@/components/admin/admin-responsive-filters";
import { AdminMobileCard } from "@/components/admin/admin-mobile-card";
import { AdminTable, AdminTableBody, AdminTableHead, AdminTh } from "@/components/admin/admin-table";
import type { AdminUserListRow } from "@/lib/admin-users-list";
import {
  mapAdminUsersToStudentsOverview,
  processStudentsOverviewList,
  studentProfileAdminHref,
  STUDENTS_OVERVIEW_FILTER_OPTIONS,
  STUDENTS_OVERVIEW_SORT_OPTIONS,
  studentsOverviewStatusLabel,
  type StudentsOverviewFilterId,
  type StudentsOverviewRow,
  type StudentsOverviewSortId,
  type StudentsOverviewStatus,
} from "@/lib/students-overview-logic";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AdminEmptyState } from "@/components/admin/admin-states";
import { EmptyState } from "@/components/ui/empty-state";
import { Select } from "@/components/ui/select";
import { focusRing } from "@/lib/design-system/primitives";
import { cn } from "@/lib/utils";

function formatLastActive(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("ru-RU", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusBadgeVariant(status: StudentsOverviewStatus): "success" | "warning" | "secondary" {
  if (status === "completed") return "success";
  if (status === "active") return "warning";
  return "secondary";
}

function progressBadgeVariant(pct: number): "secondary" | "warning" | "primary" | "success" {
  if (pct >= 100) return "success";
  if (pct >= 50) return "primary";
  if (pct > 0) return "warning";
  return "secondary";
}

function OverviewCard({ row, showEmail }: { row: StudentsOverviewRow; showEmail: boolean }) {
  return (
    <AdminMobileCard className="space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="wrap-break-word font-medium text-foreground">{row.displayName}</p>
          {showEmail ? (
            <p className="mt-0.5 wrap-break-word text-sm text-muted-foreground">{row.email}</p>
          ) : null}
          <div className="mt-2 flex flex-wrap gap-1.5">
            <Badge variant={progressBadgeVariant(row.progressPercent)} className="tabular-nums">
              {row.progressPercent}%
            </Badge>
            <Badge variant={statusBadgeVariant(row.status)}>{studentsOverviewStatusLabel(row.status)}</Badge>
          </div>
        </div>
        <Button asChild size="sm" variant="secondary" className="min-h-11 shrink-0">
          <Link href={studentProfileAdminHref(row.id)}>Открыть профиль</Link>
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Последняя активность: <span className="tabular-nums text-foreground">{formatLastActive(row.lastActiveAt)}</span>
      </p>
    </AdminMobileCard>
  );
}

function OverviewTableRow({ row, showEmail }: { row: StudentsOverviewRow; showEmail: boolean }) {
  return (
    <tr>
      <td className="font-semibold text-foreground">{row.displayName}</td>
      <td className="max-w-[220px] truncate text-muted-foreground">{showEmail ? row.email : "—"}</td>
      <td>
        <Badge variant={progressBadgeVariant(row.progressPercent)} className="tabular-nums">
          {row.progressPercent}%
        </Badge>
      </td>
      <td className="whitespace-nowrap text-sm tabular-nums text-muted-foreground">
        {formatLastActive(row.lastActiveAt)}
      </td>
      <td>
        <Badge variant={statusBadgeVariant(row.status)}>{studentsOverviewStatusLabel(row.status)}</Badge>
      </td>
      <td>
        <Button asChild size="sm" variant="outline" className="min-h-10">
          <Link href={studentProfileAdminHref(row.id)}>Открыть профиль</Link>
        </Button>
      </td>
    </tr>
  );
}

function PaginationBar({
  page,
  totalPages,
  total,
  pageSize,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}) {
  if (total === 0) return null;
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-col gap-3 border-t border-border/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
      <p className="text-xs text-muted-foreground">
        {from}–{to} из {total}
        {totalPages > 1 ? ` · стр. ${page} из ${totalPages}` : null}
      </p>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="min-h-10"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="Предыдущая страница"
        >
          <ChevronLeft className="size-4" aria-hidden />
          Назад
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="min-h-10"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          aria-label="Следующая страница"
        >
          Вперёд
          <ChevronRight className="size-4" aria-hidden />
        </Button>
      </div>
    </div>
  );
}

export function StudentsOverview({
  rows,
  pageSize = 10,
  showEmail = true,
  embedded = false,
  className,
}: {
  rows: AdminUserListRow[];
  pageSize?: number;
  /** Email виден только в admin UI (как в существующей таблице пользователей). */
  showEmail?: boolean;
  /** Встроенный блок на главной админки. */
  embedded?: boolean;
  className?: string;
}) {
  const students = useMemo(() => mapAdminUsersToStudentsOverview(rows), [rows]);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<StudentsOverviewFilterId>("all");
  const [sort, setSort] = useState<StudentsOverviewSortId>("lastActive");
  const [page, setPage] = useState(1);

  const result = useMemo(
    () =>
      processStudentsOverviewList({
        rows: students,
        search,
        filter,
        sort,
        page,
        pageSize,
      }),
    [students, search, filter, sort, page, pageSize],
  );

  if (students.length === 0) {
    return <AdminEmptyState kind="no_students" className={cn("m-4 sm:m-6", className)} />;
  }

  return (
    <div className={cn("min-w-0", className)}>
      {embedded ? (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Users className="size-5" aria-hidden />
            </span>
            <div>
              <h2 className="font-display text-lg font-semibold wrap-break-word text-foreground">Студенты</h2>
              <p className="text-sm text-muted-foreground">Прогресс, активность и статус — без лишних полей профиля</p>
            </div>
          </div>
          <Button asChild variant="outline" size="sm" className="min-h-11">
            <Link href="/admin/users">Полный список</Link>
          </Button>
        </div>
      ) : null}

      <div className="space-y-4 px-4 py-4 sm:px-5">
        <AdminResponsiveFilters label="Фильтры и сортировка">
          <div
            className="flex flex-wrap gap-2"
            role="tablist"
            aria-label="Фильтр студентов"
          >
            {STUDENTS_OVERVIEW_FILTER_OPTIONS.map((opt) => {
              const active = filter === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => {
                    setFilter(opt.id);
                    setPage(1);
                  }}
                  className={cn(
                    "min-h-11 rounded-xl px-3.5 py-2 text-sm font-semibold transition-colors",
                    active
                      ? "bg-primary text-primary-foreground shadow-sm ring-1 ring-primary/30"
                      : "border border-border/80 bg-card/80 text-foreground hover:border-primary/30 hover:bg-primary/5",
                    focusRing,
                  )}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-end">
            <div className="relative min-w-0 flex-1 sm:max-w-xs">
              <label htmlFor="students-overview-search" className="sr-only">
                Поиск студентов
              </label>
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <input
                id="students-overview-search"
                type="search"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Имя или email…"
                className={cn(
                  "h-11 min-h-11 w-full rounded-xl border border-border/80 bg-background/90 pl-9 pr-3 text-sm",
                  "placeholder:text-muted-foreground",
                  focusRing,
                )}
              />
            </div>
            <Select
              label="Сортировка"
              className="w-full min-w-0 sm:w-48"
              value={sort}
              onChange={(e) => {
                setSort(e.target.value as StudentsOverviewSortId);
                setPage(1);
              }}
            >
              {STUDENTS_OVERVIEW_SORT_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </Select>
          </div>
        </AdminResponsiveFilters>

        <p className="text-xs text-muted-foreground">
          Найдено: {result.filteredTotal} из {students.length}
        </p>
      </div>

      {result.filteredTotal === 0 ? (
        <EmptyState
          compact
          className="mx-4 mb-4 sm:mx-5"
          title="Ничего не найдено"
          description="Измените поиск или фильтр."
          action={
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setSearch("");
                setFilter("all");
              }}
            >
              Сбросить
            </Button>
          }
        />
      ) : (
        <>
          <AdminDualTable
            mobile={
              <div className="space-y-3 px-4 pb-2 sm:px-5">
                {result.items.map((row) => (
                  <OverviewCard key={row.id} row={row} showEmail={showEmail} />
                ))}
              </div>
            }
            desktop={
              <AdminTable minWidth="880px" caption="Студенты — обзор">
                <AdminTableHead>
                  <tr>
                    <AdminTh>Имя</AdminTh>
                    <AdminTh>Email</AdminTh>
                    <AdminTh>Прогресс</AdminTh>
                    <AdminTh>Последняя активность</AdminTh>
                    <AdminTh>Статус</AdminTh>
                    <AdminTh className="w-40">
                      <span className="sr-only">Действия</span>
                    </AdminTh>
                  </tr>
                </AdminTableHead>
                <AdminTableBody>
                  {result.items.map((row) => (
                    <OverviewTableRow key={row.id} row={row} showEmail={showEmail} />
                  ))}
                </AdminTableBody>
              </AdminTable>
            }
          />
          <PaginationBar
            page={result.page}
            totalPages={result.totalPages}
            total={result.filteredTotal}
            pageSize={pageSize}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}
