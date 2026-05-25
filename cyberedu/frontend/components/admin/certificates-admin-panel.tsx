import Link from "next/link";
import { Award, ExternalLink, Plus } from "lucide-react";
import { AdminIssueCertificateForm } from "@/components/admin/admin-issue-certificate-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AdminEmptyState } from "@/components/admin/admin-states";
import { MetricCard } from "@/components/ui/metric-card";
import { SectionCard } from "@/components/ui/section-card";
import type {
  CertificateRegistryStatus,
  CertificatesAdminPanelData,
} from "@/lib/certificates-admin-panel-logic";

function formatAt(iso: string): string {
  return new Date(iso).toLocaleString("ru-RU", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusBadgeVariant(status: CertificateRegistryStatus): "success" | "secondary" {
  return status === "active" ? "success" : "secondary";
}

function statusLabel(status: CertificateRegistryStatus): string {
  return status === "active" ? "active" : "revoked";
}

export function CertificatesAdminPanel({ data }: { data: CertificatesAdminPanelData }) {
  const showIssueCta = data.issueSupported && data.eligibleCount > 0;
  const showIssueBlock = data.issueSupported && data.eligibleCandidates.length > 0;

  return (
    <SectionCard variant="lab" flushTitle className="min-w-0 p-4 sm:p-6" id="certificates-panel">
      <div className="flex items-center gap-2">
        <Award className="size-5 text-primary" aria-hidden />
        <h2 className="font-display text-base font-semibold text-foreground">Сертификаты</h2>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Реестр и проверка подлинности. Выдача и отзыв — только через сервер с проверкой прав администратора.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <MetricCard label="Выдано" value={String(data.issuedTotal)} hint="записей в реестре" />
        {data.eligibleCount > 0 ? (
          <MetricCard
            label="Готово к выдаче"
            value={String(data.eligibleCount)}
            hint="курс завершён, нет сертификата"
            variant="accent"
          />
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button asChild variant="outline" size="sm" className="min-h-11">
          <Link href={data.registryHref}>Открыть сертификаты</Link>
        </Button>
        {data.recent.length > 0 ? (
          <Button asChild variant="outline" size="sm" className="min-h-11">
            <Link href={data.verifyCtaHref} target="_blank" rel="noreferrer">
              Проверить сертификат
              <ExternalLink className="ml-1.5 size-3.5" aria-hidden />
            </Link>
          </Button>
        ) : (
          <Button variant="outline" size="sm" className="min-h-11" disabled type="button">
            Проверить сертификат
          </Button>
        )}
        {showIssueCta ? (
          <Button asChild variant="secondary" size="sm" className="min-h-11">
            <a href="#certificates-issue">
              <Plus className="mr-1.5 size-3.5" aria-hidden />
              Выдать сертификат
            </a>
          </Button>
        ) : null}
      </div>

      {data.recent.length === 0 ? (
        <p className="mt-2 text-xs text-muted-foreground">
          Проверка по коду доступна после появления записей в реестре.
        </p>
      ) : null}

      {showIssueBlock ? (
        <div
          id="certificates-issue"
          className="mt-4 scroll-mt-24 rounded-xl border border-primary/20 bg-primary/5 p-3"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Выдача (server action)
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Условия курса проверяются на сервере; UI не создаёт запись самостоятельно.
          </p>
          <ul className="mt-3 space-y-2">
            {data.eligibleCandidates.map((c) => (
              <li key={c.userId} className="rounded-lg border border-border/60 bg-card/60 px-3 py-2">
                <AdminIssueCertificateForm
                  userId={c.userId}
                  courseId={c.courseId}
                  studentLabel={c.studentLabel}
                />
              </li>
            ))}
          </ul>
          {data.eligibleCount > data.eligibleCandidates.length ? (
            <p className="mt-2 text-xs text-muted-foreground">
              Ещё {data.eligibleCount - data.eligibleCandidates.length} в очереди — см.{" "}
              <Link href={data.registryHref} className="font-medium text-primary hover:underline">
                реестр
              </Link>{" "}
              или карточку студента.
            </p>
          ) : null}
        </div>
      ) : showIssueCta ? (
        <p className="mt-3 text-sm text-muted-foreground">
          {data.eligibleCount} студент(ов) готовы к выдаче — откройте{" "}
          <Link href={data.registryHref} className="font-medium text-primary hover:underline">
            реестр
          </Link>{" "}
          или карточку студента.
        </p>
      ) : null}

      {data.supportsRevoke ? (
        <p className="mt-2 text-[11px] text-muted-foreground">
          Отзыв помечает запись revoked; публичная verify перестаёт показывать valid.
        </p>
      ) : null}

      {data.recent.length === 0 ? (
        <AdminEmptyState kind="no_certificates" className="mt-4" />
      ) : (
        <ul className="mt-4 space-y-2" aria-label="Последние сертификаты">
          {data.recent.map((c) => (
            <li
              key={c.id}
              className="flex flex-col gap-2 rounded-lg border border-border/70 px-3 py-2.5 text-sm sm:flex-row sm:items-start sm:justify-between"
            >
              <div className="min-w-0 space-y-1">
                {c.studentHref ? (
                  <Link href={c.studentHref} className="font-medium text-foreground hover:underline">
                    {c.studentLabel}
                  </Link>
                ) : (
                  <p className="font-medium text-foreground">{c.studentLabel}</p>
                )}
                <time className="block text-xs tabular-nums text-muted-foreground" dateTime={c.issuedAt}>
                  {formatAt(c.issuedAt)}
                </time>
                <p className="font-mono text-xs text-foreground">{c.certificateNumber}</p>
                <p className="text-xs text-muted-foreground">
                  ID: <span className="font-mono">{c.id}</span>
                  {c.courseTitle ? ` · ${c.courseTitle}` : null}
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-2">
                <Badge variant={statusBadgeVariant(c.status)}>{statusLabel(c.status)}</Badge>
                {c.hasPdf ? (
                  <Badge variant="outline">PDF</Badge>
                ) : (
                  <Badge variant="warning">нет PDF</Badge>
                )}
                <Button asChild size="sm" variant="ghost" className="min-h-9">
                  <Link href={c.verifyHref} target="_blank" rel="noreferrer">
                    Verify
                    <ExternalLink className="ml-1 size-3" aria-hidden />
                  </Link>
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}
