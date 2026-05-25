"use client";

import { useState, type ReactNode } from "react";
import { Check, Copy, Download, FileText, Link2, Mail, ScrollText, Table2, Terminal } from "lucide-react";
import {
  evidenceItemLabel,
  parseLogContent,
  parseUrlForDisplay,
  safePracticeDownloadHref,
} from "@/lib/evidence-panel";
import { logSeverityPresentation, logSeverityToneClass } from "@/lib/practice-a11y";
import type {
  EvidenceAttachmentMeta,
  EvidenceItem,
  EvidenceLogEntry,
  EvidenceTableRow,
} from "@/types/practice-view-model";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function EvidenceCopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="ce-touch-target h-10 min-h-10 shrink-0 gap-1.5 text-xs sm:h-8 sm:min-h-8"
      onClick={() => void copy()}
      aria-label={label}
    >
      {copied ? <Check className="size-3.5 text-success" aria-hidden /> : <Copy className="size-3.5" aria-hidden />}
      {copied ? "Скопировано" : "Копировать"}
    </Button>
  );
}

function MetaRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-0.5 sm:grid-cols-[7rem_1fr] sm:gap-3">
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="min-w-0 text-sm text-foreground">{children}</dd>
    </div>
  );
}

function EvidencePanelShell({
  icon: Icon,
  title,
  badge,
  children,
  className,
}: {
  icon: typeof Mail;
  title: string;
  badge?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <article
      className={cn(
        "ce-evidence-panel-item min-w-0 max-w-full overflow-hidden rounded-xl border border-border/70 bg-card/80 shadow-sm ring-1 ring-border/40",
        className,
      )}
    >
      <header className="flex flex-wrap items-center gap-2 border-b border-border/60 bg-muted/20 px-4 py-3">
        <Icon className="size-4 shrink-0 text-primary" aria-hidden />
        <h3 className="min-w-0 flex-1 text-sm font-semibold text-foreground">{title}</h3>
        {badge ? (
          <span className="rounded-md border border-primary/25 bg-primary/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-primary">
            {badge}
          </span>
        ) : null}
      </header>
      <div className="space-y-4 p-4 sm:p-5">{children}</div>
    </article>
  );
}

function ScrollPre({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <pre
      className={cn(
        "ce-scroll-x-contained max-h-72 max-w-full overflow-auto rounded-lg border border-border/60 bg-muted/25 p-3 font-mono text-xs leading-relaxed break-words text-foreground/90",
        className,
      )}
    >
      {children}
    </pre>
  );
}

