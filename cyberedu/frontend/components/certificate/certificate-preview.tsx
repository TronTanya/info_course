import Link from "next/link";
import { Award, ExternalLink, QrCode, ShieldCheck } from "lucide-react";
import { CertificatePreviewVerifyActions } from "@/components/certificate/certificate-preview-verify-actions";
import { BrandLogoMark } from "@/components/brand/brand-logo";
import { Badge } from "@/components/ui/badge";
import type { CertificatePreviewModel } from "@/types/certificate-preview";
import { cn } from "@/lib/utils";

export type CertificatePreviewVariant = "dark" | "light";

export type CertificatePreviewProps = {
  model: CertificatePreviewModel;
  /** dark — в кабинете; light — печатный/светлый вариант */
  variant?: CertificatePreviewVariant;
  className?: string;
};

function statusBadge(model: CertificatePreviewModel) {
  if (model.status === "revoked") {
    return (
      <Badge variant="danger" className="gap-1">
        <ShieldCheck className="size-3" aria-hidden />
        Отозван
      </Badge>
    );
  }
  if (model.mode === "issued" && model.status === "valid") {
    return (
      <Badge variant="success" className="gap-1">
        <ShieldCheck className="size-3" aria-hidden />
        Действителен
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" className="gap-1 uppercase tracking-wide">
      Превью
    </Badge>
  );
}

function QrBlock({ model, variant }: { model: CertificatePreviewModel; variant: CertificatePreviewVariant }) {
  if (model.qrDataUrl) {
    return (
      <div
        className={cn(
          "flex flex-col items-center gap-1.5 rounded-xl border p-2.5",
          variant === "light" ? "border-slate-200 bg-white" : "border-border/70 bg-background/50",
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={model.qrDataUrl}
          alt="QR-код публичной проверки сертификата"
          width={72}
          height={72}
          className="rounded-md"
        />
        <span className="text-[9px] font-medium uppercase tracking-wider text-muted-foreground">Проверка</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed p-3",
        variant === "light"
          ? "border-slate-300/90 bg-slate-50 text-slate-500"
          : "border-primary/25 bg-primary/5 text-muted-foreground",
      )}
      aria-hidden={model.mode === "issued"}
    >
      <QrCode
        className={cn("size-12", variant === "light" ? "text-slate-400" : "text-primary/60")}
        strokeWidth={1.25}
      />
      <span className="text-center text-[9px] font-medium uppercase tracking-wider">QR</span>
    </div>
  );
}

function DecorativeSeal({ variant }: { variant: CertificatePreviewVariant }) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute bottom-6 right-5 flex size-[4.5rem] flex-col items-center justify-center rounded-full border-2 sm:size-20",
        variant === "light"
          ? "border-amber-600/35 bg-amber-50/90 text-amber-800/80 shadow-sm"
          : "border-primary/30 bg-primary/10 text-primary shadow-[0_0_28px_-6px_color-mix(in_oklab,var(--primary)_45%,transparent)]",
      )}
      aria-hidden
    >
      <Award className="size-7 sm:size-8" strokeWidth={1.35} />
      <span
        className={cn(
          "mt-0.5 max-w-[3.2rem] text-center font-mono text-[6px] font-bold uppercase leading-tight tracking-widest sm:text-[7px]",
          variant === "light" ? "text-amber-900/70" : "text-primary/80",
        )}
      >
        CyberEdu
      </span>
    </div>
  );
}

