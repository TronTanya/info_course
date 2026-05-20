"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AdminDualTable } from "@/components/admin/admin-dual-table";
import { AdminMobileCard } from "@/components/admin/admin-mobile-card";
import { AdminRowMenu } from "@/components/admin/admin-row-menu";
import { AdminTable, AdminTableBody, AdminTableHead } from "@/components/admin/admin-table";
import { AdminTableToolbar, type AdminTableDensity } from "@/components/admin/admin-table-toolbar";
import type { AdminUserListRow } from "@/lib/admin-users-list";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UiStatePanel } from "@/components/ui/ui-state-panel";
import { cn } from "@/lib/utils";

const ROLE_FILTERS = [
  { id: "all", label: "Все" },
  { id: "USER", label: "Студенты" },
  { id: "ADMIN", label: "Админы" },
] as const;

const PROGRESS_FILTERS = [
  { id: "all", label: "Прогресс" },
  { id: "low", label: "0–25%" },
  { id: "mid", label: "26–75%" },
  { id: "high", label: "76–99%" },
  { id: "done", label: "100%" },
] as const;

function progressBucket(pct: number): string {
  if (pct >= 100) return "done";
  if (pct >= 76) return "high";
  if (pct >= 26) return "mid";
  if (pct > 0) return "low";
  return "low";
}

function progressBadgeVariant(pct: number): "secondary" | "warning" | "primary" | "success" {
  if (pct >= 100) return "success";
  if (pct >= 50) return "primary";
  if (pct > 0) return "warning";
  return "secondary";
}

function MobileField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-border/50 bg-card/60 px-3 py-2">
      <span className="typo-label text-[0.65rem]">{label}</span>
      <span className="wrap-break-word text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}

function UserRowMenu({ userId }: { userId: string }) {
  return (
    <AdminRowMenu
      items={[
        { label: "Просмотр", href: `/admin/users/${userId}` },
        { label: "Изменить роль", href: `/admin/users/${userId}` },
        { label: "Заблокировать", disabled: true },
        { label: "Удалить", disabled: true, variant: "danger" },
      ]}
    />
  );
}

