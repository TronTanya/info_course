"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ExternalLink, Search } from "lucide-react";
import type { AdminCertificatesPageData } from "@/lib/admin-certificates-page-data";
import type { AdminCertificateItem, AdminCertificateStatus } from "@/types/certificate-view-model";
import { CertificateEmptyState } from "@/components/certificate/certificate-states";
import { AdminIssueCertificateForm } from "@/components/admin/admin-issue-certificate-form";
import { AdminEmptyState } from "@/components/admin/admin-states";
import { AdminRevokeCertificateButton } from "@/components/admin/admin-revoke-certificate-button";
import { AdminDualTable } from "@/components/admin/admin-dual-table";
import { AdminMobileCard } from "@/components/admin/admin-mobile-card";
import { AdminTable, AdminTableBody, AdminTableHead, AdminTh } from "@/components/admin/admin-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatRuDateLongUtc } from "@/lib/datetime-stable";
import { cn } from "@/lib/utils";

export type AdminRegistryFilter = "all" | "issued" | "ready" | "revoked";

const FILTER_LABELS: Record<AdminRegistryFilter, string> = {
  all: "Все",
  issued: "Выданные",
  ready: "Готовы к выдаче",
  revoked: "Отозванные",
};

function matchesQuery(q: string, row: AdminCertificateItem): boolean {
  const needle = q.trim().toLowerCase();
  if (!needle) return true;
  const parts = [
    row.id,
    row.certificateNumber,
    row.studentDisplayName,
    row.courseTitle,
  ];
  return parts.some((p) => p.toLowerCase().includes(needle));
}

function formatIssuedAt(iso: string | undefined): string {
  if (!iso) return "—";
  return formatRuDateLongUtc(iso);
}

