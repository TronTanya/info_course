"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { formatRuDateLongUtc } from "@/lib/datetime-stable";

export type CertificatePanelProps = {
  courseId: string;
  courseCompleted: boolean;
  certificate: null | {
    id: string;
    certificateNumber: string;
    issuedAt: string;
    verifyUrl: string;
  };
  /** Подписи кнопок (например, на странице профиля). */
  generateButtonText?: string;
  downloadButtonText?: string;
};

export function CertificatePanel({
  courseId,
  courseCompleted,
  certificate,
  generateButtonText = "Сгенерировать сертификат",
  downloadButtonText = "Скачать PDF",
}: CertificatePanelProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/certificates/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        const msg = data.error ?? "Не удалось создать сертификат.";
        setError(msg);
        toast({ title: "Ошибка", description: msg, variant: "error" });
        return;
      }
      toast({ title: "Сертификат готов", description: "Документ создан и доступен для скачивания.", variant: "success" });
      router.refresh();
    } catch {
      setError("Сетевая ошибка. Попробуйте позже.");
    } finally {
      setLoading(false);
    }
  }

  if (certificate) {
    const issued = formatRuDateLongUtc(certificate.issuedAt);

    return (
      <div className="ce-cert-card relative overflow-hidden p-6 ring-1 ring-inset ring-white/10 dark:ring-white/5">
        <div className="pointer-events-none absolute -right-16 top-0 h-40 w-40 rounded-full bg-accent/12 blur-3xl" aria-hidden />
        <div className="relative space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-success/30 bg-success/10 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-success">
              Выдан
            </span>
            <span className="text-xs text-muted-foreground">Электронный документ</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Номер сертификата</p>
              <p className="font-mono text-lg font-semibold tracking-tight text-foreground sm:text-xl">
                {certificate.certificateNumber}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Дата выдачи</p>
              <p className="text-base font-medium text-foreground">{issued}</p>
            </div>
          </div>
          <div className="flex flex-col gap-3 border-t border-border/50 pt-4 sm:flex-row sm:flex-wrap">
            <Button variant="primary" size="md" className="min-h-11 w-full shadow-sm sm:w-auto" asChild>
              <a href={`/api/certificates/download/${certificate.id}`}>{downloadButtonText}</a>
            </Button>
            <Button variant="outline" size="md" className="min-h-11 w-full border-primary/25 bg-card/80 hover:border-primary/40 sm:w-auto" asChild>
              <a href={certificate.verifyUrl} target="_blank" rel="noopener noreferrer">
                Проверка подлинности
              </a>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ce-glass space-y-4 rounded-2xl border border-dashed border-border/80 p-5 sm:p-6">
      {error ? (
        <p className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>
      ) : null}
      {!courseCompleted ? (
        <p className="text-sm font-medium leading-relaxed text-foreground">
          Сертификат станет доступен после завершения всех модулей.
        </p>
      ) : null}
      <Button
        type="button"
        variant="primary"
        size="md"
        className="min-h-11 w-full max-w-md shadow-sm sm:max-w-none"
        disabled={!courseCompleted || loading}
        title={!courseCompleted ? "Сначала завершите все модули курса" : undefined}
        onClick={handleGenerate}
      >
        {loading ? "Генерация…" : generateButtonText}
      </Button>
      {courseCompleted ? (
        <p className="text-xs leading-relaxed text-muted-foreground">
          После генерации появится номер, дата выдачи и ссылки на PDF и проверку подлинности.
        </p>
      ) : null}
    </div>
  );
}
