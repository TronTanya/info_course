"use client";

import type { AdminUserListRow } from "@/lib/admin-users-list";
import { AdminRowMenu } from "@/components/admin/admin-row-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

function progressBadgeVariant(pct: number): "secondary" | "warning" | "primary" | "success" {
  if (pct >= 100) return "success";
  if (pct >= 50) return "primary";
  if (pct > 0) return "warning";
  return "secondary";
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

const DASHBOARD_COLS =
  "ce-admin-users-grid__row--dashboard grid-cols-[minmax(7rem,1.1fr)_minmax(8rem,1.3fr)_5.5rem_4.5rem_4.5rem_4.5rem_minmax(5.5rem,0.9fr)_4.5rem_2.25rem]";

const FULL_COLS =
  "ce-admin-users-grid__row--full grid-cols-[minmax(7rem,1fr)_minmax(8rem,1.1fr)_5.5rem_minmax(6rem,1fr)_4rem_3rem_minmax(5rem,0.9fr)_4.5rem_4.5rem_4rem_4rem_4.5rem_2.25rem]";

/**
 * Desktop-список студентов: CSS Grid вместо &lt;table&gt; — обход бага Chrome/Safari
 * (пропадает текст в ячейках при backdrop-filter / glass на широких экранах).
 */
export function AdminUsersDesktopTable({
  rows,
  dashboardView = false,
}: {
  rows: AdminUserListRow[];
  dashboardView?: boolean;
}) {
  const rowCols = dashboardView ? DASHBOARD_COLS : FULL_COLS;

  return (
    <div
      className="ce-admin-users-grid min-w-0"
      role="table"
      aria-label={dashboardView ? "Студенты — краткий список" : "Пользователи платформы"}
    >
        <div role="rowgroup" className="sticky top-0 z-10">
          <div
            role="row"
            className={cn(
              "ce-admin-users-grid__row ce-admin-users-grid__head text-xs font-semibold uppercase tracking-wide text-muted-foreground",
              rowCols,
            )}
          >
            <div role="columnheader" className="ce-admin-users-grid__cell">
              ФИО
            </div>
            <div role="columnheader" className="ce-admin-users-grid__cell">
              Email
            </div>
            <div role="columnheader" className="ce-admin-users-grid__cell">
              Роль
            </div>
            {!dashboardView ? (
              <>
                <div role="columnheader" className="ce-admin-users-grid__cell">
                  Уч. заведение
                </div>
                <div role="columnheader" className="ce-admin-users-grid__cell">
                  Группа
                </div>
                <div role="columnheader" className="ce-admin-users-grid__cell">
                  Курс
                </div>
                <div role="columnheader" className="ce-admin-users-grid__cell">
                  Спец.
                </div>
                <div role="columnheader" className="ce-admin-users-grid__cell">
                  Рег.
                </div>
              </>
            ) : null}
            <div role="columnheader" className="ce-admin-users-grid__cell">
              Прогресс
            </div>
            {dashboardView ? (
              <>
                <div role="columnheader" className="ce-admin-users-grid__cell">
                  Тесты
                </div>
                <div role="columnheader" className="ce-admin-users-grid__cell">
                  Практика
                </div>
                <div role="columnheader" className="ce-admin-users-grid__cell">
                  Активность
                </div>
              </>
            ) : (
              <>
                <div role="columnheader" className="ce-admin-users-grid__cell">
                  Баллы
                </div>
                <div role="columnheader" className="ce-admin-users-grid__cell whitespace-normal">
                  Отчёт
                </div>
              </>
            )}
            <div role="columnheader" className="ce-admin-users-grid__cell">
              Серт.
            </div>
            <div role="columnheader" className="ce-admin-users-grid__cell" aria-label="Действия" />
          </div>
        </div>

        <div role="rowgroup">
          {rows.map((r) => (
            <div
              key={r.id}
              role="row"
              className={cn("ce-admin-users-grid__row ce-admin-users-grid__body-row", rowCols)}
            >
              <div role="cell" className="ce-admin-users-grid__cell ce-admin-users-grid__name">
                {r.fullName}
              </div>
              <div role="cell" className="ce-admin-users-grid__cell ce-admin-users-grid__email break-all">
                {r.email}
              </div>
              <div role="cell" className="ce-admin-users-grid__cell">
                <Badge variant={r.role === "ADMIN" ? "outline" : "secondary"} className="text-2.5">
                  {r.role === "ADMIN" ? "Админ" : "Студент"}
                </Badge>
              </div>
              {!dashboardView ? (
                <>
                  <div role="cell" className="ce-admin-users-grid__cell ce-admin-users-grid__muted">
                    {r.educationalInstitution}
                  </div>
                  <div role="cell" className="ce-admin-users-grid__cell ce-admin-users-grid__muted tabular-nums">
                    {r.studyGroup}
                  </div>
                  <div role="cell" className="ce-admin-users-grid__cell ce-admin-users-grid__muted tabular-nums">
                    {r.studyCourseYear}
                  </div>
                  <div role="cell" className="ce-admin-users-grid__cell ce-admin-users-grid__muted">
                    {r.specialty}
                  </div>
                  <div role="cell" className="ce-admin-users-grid__cell ce-admin-users-grid__muted tabular-nums">
                    {new Date(r.createdAt).toLocaleDateString("ru-RU")}
                  </div>
                </>
              ) : null}
              <div role="cell" className="ce-admin-users-grid__cell">
                {r.role === "USER" ? (
                  <Badge variant={progressBadgeVariant(r.overallProgressPercent)} className="tabular-nums">
                    {r.overallProgressPercent}%
                  </Badge>
                ) : (
                  <span className="ce-admin-users-grid__muted">—</span>
                )}
              </div>
              {dashboardView ? (
                <>
                  <div role="cell" className="ce-admin-users-grid__cell ce-admin-users-grid__muted tabular-nums text-sm">
                    {r.role === "USER" ? `${r.testsPassedCount}/${r.testAttemptCount}` : "—"}
                  </div>
                  <div role="cell" className="ce-admin-users-grid__cell ce-admin-users-grid__muted tabular-nums text-sm">
                    {r.role === "USER" ? r.practicesCompletedCount : "—"}
                  </div>
                  <div
                    role="cell"
                    className="ce-admin-users-grid__cell ce-admin-users-grid__muted whitespace-nowrap text-xs tabular-nums"
                  >
                    {formatLastActivity(r.lastActivityAt)}
                  </div>
                </>
              ) : (
                <>
                  <div role="cell" className="ce-admin-users-grid__cell tabular-nums font-medium">
                    {r.role === "USER" ? r.totalScore : "—"}
                  </div>
                  <div role="cell" className="ce-admin-users-grid__cell ce-admin-users-grid__muted tabular-nums">
                    {r.courseProgressRowCount}
                  </div>
                </>
              )}
              <div role="cell" className="ce-admin-users-grid__cell">
                {r.hasCertificate ? (
                  <span className="font-medium text-success">Выдан</span>
                ) : (
                  <span className="ce-admin-users-grid__muted">Нет</span>
                )}
              </div>
              <div role="cell" className="ce-admin-users-grid__cell flex justify-end">
                <UserRowMenu userId={r.id} />
              </div>
            </div>
          ))}
        </div>
    </div>
  );
}