function EvidenceEmailPanel({ item }: { item: EvidenceItem }) {
  const meta = item.metadata ?? {};
  const from = meta.from || "—";
  const to = meta.to || "—";
  const subject = meta.subject || item.title;
  const date = meta.date || "—";
  const body = item.content ?? "";
  const links = item.links ?? [];
  const attachments = item.attachments ?? [];

  return (
    <EvidencePanelShell icon={Mail} title={item.title} badge="email">
      <dl className="space-y-3">
        <MetaRow label="From">{from}</MetaRow>
        <MetaRow label="To">{to}</MetaRow>
        <MetaRow label="Subject">
          <span className="font-medium">{subject}</span>
        </MetaRow>
        <MetaRow label="Date">{date}</MetaRow>
      </dl>

      {body ? (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Body</p>
          <ScrollPre className="whitespace-pre-wrap font-sans text-sm">{body}</ScrollPre>
        </div>
      ) : null}

      {links.length > 0 ? (
        <div>
          <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <Link2 className="size-3.5" aria-hidden />
            Links (копирование, без перехода)
          </p>
          <ul className="space-y-2" role="list">
            {links.map((href) => (
              <li
                key={href}
                className="flex flex-col gap-2 rounded-lg border border-warning/25 bg-warning/5 px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
              >
                <code className="break-all font-mono text-xs text-foreground">{href}</code>
                <EvidenceCopyButton value={href} label={`Копировать ссылку ${href}`} />
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {attachments.length > 0 ? (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Attachments (metadata)
          </p>
          <ul className="space-y-2" role="list">
            {attachments.map((a: EvidenceAttachmentMeta) => (
              <li
                key={`${a.name}-${a.size ?? ""}`}
                className="rounded-lg border border-border/60 bg-muted/15 px-3 py-2 text-sm"
              >
                <span className="font-medium text-foreground">{a.name}</span>
                <span className="mt-1 block text-xs text-muted-foreground">
                  {[a.mimeType, a.size].filter(Boolean).join(" · ") || "учебный артефакт"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </EvidencePanelShell>
  );
}

function EvidenceUrlPanel({ item }: { item: EvidenceItem }) {
  const display = item.urlDisplay ?? parseUrlForDisplay(item.content ?? "", item.metadata?.visibleText);
  const fullUrl = display.fullUrl;

  return (
    <EvidencePanelShell icon={Link2} title={item.title} badge="url">
      <p className="rounded-lg border border-warning/30 bg-warning/8 px-3 py-2 text-xs text-muted-foreground">
        Учебный пример: ссылка не открывается в браузере. Используйте «Копировать» для анализа в блокноте.
      </p>
      <dl className="space-y-3">
        <MetaRow label="URL">
          <code className="block break-all font-mono text-xs">{fullUrl}</code>
        </MetaRow>
        <MetaRow label="Домен">{display.domain}</MetaRow>
        <MetaRow label="Протокол">{display.protocol}</MetaRow>
        <MetaRow label="Путь">
          <code className="break-all font-mono text-xs">{display.path}</code>
        </MetaRow>
        {display.visibleText ? (
          <MetaRow label="Видимый текст">{display.visibleText}</MetaRow>
        ) : null}
      </dl>
      <EvidenceCopyButton value={fullUrl} label="Копировать URL" />
    </EvidencePanelShell>
  );
}

function EvidenceLogPanel({ item }: { item: EvidenceItem }) {
  const entries: EvidenceLogEntry[] =
    item.logEntries ?? (item.content ? parseLogContent(item.content) : []);

  return (
    <EvidencePanelShell icon={ScrollText} title={item.title} badge="log">
      {entries.length > 0 ? (
        <div className="ce-scroll-x-contained overflow-x-auto rounded-lg border border-border/70">
          <table className="w-full min-w-[min(100%,32rem)] border-collapse text-left text-xs sm:min-w-[32rem]">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th scope="col" className="px-3 py-2 font-semibold text-foreground">
                  Timestamp
                </th>
                <th scope="col" className="px-3 py-2 font-semibold text-foreground">
                  Source
                </th>
                <th scope="col" className="px-3 py-2 font-semibold text-foreground">
                  Event
                </th>
                <th scope="col" className="px-3 py-2 font-semibold text-foreground">
                  Severity
                </th>
              </tr>
            </thead>
            <tbody>
              {entries.map((row, i) => {
                const severity = logSeverityPresentation(row.severity);
                return (
                  <tr key={`${row.raw}-${i}`} className="border-b border-border/40 last:border-0 even:bg-muted/10">
                    <td className="whitespace-nowrap px-3 py-2 font-mono text-muted-foreground">
                      {row.timestamp ?? "—"}
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">{row.source ?? "—"}</td>
                    <td className="max-w-[14rem] px-3 py-2 text-foreground">{row.event ?? row.raw}</td>
                    <td className={cn("px-3 py-2 font-medium", logSeverityToneClass(severity.tone))}>
                      {severity.display}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : null}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Raw log</p>
        <ScrollPre>{item.content ?? ""}</ScrollPre>
      </div>
    </EvidencePanelShell>
  );
}

function EvidenceTextPanel({ item }: { item: EvidenceItem }) {
  return (
    <EvidencePanelShell icon={FileText} title={item.title} badge="text">
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">{item.content ?? "—"}</p>
    </EvidencePanelShell>
  );
}

function EvidenceFilePanel({ item }: { item: EvidenceItem }) {
  const downloadHref = safePracticeDownloadHref(item.fileUrl);
  const fileName = item.fileName ?? item.title;
  const mime = item.metadata?.mimeType ?? item.metadata?.type ?? "—";
  const size = item.metadata?.size ?? "—";

  return (
    <EvidencePanelShell icon={FileText} title={item.title} badge="file">
      <dl className="space-y-3">
        <MetaRow label="Filename">{fileName}</MetaRow>
        <MetaRow label="Size">{size}</MetaRow>
        <MetaRow label="Type">{mime}</MetaRow>
      </dl>
      {downloadHref ? (
        <Button asChild variant="outline" size="sm" className="gap-2">
          <a href={downloadHref} download>
            <Download className="size-4" aria-hidden />
            Скачать файл
          </a>
        </Button>
      ) : (
        <p className="text-xs text-muted-foreground">Просмотр файла недоступен — нет безопасной ссылки загрузки.</p>
      )}
    </EvidencePanelShell>
  );
}

function EvidenceCodePanel({ item }: { item: EvidenceItem }) {
  const algorithm = item.metadata?.algorithm;
  return (
    <EvidencePanelShell icon={Terminal} title={item.title} badge="code">
      {algorithm ? (
        <p className="font-mono text-[10px] uppercase tracking-wide text-primary">{algorithm}</p>
      ) : null}
      <ScrollPre className="break-all">{item.content ?? ""}</ScrollPre>
      {item.content ? <EvidenceCopyButton value={item.content} label="Копировать содержимое" /> : null}
    </EvidencePanelShell>
  );
}

function EvidenceTablePanel({ item }: { item: EvidenceItem }) {
  const headers = item.tableHeaders ?? ["Колонка 1", "Колонка 2"];
  const rows: EvidenceTableRow[] = item.tableRows ?? [];

  return (
    <EvidencePanelShell icon={Table2} title={item.title} badge="table">
      <div className="ce-scroll-x-contained overflow-x-auto rounded-lg border border-border/80">
        <table className="w-full min-w-[16rem] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th scope="col" className="px-3 py-2.5 font-semibold text-foreground">
                {headers[0]}
              </th>
              <th scope="col" className="px-3 py-2.5 font-semibold text-foreground">
                {headers[1]}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={`${row.feature}-${i}`} className="border-b border-border/50 last:border-0 even:bg-muted/10">
                <td className="px-3 py-2.5 align-top font-medium text-foreground">{row.feature}</td>
                <td className="px-3 py-2.5 align-top text-muted-foreground">{row.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </EvidencePanelShell>
  );
}

function EvidenceImagePanel({ item }: { item: EvidenceItem }) {
  const downloadHref = safePracticeDownloadHref(item.fileUrl);
  const fileName = item.fileName ?? item.title;
  return (
    <EvidencePanelShell icon={FileText} title={item.title} badge="image">
      <p className="text-xs text-muted-foreground">
        Превью отключено в учебных целях. При необходимости скачайте файл через защищённый маршрут.
      </p>
      <dl className="space-y-3">
        <MetaRow label="Filename">{fileName}</MetaRow>
        <MetaRow label="Type">{item.metadata?.mimeType ?? "image/*"}</MetaRow>
      </dl>
      {downloadHref ? (
        <Button asChild variant="outline" size="sm" className="gap-2">
          <a href={downloadHref} download>
            <Download className="size-4" aria-hidden />
            Скачать
          </a>
        </Button>
      ) : null}
    </EvidencePanelShell>
  );
}

function EvidenceItemView({ item }: { item: EvidenceItem }) {
  switch (item.type) {
    case "email":
      return <EvidenceEmailPanel item={item} />;
    case "url":
      return <EvidenceUrlPanel item={item} />;
    case "log":
      return <EvidenceLogPanel item={item} />;
    case "text":
      return <EvidenceTextPanel item={item} />;
    case "file":
      return <EvidenceFilePanel item={item} />;
    case "code":
      return <EvidenceCodePanel item={item} />;
    case "table":
      return <EvidenceTablePanel item={item} />;
    case "image":
      return <EvidenceImagePanel item={item} />;
    default:
      return null;
  }
}

export type EvidencePanelProps = {
  items: EvidenceItem[];
  className?: string;
};

/**
 * Панель исходных данных лаборатории (ЭТАП 6).
 * Без кликабельных подозрительных URL, без storage paths, без raw HTML.
 */
export function EvidencePanel({ items, className }: EvidencePanelProps) {
  if (items.length === 0) return null;

  return (
    <div className={cn("ce-evidence-panel min-w-0 max-w-full space-y-4", className)} role="region" aria-label="Исходные данные">
      {items.map((item) => (
        <EvidenceItemView key={item.id} item={item} />
      ))}
    </div>
  );
}

export { evidenceItemLabel };
