import type { AdminUserListRow } from "@/lib/admin-users-list";

/** Совпадает с окном KPI «активные за 7 дн.» на главной админки. */
export const STUDENTS_OVERVIEW_ACTIVE_DAYS = 7;

export type StudentsOverviewStatus = "active" | "inactive" | "completed";

export type StudentsOverviewFilterId = "all" | StudentsOverviewStatus;

export type StudentsOverviewSortId = "progress" | "lastActive" | "name";

export type StudentsOverviewRow = {
  id: string;
  displayName: string;
  email: string;
  progressPercent: number;
  lastActiveAt: string | null;
  status: StudentsOverviewStatus;
};

export const STUDENTS_OVERVIEW_FILTER_OPTIONS: ReadonlyArray<{
  id: StudentsOverviewFilterId;
  label: string;
}> = [
  { id: "all", label: "Все" },
  { id: "active", label: "Активные" },
  { id: "inactive", label: "Неактивные" },
  { id: "completed", label: "Завершили" },
];

export const STUDENTS_OVERVIEW_SORT_OPTIONS: ReadonlyArray<{
  id: StudentsOverviewSortId;
  label: string;
}> = [
  { id: "progress", label: "Прогресс" },
  { id: "lastActive", label: "Активность" },
  { id: "name", label: "Имя" },
];

const STATUS_LABELS: Record<StudentsOverviewStatus, string> = {
  active: "Активен",
  inactive: "Неактивен",
  completed: "Завершил курс",
};

export function studentsOverviewStatusLabel(status: StudentsOverviewStatus): string {
  return STATUS_LABELS[status];
}

export function studentProfileAdminHref(userId: string): string {
  return `/admin/users/${userId}`;
}

export function isStudentCompleted(row: Pick<StudentsOverviewRow, "progressPercent"> & { hasCertificate?: boolean }): boolean {
  return row.progressPercent >= 100 || Boolean(row.hasCertificate);
}

export function computeStudentsOverviewStatus(
  input: {
    progressPercent: number;
    lastActiveAt: string | null;
    hasCertificate: boolean;
  },
  now: Date = new Date(),
  activeDays = STUDENTS_OVERVIEW_ACTIVE_DAYS,
): StudentsOverviewStatus {
  if (isStudentCompleted({ progressPercent: input.progressPercent, hasCertificate: input.hasCertificate })) {
    return "completed";
  }
  if (!input.lastActiveAt) return "inactive";
  const since = new Date(now);
  since.setDate(since.getDate() - activeDays);
  return new Date(input.lastActiveAt) >= since ? "active" : "inactive";
}

export function mapAdminUserToStudentsOverviewRow(row: AdminUserListRow, now?: Date): StudentsOverviewRow | null {
  if (row.role !== "USER") return null;
  return {
    id: row.id,
    displayName: row.fullName,
    email: row.email,
    progressPercent: row.overallProgressPercent,
    lastActiveAt: row.lastActivityAt,
    status: computeStudentsOverviewStatus(
      {
        progressPercent: row.overallProgressPercent,
        lastActiveAt: row.lastActivityAt,
        hasCertificate: row.hasCertificate,
      },
      now,
    ),
  };
}

export function mapAdminUsersToStudentsOverview(rows: AdminUserListRow[], now?: Date): StudentsOverviewRow[] {
  return rows
    .map((r) => mapAdminUserToStudentsOverviewRow(r, now))
    .filter((r): r is StudentsOverviewRow => r != null);
}

export function searchStudentsOverviewRows(items: StudentsOverviewRow[], query: string): StudentsOverviewRow[] {
  const q = query.trim().toLowerCase();
  if (!q) return items;
  return items.filter((row) => {
    const hay = `${row.displayName} ${row.email}`.toLowerCase();
    return hay.includes(q);
  });
}

export function filterStudentsOverviewRows(
  items: StudentsOverviewRow[],
  filter: StudentsOverviewFilterId,
): StudentsOverviewRow[] {
  if (filter === "all") return items;
  return items.filter((row) => row.status === filter);
}

function lastActiveSortKey(iso: string | null): number {
  return iso ? new Date(iso).getTime() : 0;
}

export function sortStudentsOverviewRows(
  items: StudentsOverviewRow[],
  sort: StudentsOverviewSortId,
): StudentsOverviewRow[] {
  const copy = [...items];
  switch (sort) {
    case "progress":
      copy.sort((a, b) => b.progressPercent - a.progressPercent || a.displayName.localeCompare(b.displayName, "ru"));
      break;
    case "lastActive":
      copy.sort(
        (a, b) =>
          lastActiveSortKey(b.lastActiveAt) - lastActiveSortKey(a.lastActiveAt) ||
          a.displayName.localeCompare(b.displayName, "ru"),
      );
      break;
    case "name":
      copy.sort((a, b) => a.displayName.localeCompare(b.displayName, "ru"));
      break;
    default:
      break;
  }
  return copy;
}

export function paginateStudentsOverview<T>(
  items: T[],
  page: number,
  pageSize: number,
): { items: T[]; page: number; totalPages: number; total: number } {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    page: safePage,
    totalPages,
    total,
  };
}

export function processStudentsOverviewList(input: {
  rows: StudentsOverviewRow[];
  search: string;
  filter: StudentsOverviewFilterId;
  sort: StudentsOverviewSortId;
  page: number;
  pageSize: number;
}) {
  const searched = searchStudentsOverviewRows(input.rows, input.search);
  const filtered = filterStudentsOverviewRows(searched, input.filter);
  const sorted = sortStudentsOverviewRows(filtered, input.sort);
  const paged = paginateStudentsOverview(sorted, input.page, input.pageSize);
  return { ...paged, filteredTotal: filtered.length };
}
