import type { Metadata } from "next";
import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { AdminDualTable } from "@/components/admin/admin-dual-table";
import { AdminFilterTabs } from "@/components/admin/admin-filter-tabs";
import { AdminMobileCard } from "@/components/admin/admin-mobile-card";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminTable, AdminTableBody, AdminTableHead } from "@/components/admin/admin-table";
import { AdminTableCard } from "@/components/admin/admin-table-card";
import { AdminShell } from "@/components/layout/admin-shell";
import { Button } from "@/components/ui/button";
import { UiStatePanel } from "@/components/ui/ui-state-panel";
import { prisma } from "@/lib/db";

export const metadata: Metadata = {
  title: "Отправки практики",
};

function filterWhere(filter: string | undefined): Prisma.SubmissionWhereInput {
  const f = filter ?? "all";
  if (f === "pending") return { status: { in: ["SUBMITTED", "CHECKING", "NEEDS_REVISION"] } };
  if (f === "accepted") return { status: "ACCEPTED" };
  if (f === "rejected") return { status: "REJECTED" };
  if (f === "revision") return { status: "NEEDS_REVISION" };
  return { status: { not: "DRAFT" } };
}

function studentLabel(
  email: string,
  profile: { firstName: string; lastName: string; middleName: string | null } | null,
): string {
  if (!profile) return email;
  const mid = profile.middleName ? ` ${profile.middleName}` : "";
  return `${profile.lastName} ${profile.firstName}${mid}`.trim();
}

function taskTypeRu(t: string): string {
  const m: Record<string, string> = {
    TEXT_ANSWER: "Текст",
    FILE_UPLOAD: "Файл",
    INTERACTIVE: "Консоль",
    COMBINED: "Комбо",
    SITUATION_CHOICE: "Ситуации",
    PASSWORD_ANALYSIS: "Пароли",
    PHISHING_ANALYSIS: "Фишинг",
    CHECKLIST: "Чек-лист",
    URL_ANALYSIS: "Ссылки",
    TRAINING_CONSOLE: "Консоль+",
    CRYPTO_TASK: "Крипто",
    LOG_ANALYSIS: "Лог",
  };
  return m[t] ?? t;
}

function statusRu(s: string): string {
  const m: Record<string, string> = {
    DRAFT: "Черновик",
    SUBMITTED: "Отправлено",
    CHECKING: "На проверке",
    ACCEPTED: "Принято",
    REJECTED: "Отклонено",
    NEEDS_REVISION: "На доработке",
  };
  return m[s] ?? s;
}

const TABS: { href: string; label: string; match: string }[] = [
  { href: "/admin/submissions", label: "Все", match: "all" },
  { href: "/admin/submissions?filter=pending", label: "Ожидают проверки", match: "pending" },
  { href: "/admin/submissions?filter=accepted", label: "Принятые", match: "accepted" },
  { href: "/admin/submissions?filter=rejected", label: "Отклонённые", match: "rejected" },
  { href: "/admin/submissions?filter=revision", label: "На доработке", match: "revision" },
];

type Props = { searchParams: Promise<{ filter?: string }> };

export default async function AdminSubmissionsPage({ searchParams }: Props) {
  const { filter } = await searchParams;
  const active = filter ?? "all";

  const rows = await prisma.submission.findMany({
    where: filterWhere(filter),
    orderBy: { createdAt: "desc" },
    take: 300,
    include: {
      user: {
        select: {
          email: true,
          profile: { select: { firstName: true, lastName: true, middleName: true } },
        },
      },
      practicalTask: {
        select: {
          title: true,
          taskType: true,
          module: { select: { title: true } },
        },
      },
    },
  });

  return (
    <AdminShell>
      <div className="space-y-6">
        <AdminPageHeader
          eyebrow="Проверка · Cyber Lab"
          title="Практические отправки"
          description="Отправки со статусом не «черновик». После «Принято» пересчитывается прогресс модуля и курс."
        />

        <AdminFilterTabs tabs={TABS} active={active} />

        <AdminTableCard
          title="Очередь проверки"
          description={`${rows.length} записей по фильтру «${TABS.find((t) => t.match === active)?.label ?? active}»`}
        >
          <UiStatePanel
            state={rows.length === 0 ? "empty" : "idle"}
            className="m-4 py-10"
            title="Нет отправок"
            description="По выбранному фильтру работ не найдено."
            terminalLine="queue --empty"
          >
            <AdminDualTable
              mobile={
                <div className="space-y-4 p-4 sm:p-5">
                  {rows.map((r) => (
                    <AdminMobileCard key={r.id} className="space-y-3">
                      <div>
                        <p className="font-medium text-foreground">{studentLabel(r.user.email, r.user.profile)}</p>
                        <p className="mt-0.5 break-all text-xs text-muted-foreground">{r.user.email}</p>
                      </div>
                      <div className="grid gap-2 text-sm">
                        <p>
                          <span className="text-muted-foreground">Модуль: </span>
                          <span className="text-foreground">{r.practicalTask.module.title}</span>
                        </p>
                        <p>
                          <span className="text-muted-foreground">Задание: </span>
                          <span className="text-foreground">{r.practicalTask.title}</span>
                        </p>
                        <p>
                          <span className="text-muted-foreground">Тип: </span>
                          {taskTypeRu(r.practicalTask.taskType)}
                        </p>
                        <p className="tabular-nums text-muted-foreground">{r.createdAt.toLocaleString("ru-RU")}</p>
                        <p>
                          <span className="text-muted-foreground">Статус: </span>
                          {statusRu(r.status)}
                        </p>
                        <p>
                          <span className="text-muted-foreground">Баллы: </span>
                          <span className="tabular-nums">{r.score ?? "—"}</span>
                        </p>
                      </div>
                      <Button asChild size="sm" variant="secondary" className="w-full">
                        <Link href={`/admin/submissions/${r.id}`}>Проверить</Link>
                      </Button>
                    </AdminMobileCard>
                  ))}
                </div>
              }
              desktop={
                <AdminTable minWidth="960px" caption="Очередь проверки практических работ">
                  <AdminTableHead>
                    <tr>
                      <th>Студент</th>
                      <th>Модуль</th>
                      <th>Задание</th>
                      <th>Тип</th>
                      <th>Дата</th>
                      <th>Статус</th>
                      <th>Баллы</th>
                      <th className="text-right">Действие</th>
                    </tr>
                  </AdminTableHead>
                  <AdminTableBody>
                    {rows.map((r) => (
                      <tr key={r.id}>
                        <td>
                          <span className="font-medium text-foreground">
                            {studentLabel(r.user.email, r.user.profile)}
                          </span>
                          <br />
                          <span className="text-xs text-muted-foreground">{r.user.email}</span>
                        </td>
                        <td className="text-foreground">{r.practicalTask.module.title}</td>
                        <td className="text-foreground">{r.practicalTask.title}</td>
                        <td className="text-muted-foreground">{taskTypeRu(r.practicalTask.taskType)}</td>
                        <td className="whitespace-nowrap tabular-nums text-muted-foreground">
                          {r.createdAt.toLocaleString("ru-RU")}
                        </td>
                        <td>{statusRu(r.status)}</td>
                        <td className="tabular-nums text-muted-foreground">{r.score ?? "—"}</td>
                        <td className="text-right">
                          <Button asChild size="sm" variant="secondary">
                            <Link href={`/admin/submissions/${r.id}`}>Проверить</Link>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </AdminTableBody>
                </AdminTable>
              }
            />
          </UiStatePanel>
        </AdminTableCard>
      </div>
    </AdminShell>
  );
}
