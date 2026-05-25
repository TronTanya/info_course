"use client";

import { useCallback, useMemo, useState } from "react";
import {
  copyTextToClipboard,
  sanitizePublicVerifyShareUrl,
  sharePublicVerifyUrl,
} from "@/lib/certificate-share";
import { useToast } from "@/components/ui/toast";

export function useCertificateShare(verifyUrl: string, certificateNumber?: string) {
  const { toast } = useToast();
  const [copying, setCopying] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [copySucceeded, setCopySucceeded] = useState(false);

  const shareUrl = useMemo(() => sanitizePublicVerifyShareUrl(verifyUrl) ?? verifyUrl.trim(), [verifyUrl]);
  const canNativeShare = typeof navigator !== "undefined" && typeof navigator.share === "function";

  const copyVerifyLink = useCallback(async () => {
    if (!shareUrl) return;
    setCopying(true);
    try {
      const safe = sanitizePublicVerifyShareUrl(shareUrl);
      if (!safe) {
        toast({ title: "Недопустимая ссылка", description: "Используйте только публичный URL проверки.", variant: "error" });
        return;
      }
      await copyTextToClipboard(safe);
      setCopySucceeded(true);
      window.setTimeout(() => setCopySucceeded(false), 2000);
      toast({
        title: "Ссылка скопирована",
        description: "Публичная страница проверки — в буфере обмена.",
        variant: "success",
      });
    } catch {
      toast({ title: "Не удалось скопировать", variant: "error" });
    } finally {
      setCopying(false);
    }
  }, [shareUrl, toast]);

  const shareVerifyLink = useCallback(async () => {
    if (!shareUrl) return;
    setSharing(true);
    try {
      const outcome = await sharePublicVerifyUrl(shareUrl, { certificateNumber });
      if (outcome === "cancelled") return;
      if (outcome === "copied") {
        setCopySucceeded(true);
        window.setTimeout(() => setCopySucceeded(false), 2000);
        toast({
          title: "Ссылка скопирована",
          description: "Web Share недоступен — URL проверки скопирован в буфер.",
          variant: "success",
        });
        return;
      }
      toast({
        title: "Ссылка передана",
        description: "Открыто системное меню «Поделиться».",
        variant: "success",
      });
    } catch {
      toast({ title: "Не удалось поделиться", variant: "error" });
    } finally {
      setSharing(false);
    }
  }, [shareUrl, certificateNumber, toast]);

  return {
    shareUrl,
    canNativeShare,
    copying,
    sharing,
    copySucceeded,
    copyVerifyLink,
    shareVerifyLink,
  };
}
