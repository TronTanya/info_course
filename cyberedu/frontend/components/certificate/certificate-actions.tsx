"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Download, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export function CertificateActions({
  courseId,
  verifyUrl,
  downloadHref,
  showGenerate,
  courseCompleted,
  loading,
  onGenerate,
}: {
  courseId: string;
  verifyUrl: string | null;
  downloadHref: string | null;
  showGenerate: boolean;
  courseCompleted: boolean;
  loading?: boolean;
  onGenerate?: () => void;
}) {
  const { toast } = useToast();
  const [sharing, setSharing] = useState(false);

  async function handleShare() {
    if (!verifyUrl) return;
    setSharing(true);
    try {
      if (navigator.share) {
        await navigator.share({
          title: "CyberEdu — проверка сертификата",
          text: "Проверьте подлинность сертификата CyberEdu Academy",
          url: verifyUrl,
        });
        return;
      }
      await navigator.clipboard.writeText(verifyUrl);
      toast({ title: "Ссылка скопирована", description: "URL проверки в буфере обмена.", variant: "success" });
    } catch {
      toast({ title: "Не удалось поделиться", variant: "error" });
    } finally {
      setSharing(false);
    }
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
      {downloadHref ? (
        <Button variant="primary" size="lg" className="gap-2" asChild>
          <a href={downloadHref}>
            <Download className="size-4" aria-hidden />
            Скачать PDF
          </a>
        </Button>
      ) : null}

      {showGenerate ? (
        <Button
          type="button"
          variant="primary"
          size="lg"
          className="gap-2"
          disabled={!courseCompleted || loading}
          title={!courseCompleted ? "Сначала выполните все требования" : undefined}
          onClick={onGenerate}
        >
          {loading ? "Генерация…" : "Получить сертификат"}
        </Button>
      ) : null}

      {verifyUrl ? (
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="gap-2 border-primary/25"
          disabled={sharing}
          onClick={() => void handleShare()}
        >
          <Share2 className="size-4" aria-hidden />
          Поделиться ссылкой
        </Button>
      ) : null}

      <Button variant="ghost" size="lg" className="gap-2" asChild>
        <Link href={`/dashboard/course/${courseId}`}>
          <ArrowLeft className="size-4" aria-hidden />
          К курсу
        </Link>
      </Button>
    </div>
  );
}
