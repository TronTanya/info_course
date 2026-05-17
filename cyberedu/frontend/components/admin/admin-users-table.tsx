"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AdminDualTable } from "@/components/admin/admin-dual-table";
import { AdminTable, AdminTableBody, AdminTableHead } from "@/components/admin/admin-table";
import { AdminTableToolbar, type AdminTableDensity } from "@/components/admin/admin-table-toolbar";
import type { AdminUserListRow } from "@/lib/admin-users-list";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
const ROLE_FILTERS = [
  { id: "all", label: "Все" },
  { id: "USER", label: "Студенты" },
  { id: "ADMIN", label: "Админы" },
] as const;

function MobileField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-border/50 bg-card/60 px-3 py-2">
      <span className="typo-label text-[0.65rem]">{label}</span>
      <span className="wrap-break-word text-sm font-medium text-foreground">{value}</span>
    </div>
  );
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

export function AdminUsersTable({ rows }: { rows: AdminUserListRow[] }) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [density, setDensity] = useState<AdminTableDensity>("comfortable");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (roleFilter !== "all" && r.role !== roleFilter) return false;
      return matchesSearch(r, q);
    });
  }, [rows, search, roleFilter]);

  if (rows.length === 0) {
    return (
      <EmptyState
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

      {filtered.length === 0 ? (
        <EmptyState
          title="Ничего не найдено"
          description="Измените поиск или фильтр роли."
          className="m-4 border-0 bg-transparent shadow-none sm:m-6"
          action={
            <Button type="button" variant="outline" size="sm" onClick={() => { setSearch(""); setRoleFilter("all"); }}>
              Сбросить фильтры
            </Button>
          }
        />
      ) : (
        <AdminDualTable
          mobile={
            <div className="space-y-4 p-4 sm:p-5">
              {filtered.map((r) => (
                <div
                  key={r.id}
                  className="ce-admin-mobile-card space-y-4 rounded-2xl border border-border/60 bg-card/80 p-4 shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium text-foreground">{r.fullName}</p>
                      {r.role === "ADMIN" ? (
                        <Badge variant="outline" className="mt-1 text-[10px]">
                          ADMIN
                        </Badge>
                      ) : null}
                    </div>
                    <Button asChild variant="outline" size="sm" className="shrink-0">
                      <Link href={`/admin/users/${r.id}`}>Подробнее</Link>
                    </Button>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <MobileField label="Email" value={r.email} />
                    <MobileField label="Учебное заведение" value={r.educationalInstitution || "—"} />
                    <MobileField label="Группа" value={r.studyGroup} />
                    <MobileField label="Курс" value={r.studyCourseYear} />
                    <MobileField label="Специальность" value={r.specialty || "—"} />
                    <MobileField label="Регистрация" value={new Date(r.createdAt).toLocaleDateString("ru-RU")} />
                    <MobileField label="Прогресс" value={r.role === "USER" ? `${r.overallProgressPercent}%` : "—"} />
                    <MobileField label="Баллы" value={r.role === "USER" ? String(r.totalScore) : "—"} />
                    <MobileField label="Отчёт курса" value={String(r.courseProgressRowCount)} />
                    <MobileField label="Сертификат" value={r.hasCertificate ? "Выдан" : "Нет"} />
                  </div>
                </div>
              ))}
            </div>
          }
          desktop={
            <AdminTable minWidth="1280px" density={density}>
              <AdminTableHead>
                <tr>
                  <th>ФИО</th>
                  <th>Email</th>
                  <th>Учебное заведение</th>
                  <th>Группа</th>
                  <th>Курс</th>
                  <th>Специальность</th>
                  <th>Регистрация</th>
                  <th>Прогресс</th>
                  <th>Баллы</th>
                  <th className="whitespace-normal">Отчёт курса</th>
                  <th>Сертификат</th>
                  <th className="w-28" />
                </tr>
              </AdminTableHead>
              <AdminTableBody>
                {filtered.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <div className="font-semibold text-foreground">{r.fullName}</div>
                      {r.role === "ADMIN" ? (
                        <Badge variant="outline" className="mt-1 text-[10px]">
                          ADMIN
                        </Badge>
                      ) : null}
                    </td>
                    <td className="text-muted-foreground">{r.email}</td>
                    <td className="max-w-[200px] text-muted-foreground">{r.educationalInstitution}</td>
                    <td className="max-w-[100px] tabular-nums text-muted-foreground">{r.studyGroup}</td>
                    <td className="w-16 tabular-nums text-muted-foreground">{r.studyCourseYear}</td>
                    <td className="max-w-[160px] text-muted-foreground">{r.specialty}</td>
                    <td className="tabular-nums text-muted-foreground">
                      {new Date(r.createdAt).toLocaleDateString("ru-RU")}
                    </td>
                    <td className="tabular-nums font-medium text-foreground">
                      {r.role === "USER" ? `${r.overallProgressPercent}%` : "—"}
                    </td>
                    <td className="tabular-nums font-medium text-foreground">{r.role === "USER" ? r.totalScore : "—"}</td>
                    <td className="tabular-nums text-muted-foreground">{r.courseProgressRowCount}</td>
                    <td>
                      {r.hasCertificate ? (
                        <span className="font-medium text-success">Выдан</span>
                      ) : (
                        <span className="text-muted-foreground">Нет</span>
                      )}
                    </td>
                    <td>
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/admin/users/${r.id}`}>Подробнее</Link>
                      </Button>
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
