"use client";

import type { AdminUserListRow } from "@/lib/admin-users-list";
import { AdminRowMenu } from "@/components/admin/admin-row-menu";
import { AdminTable, AdminTableBody, AdminTableHead } from "@/components/admin/admin-table";
import type { AdminTableDensity } from "@/components/admin/admin-table-toolbar";

function formatLastActivity(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("ru-RU", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
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

export function AdminUsersDesktopTable({
  rows,
  dashboardView = false,
  density = "comfortable",
}: {
  rows: AdminUserListRow[];
  dashboardView?: boolean;
  density?: AdminTableDensity;
}) {
  return (
    <AdminTable
      className="ce-admin-users-table"
      minWidth={dashboardView ? "48rem" : "64rem"}
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
              <th>Уч. заведение</th>
              <th>Группа</th>
              <th>Курс</th>
              <th>Спец.</th>
              <th>Рег.</th>
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
              <th>Отчёт</th>
            </>
          )}
          <th>Серт.</th>
          <th className="text-right" aria-label="Действия" />
        </tr>
      </AdminTableHead>
      <AdminTableBody>
        {rows.map((r) => (
          <tr key={r.id}>
            <td className="min-w-36 ce-admin-users-table__name">
              <span className="block text-foreground">{r.fullName}</span>
            </td>
            <td className="min-w-40 max-w-56 break-all">
              <span className="block text-muted-foreground">{r.email}</span>
            </td>
            <td>
              <span style={{ color: "var(--foreground)", opacity: 1 }}>
                {r.role === "ADMIN" ? "Админ" : "Студент"}
              </span>
            </td>
            {!dashboardView ? (
              <>
                <td className="text-muted-foreground">{r.educationalInstitution}</td>
                <td className="tabular-nums text-muted-foreground">{r.studyGroup}</td>
                <td className="tabular-nums text-muted-foreground">{r.studyCourseYear}</td>
                <td className="text-muted-foreground">{r.specialty}</td>
                <td className="tabular-nums text-muted-foreground">
                  {new Date(r.createdAt).toLocaleDateString("ru-RU")}
                </td>
              </>
            ) : null}
            <td>
              {r.role === "USER" ? (
                <span className="tabular-nums" style={{ color: "var(--foreground)", opacity: 1 }}>
                  {r.overallProgressPercent}%
                </span>
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
                <td className="tabular-nums font-medium">{r.role === "USER" ? r.totalScore : "—"}</td>
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
            <td className="text-right">
              <UserRowMenu userId={r.id} />
            </td>
          </tr>
        ))}
      </AdminTableBody>
    </AdminTable>
  );
}