export function CertificatePreview({
  model,
  variant = "dark",
  className,
}: CertificatePreviewProps) {
  const isLight = variant === "light";
  const isPlaceholder = model.mode === "placeholder";

  return (
    <article
      className={cn(
        "ce-certificate-preview relative mx-auto w-full max-w-2xl overflow-hidden rounded-2xl",
        isLight
          ? "border border-slate-200/90 bg-[#faf9f6] text-slate-900 shadow-[0_8px_32px_-12px_rgba(15,23,42,0.12)]"
          : "border border-primary/20 bg-card text-foreground shadow-(--shadow-card)",
        className,
      )}
      aria-label={isPlaceholder ? "Превью сертификата до выдачи" : "Сертификат CyberEdu"}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 h-0.5",
          isLight
            ? "bg-linear-to-r from-amber-700/50 via-cyan-600/40 to-amber-700/50"
            : "bg-linear-to-r from-transparent via-primary/55 to-transparent",
        )}
        aria-hidden
      />
      {!isLight ? (
        <>
          <div
            className="pointer-events-none absolute -right-20 -top-16 size-48 rounded-full bg-primary/10 blur-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -bottom-16 -left-16 size-40 rounded-full bg-cyan/8 blur-3xl"
            aria-hidden
          />
        </>
      ) : null}

      <div
        className={cn(
          "pointer-events-none absolute inset-3 rounded-xl border sm:inset-4",
          isLight ? "border-slate-300/60" : "border-border/50",
        )}
        aria-hidden
      />

      <div className="relative px-5 py-6 sm:px-8 sm:py-8">
        <header
          className={cn(
            "flex flex-wrap items-start justify-between gap-4 border-b pb-5",
            isLight ? "border-slate-200/80" : "border-border/60",
          )}
        >
          <div className="min-w-0 flex-1">
            <p
              className={cn(
                "font-mono text-[10px] font-semibold uppercase tracking-[0.22em]",
                isLight ? "text-cyan-800/80" : "text-primary",
              )}
            >
              Сертификат CyberEdu
            </p>
            <p
              className={cn(
                "mt-2 font-display text-xl font-semibold tracking-tight sm:text-2xl",
                isLight ? "text-slate-900" : "text-foreground",
              )}
            >
              Подтверждает успешное завершение курса
            </p>
            <p className={cn("mt-1 text-xs sm:text-sm", isLight ? "text-slate-600" : "text-muted-foreground")}>
              Официальный документ CyberEdu Academy · реестр выдачи
            </p>
          </div>
          <BrandLogoMark
            className={cn("size-11 shrink-0 sm:size-12", isLight && "opacity-90")}
            size={48}
          />
        </header>

        <div className="relative mt-6 space-y-2 text-center sm:mt-8 sm:text-left">
          <p
            className={cn(
              "text-[10px] font-semibold uppercase tracking-[0.18em]",
              isLight ? "text-slate-500" : "text-muted-foreground",
            )}
          >
            Настоящим подтверждается, что
          </p>
          <p
            className={cn(
              "font-display text-2xl font-bold tracking-tight sm:text-[1.75rem]",
              isPlaceholder && !isLight && "text-foreground/85",
              isPlaceholder && isLight && "text-slate-600",
              !isPlaceholder && (isLight ? "text-slate-900" : "text-foreground"),
            )}
          >
            {model.studentName}
          </p>
          <p className={cn("pt-1 text-sm", isLight ? "text-slate-600" : "text-muted-foreground")}>
            успешно завершил(а) программу
          </p>
          <p
            className={cn(
              "pt-2 font-display text-lg font-semibold sm:text-xl",
              isLight ? "text-cyan-800" : "text-primary",
            )}
          >
            «{model.courseTitle}»
          </p>
          {model.courseHours != null && model.courseHours > 0 ? (
            <p className={cn("text-xs", isLight ? "text-slate-500" : "text-muted-foreground")}>
              Объём программы: {model.courseHours} академических часов
            </p>
          ) : null}
        </div>

        <dl
          className={cn(
            "mt-6 grid gap-4 rounded-xl border p-4 sm:grid-cols-2",
            isLight ? "border-slate-200/90 bg-white/80" : "border-border/60 bg-muted/10",
          )}
        >
          <div>
            <dt
              className={cn(
                "text-[10px] font-semibold uppercase tracking-wider",
                isLight ? "text-slate-500" : "text-muted-foreground",
              )}
            >
              Дата выдачи
            </dt>
            <dd
              className={cn(
                "mt-1 text-sm font-medium tabular-nums",
                isPlaceholder && "italic text-muted-foreground",
                !isPlaceholder && (isLight ? "text-slate-900" : "text-foreground"),
              )}
            >
              {model.issuedAtLabel}
            </dd>
          </div>
          <div>
            <dt
              className={cn(
                "text-[10px] font-semibold uppercase tracking-wider",
                isLight ? "text-slate-500" : "text-muted-foreground",
              )}
            >
              Certificate ID
            </dt>
            <dd
              className={cn(
                "mt-1 break-all font-mono text-xs font-semibold tracking-tight sm:text-sm",
                isPlaceholder && "italic text-muted-foreground",
                !isPlaceholder && (isLight ? "text-slate-900" : "text-foreground"),
              )}
            >
              {model.certificateIdLabel}
            </dd>
          </div>
        </dl>

        <footer
          className={cn(
            "mt-6 flex flex-col gap-4 border-t pt-5 sm:flex-row sm:items-end sm:justify-between",
            isLight ? "border-slate-200/80" : "border-border/60",
          )}
        >
          <QrBlock model={model} variant={variant} />

          <div className="min-w-0 flex-1 space-y-2 sm:text-right">
            <div className="flex flex-wrap items-center gap-2 sm:justify-end">{statusBadge(model)}</div>
            <p className={cn("text-[10px] uppercase tracking-wide", isLight ? "text-slate-500" : "text-muted-foreground")}>
              Публичная проверка
            </p>
            {model.verifyHref && model.mode === "issued" ? (
              <>
                <Link
                  href={model.verifyHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "inline-flex max-w-full items-center gap-1 font-mono text-[11px] font-medium underline-offset-4 transition-colors sm:justify-end",
                    isLight
                      ? "text-cyan-800 hover:text-cyan-950"
                      : "text-primary hover:text-cyan focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  )}
                >
                  <span className="truncate">{model.verifyUrlDisplay ?? model.verifyHref}</span>
                  <ExternalLink className="size-3 shrink-0 opacity-80" aria-hidden />
                </Link>
                <CertificatePreviewVerifyActions verifyUrl={model.verifyHref} />
              </>
            ) : (
              <p
                className={cn(
                  "font-mono text-[11px] sm:text-right",
                  isPlaceholder ? "italic text-muted-foreground" : "text-muted-foreground",
                )}
              >
                {model.verifyUrlDisplay ?? "—"}
              </p>
            )}
            <p
              className={cn(
                "hidden text-[10px] sm:block",
                isLight ? "text-slate-400" : "text-subtle-foreground",
              )}
            >
              Подпись платформы · CyberEdu Academy
            </p>
          </div>
        </footer>

        {isPlaceholder ? (
          <p
            className={cn(
              "mt-5 text-center text-[10px] uppercase tracking-[0.18em]",
              isLight ? "text-slate-400" : "text-subtle-foreground",
            )}
          >
            Данные появятся после выдачи на сервере
          </p>
        ) : null}

        <DecorativeSeal variant={variant} />
      </div>
    </article>
  );
}