function statusBadge(status: AdminCertificateStatus) {
  switch (status) {
    case "issued":
      return <Badge variant="success">Выдан</Badge>;
    case "revoked":
      return <Badge variant="danger">Отозван</Badge>;
    case "ready":
      return <Badge variant="primary">Готов к выдаче</Badge>;
    case "expired":
      return <Badge variant="warning">Истёк</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

function CertificateActions({
  row,
  supportsRevoke,
  supportsRevokeReason,
}: {
  row: AdminCertificateItem;
  supportsRevoke: boolean;
  supportsRevokeReason: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button asChild size="sm" variant="outline" className="min-h-9">
        <Link href={row.adminHref}>Открыть</Link>
      </Button>
      {row.status === "ready" && row.issueUserId && row.issueCourseId ? (
        <AdminIssueCertificateForm
          userId={row.issueUserId}
          courseId={row.issueCourseId}
          studentLabel={row.studentDisplayName}
          compact
        />
      ) : null}
      {row.verifyHref && row.status !== "ready" ? (
        <Button asChild size="sm" variant="ghost" className="min-h-9 gap-1">
          <Link href={row.verifyHref} target="_blank" rel="noopener noreferrer">
            Verify
            <ExternalLink className="size-3 opacity-70" aria-hidden />
          </Link>
        </Button>
      ) : null}
      {supportsRevoke && row.status === "issued" ? (
        <AdminRevokeCertificateButton
          certificateId={row.id}
          certificateNumber={row.certificateNumber}
          supportsRevokeReason={supportsRevokeReason}
        />
      ) : null}
    </div>
  );
}

function RegistryTable({
  rows,
  supportsRevoke,
  supportsRevokeReason,
}: {
  rows: AdminCertificateItem[];
  supportsRevoke: boolean;
  supportsRevokeReason: boolean;
}) {
  return (
    <AdminDualTable
      mobile={
        <div className="space-y-4 p-4">
          {rows.map((r) => (
            <AdminMobileCard key={r.id} className="space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <p className="font-mono text-xs font-medium text-foreground">{r.certificateNumber}</p>
                {statusBadge(r.status)}
              </div>
              <p className="font-medium text-foreground">{r.studentDisplayName}</p>
              <p className="text-sm text-muted-foreground">{r.courseTitle}</p>
              <p className="text-xs text-muted-foreground">
                <span className="uppercase tracking-wide">ID:</span>{" "}
                <span className="font-mono text-foreground">{r.id}</span>
              </p>
              <p className="text-xs tabular-nums text-muted-foreground">
                Выдан: {formatIssuedAt(r.issuedAt)}
              </p>
              <CertificateActions
                row={r}
                supportsRevoke={supportsRevoke}
                supportsRevokeReason={supportsRevokeReason}
              />
            </AdminMobileCard>
          ))}
        </div>
      }
      desktop={
        <div className="overflow-x-auto">
          <AdminTable minWidth="1040px" caption="Реестр сертификатов CyberEdu">
            <AdminTableHead>
              <tr>
                <AdminTh>Certificate ID</AdminTh>
                <AdminTh>Номер</AdminTh>
                <AdminTh>Студент</AdminTh>
                <AdminTh>Курс</AdminTh>
                <AdminTh>Статус</AdminTh>
                <AdminTh>Дата выдачи</AdminTh>
                <AdminTh>Verify</AdminTh>
                <AdminTh>Действия</AdminTh>
              </tr>
            </AdminTableHead>
            <AdminTableBody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-border/80 hover:bg-muted/30">
                  <td className="max-w-[8rem] px-3 py-2">
                    <span className="font-mono text-[10px] text-muted-foreground" title={r.id}>
                      {r.id.length > 14 ? `${r.id.slice(0, 8)}…` : r.id}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 font-mono text-xs">{r.certificateNumber}</td>
                  <td className="px-3 py-2">
                    <Link href={r.adminHref} className="font-medium hover:underline">
                      {r.studentDisplayName}
                    </Link>
                  </td>
                  <td className="px-3 py-2 text-sm text-muted-foreground">{r.courseTitle}</td>
                  <td className="px-3 py-2">{statusBadge(r.status)}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-xs tabular-nums text-muted-foreground">
                    {formatIssuedAt(r.issuedAt)}
                  </td>
                  <td className="px-3 py-2">
                    {r.verifyHref && r.status !== "ready" ? (
                      <Link
                        href={r.verifyHref}
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Ссылка
                        <ExternalLink className="size-3 opacity-70" aria-hidden />
                      </Link>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <CertificateActions
                      row={r}
                      supportsRevoke={supportsRevoke}
                      supportsRevokeReason={supportsRevokeReason}
                    />
                  </td>
                </tr>
              ))}
            </AdminTableBody>
          </AdminTable>
        </div>
      }
    />
  );
}

export function CertificatesRegistry({
  issuedItems,
  eligibleItems,
  supportsRevoke,
  supportsRevokeReason,
  counts,
}: Pick<
  AdminCertificatesPageData,
  "issuedItems" | "eligibleItems" | "supportsRevoke" | "supportsRevokeReason" | "counts"
>) {
  const [filter, setFilter] = useState<AdminRegistryFilter>("all");
  const [query, setQuery] = useState("");

  const activeIssued = useMemo(
    () => issuedItems.filter((r) => r.status === "issued"),
    [issuedItems],
  );
  const revokedIssued = useMemo(
    () => issuedItems.filter((r) => r.status === "revoked"),
    [issuedItems],
  );

  const filteredRows = useMemo(() => {
    let pool: AdminCertificateItem[] = [];
    switch (filter) {
      case "all":
        pool = [...eligibleItems, ...issuedItems];
        break;
      case "issued":
        pool = activeIssued;
        break;
      case "revoked":
        pool = revokedIssued;
        break;
      case "ready":
        pool = eligibleItems;
        break;
      default:
        pool = issuedItems;
    }
    return pool.filter((r) => matchesQuery(query, r));
  }, [filter, query, eligibleItems, issuedItems, activeIssued, revokedIssued]);

  function renderEmpty() {
    if (query.trim()) {
      return (
        <p className="py-10 text-center text-sm text-muted-foreground">
          Нет записей по поиску. Измените запрос или сбросьте фильтр.
        </p>
      );
    }
    if (filter === "ready") {
      return <AdminEmptyState kind="no_ready_to_issue" compact className="py-4" />;
    }
    if (filter === "issued" && counts.issued === 0) {
      return <CertificateEmptyState kind="admin_no_issued" compact className="py-2" />;
    }
    if (filter === "revoked" && counts.revoked === 0) {
      return (
        <p className="py-10 text-center text-sm text-muted-foreground">Отозванных сертификатов пока нет.</p>
      );
    }
    if (filter === "all" && counts.total === 0) {
      return <CertificateEmptyState kind="admin_no_issued" compact className="py-2" />;
    }
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        Нет записей по выбранному фильтру.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg border border-border/70 bg-muted/20 px-3 py-2">
          <dt className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Всего</dt>
          <dd className="mt-0.5 font-display text-lg font-semibold tabular-nums">{counts.total}</dd>
        </div>
        <div className="rounded-lg border border-success/25 bg-success/5 px-3 py-2">
          <dt className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Выданные</dt>
          <dd className="mt-0.5 font-display text-lg font-semibold tabular-nums text-success">{counts.issued}</dd>
        </div>
        <div className="rounded-lg border border-primary/25 bg-primary/5 px-3 py-2">
          <dt className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Готовы</dt>
          <dd className="mt-0.5 font-display text-lg font-semibold tabular-nums text-primary">{counts.ready}</dd>
        </div>
        <div className="rounded-lg border border-danger/25 bg-danger/5 px-3 py-2">
          <dt className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Отозванные</dt>
          <dd className="mt-0.5 font-display text-lg font-semibold tabular-nums text-danger">{counts.revoked}</dd>
        </div>
      </dl>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Фильтр по статусу">
          {(Object.keys(FILTER_LABELS) as AdminRegistryFilter[]).map((key) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={filter === key}
              className={cn(
                "min-h-10 rounded-lg border px-3 text-sm font-medium transition-colors",
                filter === key
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "border-border/70 text-muted-foreground hover:bg-muted/30",
              )}
              onClick={() => setFilter(key)}
            >
              {FILTER_LABELS[key]}
              {key === "issued" ? ` (${counts.issued})` : null}
              {key === "ready" ? ` (${counts.ready})` : null}
              {key === "revoked" ? ` (${counts.revoked})` : null}
            </button>
          ))}
        </div>
        <div className="relative w-full lg:max-w-md">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            type="search"
            placeholder="Поиск: студент, Certificate ID, номер CE-…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
            aria-label="Поиск в реестре сертификатов"
          />
        </div>
      </div>

      {filteredRows.length === 0 ? renderEmpty() : (
        <RegistryTable
          rows={filteredRows}
          supportsRevoke={supportsRevoke}
          supportsRevokeReason={supportsRevokeReason}
        />
      )}

      {!supportsRevoke ? (
        <p className="text-xs text-muted-foreground">
          Отзыв сертификатов отключён в конфигурации реестра (миграция revoked).
        </p>
      ) : (
        <p className="text-xs text-muted-foreground">
          Выдача и отзыв выполняются только через server actions с записью в audit log. Секреты подписи PDF не
          отображаются.
        </p>
      )}
    </div>
  );
}
