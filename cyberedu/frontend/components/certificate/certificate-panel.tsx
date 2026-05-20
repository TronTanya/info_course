"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { CertificateDashboardState } from "@/lib/certificate";
import { CertificateActions } from "@/components/certificate/certificate-actions";
import { CertificatePreviewCard } from "@/components/certificate/certificate-preview-card";
import { useToast } from "@/components/ui/toast";

export type CertificatePanelProps = {
  state: CertificateDashboardState;
  generateButtonText?: string;
};

export function CertificatePanel({ state, generateButtonText = "Получить сертификат" }: CertificatePanelProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cert = state.certificate;
  const downloadHref = cert ? `/api/certificates/download/${cert.id}` : null;

  async function handleGenerate() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/certificates/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: state.courseId }),
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

  return (
    <div className="space-y-6">
      <CertificatePreviewCard state={state} />

      {error ? (
        <p className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}

      {!state.courseCompleted && !cert ? (
        <p className="text-sm text-muted-foreground">
          Выполните все требования выше — после этого откроется генерация официального PDF с QR-кодом проверки.
        </p>
      ) : null}

      <CertificateActions
        courseId={state.courseId}
        verifyUrl={cert?.verifyUrl ?? null}
        downloadHref={downloadHref}
        showGenerate={!cert}
        courseCompleted={state.canGenerate}
        loading={loading}
        onGenerate={() => void handleGenerate()}
      />

      {!cert && state.courseCompleted ? (
        <p className="text-xs text-muted-foreground">
          {generateButtonText}: номер реестра, дата и публичная ссылка проверки появятся после генерации.
        </p>
      ) : null}
    </div>
  );
}
