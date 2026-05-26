import type { Metadata } from "next";
import Link from "next/link";
import { AdminDualTable } from "@/components/admin/admin-dual-table";
import { AdminMobileCard } from "@/components/admin/admin-mobile-card";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminTableCard } from "@/components/admin/admin-table-card";
import { AdminShell } from "@/components/layout/admin-shell";
import { getAdminCertificateRows } from "@/lib/admin-certificates-list";
import { certificateVerifyUrl } from "@/lib/certificate";
import { Badge } from "@/components/ui/badge";
import { UiStatePanel } from "@/components/ui/ui-state-panel";

export const metadata: Metadata = {
  title: "Сертификаты",
};

export default async function AdminCertificatesPage() {
  const rows = await getAdminCertificateRows();

  return (
    <AdminShell>
      <div className="space-y-6">
        <AdminPageHeader
          eyebrow="Реестр · CyberEdu"
          title="Сертификаты"
          description="Публичная проверка подлинности: страница /certificate/verify/<код>."
        />

        <AdminTableCard title="Реестр выданных" description={`${rows.length} записей (последние 500)`}>
          <UiStatePanel
            state={rows.length === 0 ? "empty" : "idle"}
            className="m-4 py-10"
            title="Сертификатов пока нет"
            description="Они появятся после завершения курса студентами."
            terminalLine="registry --empty"
          >
            <AdminDualTable
              mobile={
                <div className="space-y-4 p-4 sm:p-5">
                  {rows.map((r) => (
                    <AdminMobileCard key={r.id} className="space-y-2">
                      <p className="font-mono text-sm font-medium text-foreground">{r.certificateNumber}</p>
                      <p className="text-sm text-foreground">{r.fullName}</p>
                      <p className="break-all text-xs text-muted-foreground">{r.userEmail}</p>
                      <p className="text-sm text-muted-foreground">{r.courseTitle}</p>
                      <p className="text-xs tabular-nums text-muted-foreground">
                        {new Date(r.issuedAt).toLocaleString("ru-RU")}
                      </p>
                      {r.pdfUrl ? (
                        <Badge variant="outline">PDF в хранилище</Badge>
                      ) : (
                        <Badge variant="warning">PDF не записан</Badge>
                      )}
                      <p className="break-all font-mono text-xs text-muted-foreground">{r.verificationCode}</p>
                      <Link
                        className="inline-flex min-h-11 items-center text-sm font-medium text-primary hover:underline"
                        href={certificateVerifyUrl(r.verificationCode)}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Открыть проверку
                      </Link>
                    </AdminMobileCard>
                  ))}
                </div>
              }
              desktop={
                <div className="overflow-x-auto">
                  <table className="w-full min-w-240 border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-border text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        <th className="px-3 py-2">Номер</th>
                        <th className="px-3 py-2">ФИО</th>
                        <th className="px-3 py-2">Email</th>
                        <th className="px-3 py-2">Курс</th>
                        <th className="px-3 py-2">Дата</th>
                        <th className="px-3 py-2">Проверка</th>
                        <th className="px-3 py-2">PDF</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((r) => (
                        <tr key={r.id} className="border-b border-border/80 hover:bg-muted/30">
                          <td className="px-3 py-2 font-mono text-xs">{r.certificateNumber}</td>
                          <td className="px-3 py-2">{r.fullName}</td>
                          <td className="max-w-50 break-all px-3 py-2 text-muted-foreground">{r.userEmail}</td>
                          <td className="px-3 py-2 text-muted-foreground">{r.courseTitle}</td>
                          <td className="whitespace-nowrap px-3 py-2 tabular-nums text-muted-foreground">
                            {new Date(r.issuedAt).toLocaleDateString("ru-RU")}
                          </td>
                          <td className="px-3 py-2">
                            <Link
                              className="text-primary underline-offset-4 hover:underline"
                              href={certificateVerifyUrl(r.verificationCode)}
                              target="_blank"
                              rel="noreferrer"
                            >
                              Открыть
                            </Link>
                          </td>
                          <td className="px-3 py-2 text-muted-foreground">{r.pdfUrl ? "да" : "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              }
            />
          </UiStatePanel>
        </AdminTableCard>
      </div>
    </AdminShell>
  );
}
