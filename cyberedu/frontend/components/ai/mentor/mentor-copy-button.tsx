"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function MentorCopyButton({
  text,
  label = "Копировать ответ",
  className,
}: {
  text: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className={cn("h-7 gap-1 px-2 text-[10px] text-muted-foreground", className)}
      onClick={() => void copy()}
      aria-label={copied ? "Скопировано" : label}
    >
      {copied ? (
        <Check className="size-3 text-success" aria-hidden />
      ) : (
        <Copy className="size-3" aria-hidden />
      )}
      {copied ? "Скопировано" : "Копировать"}
    </Button>
  );
}
