import type { Metadata } from "next";
import Link from "next/link";
import { CertificatesAdminPanel } from "@/components/admin/certificates-admin-panel";
import { CertificatesRegistry } from "@/components/admin/certificates-registry";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminTableCard } from "@/components/admin/admin-table-card";
import { AdminShell } from "@/components/layout/admin-shell";
import { ensureAdminPageAccess } from "@/lib/admin-page-guard";
import { getAdminCertificatesPageData } from "@/lib/admin-certificates-page-data";
import { SectionCard } from "@/components/ui/section-card";

export const metadata: Metadata = {
  title: "Сертификаты",
};

export default async function AdminCertificatesPage() {
  await ensureAdminPageAccess();
  const data = await getAdminCertificatesPageData();

  return (
    <AdminShell>
      <div className="space-y-6">
        <AdminPageHeader
          eyebrow="Admin · Сертификаты"
          title="Реестр сертификатов"
          description="Выданные, готовые к выдаче и отозванные записи. Поиск по студенту и ID. Выдача и отзыв — только server actions с аудитом."
        />

        <CertificatesAdminPanel data={data.panel} />

        <AdminTableCard
          title="Реестр и очередь выдачи"
          description={`${data.counts.issued} выданных · ${data.counts.ready} готовы · ${data.counts.revoked} отозванных`}
        >
          <div className="p-4 sm:p-5">
            <CertificatesRegistry
              issuedItems={data.issuedItems}
              eligibleItems={data.eligibleItems}
              supportsRevoke={data.supportsRevoke}
              supportsRevokeReason={data.supportsRevokeReason}
              counts={data.counts}
            />
          </div>
        </AdminTableCard>

        <SectionCard variant="muted" className="text-sm text-muted-foreground">
          <p>
            <strong className="text-foreground">Публичная проверка:</strong>{" "}
            <Link href="/verify" className="text-primary hover:underline">
              /verify/CE-…
            </Link>
            . Статусы: valid, not found, revoked. Имя владельца на verify — только при{" "}
            <code className="text-xs">CERTIFICATE_VERIFY_SHOW_HOLDER_NAME=1</code>. Секреты подписи и verification
            code в UI не передаются.
          </p>
        </SectionCard>
      </div>
    </AdminShell>
  );
}
