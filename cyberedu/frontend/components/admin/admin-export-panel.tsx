"use client";

import { useCallback, useState } from "react";
import { Download, FileSpreadsheet } from "lucide-react";
import {
  ADMIN_EXPORT_ANCHOR,
  ADMIN_EXPORT_TYPE_HINTS,
  ADMIN_EXPORT_TYPE_LABELS,
  ADMIN_EXPORT_TYPES,
  adminExportDownloadUrl,
  type AdminExportType,
} from "@/lib/admin-export-types";
import {
  adminExportFallbackFilename,
  adminExportTypeChangeReset,
  formatAdminExportAt,
  filenameFromContentDisposition,
  parseAdminExportError,
  parseExportRowCount,
  type AdminExportPhase,
} from "@/lib/admin-export-panel-logic";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/ui/section-card";
import { UiStatePanel } from "@/components/ui/ui-state-panel";
import { focusRing } from "@/lib/design-system/primitives";
import { cn } from "@/lib/utils";

/**
 * Панель CSV-экспорта для админки. Данные только через `/api/admin/export` (ADMIN + rate limit + audit).
 */
export function AdminExportPanel({ className }: { className?: string }) {
  const [exportType, setExportType] = useState<AdminExportType>("students");
  const [phase, setPhase] = useState<AdminExportPhase>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastExportAt, setLastExportAt] = useState<string | null>(null);
  const [lastRowCount, setLastRowCount] = useState<number | null>(null);
  const [lastFilename, setLastFilename] = useState<string | null>(null);

  const runExport = useCallback(async () => {
    setPhase("loading");
    setErrorMessage(null);
    const url = adminExportDownloadUrl(exportType);
    const fallbackName = adminExportFallbackFilename(exportType);

    try {
      const res = await fetch(url, { method: "GET", credentials: "include" });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        setErrorMessage(parseAdminExportError(res.status, text));
        setPhase("error");
        return;
      }

      const blob = await res.blob();
      const filename = filenameFromContentDisposition(
        res.headers.get("Content-Disposition"),
        fallbackName,
      );
      setLastRowCount(parseExportRowCount(res.headers.get("X-Export-Row-Count")));
      setLastFilename(filename);

      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = filename;
      a.rel = "noopener";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objectUrl);

      const serverAt = res.headers.get("X-Export-At");
      setLastExportAt(serverAt ?? new Date().toISOString());
      setPhase("success");
    } catch {
      setErrorMessage("Сетевая ошибка. Проверьте подключение и повторите.");
      setPhase("error");
    }
  }, [exportType]);

  const isLoading = phase === "loading";
  const typeHint = ADMIN_EXPORT_TYPE_HINTS[exportType];

  return (
    <SectionCard
      variant="default"
      flushTitle
      className={cn("p-4 sm:p-6", className)}
      id={ADMIN_EXPORT_ANCHOR.replace("#", "")}
    >
      <div className="flex items-center gap-2">
        <FileSpreadsheet className="size-5 text-muted-foreground" aria-hidden />
        <h2 className="font-display text-base font-semibold text-foreground">Экспорт CSV</h2>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Выгрузка для Excel (UTF-8, «;»). Только администраторы. Действие пишется в журнал безопасности.
      </p>

      <div className="mt-4 space-y-4">
        <fieldset disabled={isLoading} className="min-w-0 space-y-2 max-w-full">
          <legend className="text-sm font-medium text-foreground">Тип отчёта</legend>
          <div
            className="flex min-w-0 flex-wrap gap-2"
            role="radiogroup"
            aria-label="Тип CSV-отчёта"
          >
            {ADMIN_EXPORT_TYPES.map((t) => {
              const active = exportType === t;
              return (
                <button
                  key={t}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => {
                    setExportType(t);
                    const reset = adminExportTypeChangeReset();
                    setPhase(reset.phase);
                    setErrorMessage(reset.errorMessage);
                  }}
                  className={cn(
                    "min-h-11 max-w-full rounded-xl px-3 py-2 text-xs font-semibold transition-colors sm:px-3.5 sm:text-sm",
                    active
                      ? "bg-primary text-primary-foreground shadow-sm ring-1 ring-primary/30"
                      : "border border-border/80 bg-card/80 text-foreground hover:border-primary/30 hover:bg-primary/5",
                    focusRing,
                  )}
                >
                  {ADMIN_EXPORT_TYPE_LABELS[t]}
                </button>
              );
            })}
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">{typeHint}</p>
        </fieldset>

        <dl className="grid gap-2 rounded-xl border border-border/70 bg-muted/10 px-3 py-2.5 text-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <dt className="text-muted-foreground">Дата экспорта</dt>
            <dd className="font-medium tabular-nums text-foreground">
              {lastExportAt ? formatAdminExportAt(lastExportAt) : "—"}
            </dd>
          </div>
          {lastFilename ? (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <dt className="text-muted-foreground">Файл</dt>
              <dd className="max-w-[14rem] truncate font-mono text-xs text-foreground" title={lastFilename}>
                {lastFilename}
              </dd>
            </div>
          ) : null}
          {lastRowCount != null ? (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <dt className="text-muted-foreground">Строк в файле</dt>
              <dd className="font-medium tabular-nums text-foreground">{lastRowCount}</dd>
            </div>
          ) : null}
        </dl>

        <div aria-live="polite" className="min-h-0 space-y-3">
          {phase === "error" && errorMessage ? (
            <UiStatePanel
              state="error"
              title="Экспорт не выполнен"
              description={errorMessage}
              action={
                <Button type="button" variant="outline" size="sm" onClick={() => void runExport()}>
                  Повторить
                </Button>
              }
            />
          ) : null}

          {phase === "success" ? (
            <UiStatePanel
              state="success"
              title="Файл скачан"
              description="Проверьте папку загрузок. Повторный экспорт учитывается в rate limit и audit log."
              compact
            />
          ) : null}

          {isLoading ? (
            <UiStatePanel state="loading" label="Формируем CSV…" />
          ) : (
            <Button
              type="button"
              variant="primary"
              className="w-full min-h-11"
              onClick={() => void runExport()}
            >
              <Download className="size-4" aria-hidden />
              Скачать {ADMIN_EXPORT_TYPE_LABELS[exportType]}
            </Button>
          )}
        </div>
      </div>
    </SectionCard>
  );
}
