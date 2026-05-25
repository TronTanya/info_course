"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  postCertificateIssue,
  type CertificateIssueSuccessPayload,
} from "@/lib/certificate-issue-client";
import { useToast } from "@/components/ui/toast";

export type CertificateIssuePhase = "idle" | "submitting" | "success" | "error";

export function useCertificateIssue({
  courseId,
  canIssue,
}: {
  courseId: string;
  /** Только отображение: флаг с сервера (canGenerate), не локальный прогресс. */
  canIssue: boolean;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const inFlightRef = useRef(false);
  const [phase, setPhase] = useState<CertificateIssuePhase>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successPayload, setSuccessPayload] = useState<CertificateIssueSuccessPayload | null>(null);

  const issue = useCallback(async () => {
    if (!canIssue || inFlightRef.current) return;

    inFlightRef.current = true;
    setErrorMessage(null);
    setSuccessPayload(null);
    setPhase("submitting");

    try {
      const result = await postCertificateIssue(courseId);

      if (result.type === "created") {
        setSuccessPayload(result.payload);
        setPhase("success");
        toast({
          title: "Сертификат выдан",
          description: `Документ № ${result.payload.certificateNumber} зарегистрирован в реестре.`,
          variant: "success",
        });
        router.refresh();
        return;
      }

      if (result.type === "already_issued") {
        setPhase("idle");
        toast({
          title: "Сертификат уже есть",
          description: "Открываем ваш документ — повторная выдача не требуется.",
          variant: "success",
        });
        router.refresh();
        return;
      }

      setErrorMessage(result.message);
      setPhase("error");
      toast({ title: "Ошибка", description: result.message, variant: "error" });
    } finally {
      inFlightRef.current = false;
    }
  }, [canIssue, courseId, router, toast]);

  const resetError = useCallback(() => {
    setErrorMessage(null);
    if (phase === "error") setPhase("idle");
  }, [phase]);

  return {
    phase,
    loading: phase === "submitting",
    errorMessage,
    successPayload,
    issue,
    resetError,
  };
}
