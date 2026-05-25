"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search, ShieldCheck } from "lucide-react";
import {
  certificateVerifyPath,
  parseCertificateVerifyLookupInput,
} from "@/lib/certificate-verify-url";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SectionCard } from "@/components/ui/section-card";

export function CertificateVerifyLookupForm() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = parseCertificateVerifyLookupInput(value);
    if (!parsed) {
      setError(
        "Введите номер сертификата (CE-ГОД-…) из PDF/QR или вставьте ссылку вида …/verify/CE-…",
      );
      return;
    }
    setError(null);
    if (parsed.kind === "certificateNumber") {
      router.push(certificateVerifyPath(parsed.value));
      return;
    }
    router.push(`/certificate/verify/${encodeURIComponent(parsed.value)}`);
  }

  return (
    <SectionCard
      variant="lab"
      className="w-full min-w-0 max-w-lg"
      title="Проверка подлинности"
      description="Введите номер из QR на сертификате или вставьте публичную ссылку verify. Без email и внутренних токенов."
    >
      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <label className="block text-sm font-medium text-foreground" htmlFor="verify-code-input">
          Номер или ссылка
        </label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            id="verify-code-input"
            name="code"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              if (error) setError(null);
            }}
            placeholder="CE-2026-ABCD1234 или https://…/verify/CE-…"
            className="font-mono text-sm"
            autoComplete="off"
            spellCheck={false}
          />
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="min-h-12 w-full gap-2 touch-manipulation sm:min-h-11 sm:w-auto sm:shrink-0"
          >
            <Search className="size-4" aria-hidden />
            Проверить
          </Button>
        </div>
        {error ? (
          <p className="text-sm text-danger" role="alert">
            {error}
          </p>
        ) : null}
        <p className="flex items-start gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-success" aria-hidden />
          Результат: программа, дата выдачи и номер в реестре — без email и ФИО.
        </p>
      </form>
    </SectionCard>
  );
}