function formatLastActivity(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("ru-RU", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function matchesSearch(row: AdminUserListRow, q: string): boolean {
  if (!q) return true;
  const hay = [
    row.fullName,
    row.email,
    row.educationalInstitution,
    row.studyGroup,
    row.specialty,
    row.studyCourseYear,
  ]
    .join(" ")
    .toLowerCase();
  return hay.includes(q);
}

export function AdminUsersTable({
  rows,
  embedded = false,
  dashboardView = false,
}: {
  rows: AdminUserListRow[];
  embedded?: boolean;
  /** Упрощённые колонки для главной LMS-панели. */
  dashboardView?: boolean;
}) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [progressFilter, setProgressFilter] = useState<string>("all");
  const [density, setDensity] = useState<AdminTableDensity>("comfortable");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (roleFilter !== "all" && r.role !== roleFilter) return false;
      if (progressFilter !== "all" && r.role === "USER") {
        if (progressBucket(r.overallProgressPercent) !== progressFilter) return false;
      }
      return matchesSearch(r, q);
    });
  }, [rows, search, roleFilter, progressFilter]);

  const displayRows = embedded ? filtered.slice(0, 12) : filtered;

  if (rows.length === 0) {
    return (
      <UiStatePanel
        state="empty"
        title="Пользователей пока нет"
        description="Когда появятся учётные записи, они отобразятся в этой таблице."
        className="m-4 sm:m-6"
      />
    );
  }

  return (
    <div>
      <AdminTableToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="ФИО, email, группа, вуз…"
        filters={[...ROLE_FILTERS]}
        activeFilter={roleFilter}
        onFilterChange={setRoleFilter}
        density={density}
        onDensityChange={setDensity}
        resultCount={filtered.length}
        totalCount={rows.length}
      />

      <div className="flex flex-wrap gap-2 border-b border-border/50 bg-muted/10 px-4 py-2 sm:px-5">
        <span className="text-xs font-medium text-muted-foreground">Прогресс:</span>
        {PROGRESS_FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setProgressFilter(f.id)}
            className={cn(
              "rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-colors",
              progressFilter === f.id
                ? "border-primary/40 bg-primary/12 text-primary"
                : "border-border/70 bg-card/80 text-muted-foreground hover:text-foreground",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {embedded && filtered.length > 12 ? (
        <p className="border-b border-border/50 px-4 py-2 text-xs text-muted-foreground sm:px-5">
          Показаны первые 12 из {filtered.length}.{" "}
          <Link href="/admin/users" className="font-medium text-primary hover:underline">
            Открыть полный список
          </Link>
        </p>
      ) : null}

      {filtered.length === 0 ? (
        <UiStatePanel
          state="empty"
          title="Ничего не найдено"
          description="Измените поиск или фильтр роли."
          className="m-4 border-0 bg-transparent shadow-none sm:m-6"
          action={
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setSearch("");
                setRoleFilter("all");
                setProgressFilter("all");
              }}
            >
              Сбросить фильтры
            </Button>
          }
        />
      ) : (
        <AdminDualTable
          mobile={
            <div className="space-y-4 p-4 sm:p-5">
              {displayRows.map((r) => (
                <AdminMobileCard key={r.id} className="space-y-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium text-foreground">{r.fullName}</p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {r.role === "ADMIN" ? (
                          <Badge variant="outline" className="text-[10px]">
                            ADMIN
                          </Badge>
                        ) : (
                          <Badge variant={progressBadgeVariant(r.overallProgressPercent)} className="text-[10px] tabular-nums">
                            {r.overallProgressPercent}%
                          </Badge>
                        )}
                      </div>
                    </div>
                    <UserRowMenu userId={r.id} />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <MobileField label="Email" value={r.email} />
                    <MobileField label="Роль" value={r.role === "ADMIN" ? "Админ" : "Студент"} />
                    <MobileField label="Прогресс" value={r.role === "USER" ? `${r.overallProgressPercent}%` : "—"} />
                    {dashboardView ? (
                      <>
                        <MobileField
                          label="Тесты"
                          value={r.role === "USER" ? `${r.testsPassedCount}/${r.testAttemptCount}` : "—"}
                        />
                        <MobileField
                          label="Практика"
                          value={r.role === "USER" ? String(r.practicesCompletedCount) : "—"}
                        />
                        <MobileField label="Активность" value={formatLastActivity(r.lastActivityAt)} />
                      </>
                    ) : (
                      <>
                        <MobileField label="Учебное заведение" value={r.educationalInstitution || "—"} />
                        <MobileField label="Группа" value={r.studyGroup} />
                        <MobileField label="Курс" value={r.studyCourseYear} />
                        <MobileField label="Специальность" value={r.specialty || "—"} />
                        <MobileField label="Регистрация" value={new Date(r.createdAt).toLocaleDateString("ru-RU")} />
                        <MobileField label="Баллы" value={r.role === "USER" ? String(r.totalScore) : "—"} />
                        <MobileField label="Отчёт курса" value={String(r.courseProgressRowCount)} />
                      </>
                    )}
                    <MobileField label="Сертификат" value={r.hasCertificate ? "Выдан" : "Нет"} />
                  </div>
                </AdminMobileCard>
              ))}
            </div>
          }
          desktop={
            <AdminTable
              minWidth={dashboardView ? "960px" : "1280px"}
              density={density}
              caption={dashboardView ? "Студенты — краткий список" : "Пользователи платформы"}
            >
              <AdminTableHead>
                <tr>
                  <th>ФИО</th>
                  <th>Email</th>
                  <th>Роль</th>
                  {!dashboardView ? (
                    <>
                      <th>Учебное заведение</th>
                      <th>Группа</th>
                      <th>Курс</th>
                      <th>Специальность</th>
                      <th>Регистрация</th>
                    </>
                  ) : null}
                  <th>Прогресс</th>
                  {dashboardView ? (
                    <>
                      <th>Тесты</th>
                      <th>Практика</th>
                      <th>Активность</th>
                    </>
                  ) : (
                    <>
                      <th>Баллы</th>
                      <th className="whitespace-normal">Отчёт курса</th>
                    </>
                  )}
                  <th>Сертификат</th>
                  <th className="w-28" />
                </tr>
              </AdminTableHead>
              <AdminTableBody>
                {displayRows.map((r) => (
                  <tr key={r.id}>
                    <td className="font-semibold text-foreground">{r.fullName}</td>
                    <td className="text-muted-foreground">{r.email}</td>
                    <td>
                      <Badge variant={r.role === "ADMIN" ? "outline" : "secondary"} className="text-[10px]">
                        {r.role === "ADMIN" ? "Админ" : "Студент"}
                      </Badge>
                    </td>
                    {!dashboardView ? (
                      <>
                        <td className="max-w-[200px] text-muted-foreground">{r.educationalInstitution}</td>
                        <td className="max-w-[100px] tabular-nums text-muted-foreground">{r.studyGroup}</td>
                        <td className="w-16 tabular-nums text-muted-foreground">{r.studyCourseYear}</td>
                        <td className="max-w-[160px] text-muted-foreground">{r.specialty}</td>
                        <td className="tabular-nums text-muted-foreground">
                          {new Date(r.createdAt).toLocaleDateString("ru-RU")}
                        </td>
                      </>
                    ) : null}
                    <td>
                      {r.role === "USER" ? (
                        <Badge variant={progressBadgeVariant(r.overallProgressPercent)} className="tabular-nums">
                          {r.overallProgressPercent}%
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    {dashboardView ? (
                      <>
                        <td className="tabular-nums text-sm text-muted-foreground">
                          {r.role === "USER" ? `${r.testsPassedCount}/${r.testAttemptCount}` : "—"}
                        </td>
                        <td className="tabular-nums text-sm text-muted-foreground">
                          {r.role === "USER" ? r.practicesCompletedCount : "—"}
                        </td>
                        <td className="whitespace-nowrap text-xs tabular-nums text-muted-foreground">
                          {formatLastActivity(r.lastActivityAt)}
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="tabular-nums font-medium text-foreground">{r.role === "USER" ? r.totalScore : "—"}</td>
                        <td className="tabular-nums text-muted-foreground">{r.courseProgressRowCount}</td>
                      </>
                    )}
                    <td>
                      {r.hasCertificate ? (
                        <span className="font-medium text-success">Выдан</span>
                      ) : (
                        <span className="text-muted-foreground">Нет</span>
                      )}
                    </td>
                    <td>
                      <UserRowMenu userId={r.id} />
                    </td>
                  </tr>
                ))}
              </AdminTableBody>
            </AdminTable>
          }
        />
      )}
    </div>
  );
}
