"use client";

import { useMemo } from "react";
import { Check, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

const rules = [
  { id: "len", label: "Не менее 8 символов", test: (p: string) => p.length >= 8 },
  { id: "letter", label: "Есть буква", test: (p: string) => /[a-zA-Zа-яА-Я]/.test(p) },
  { id: "digit", label: "Есть цифра", test: (p: string) => /\d/.test(p) },
] as const;

export function PasswordRequirements({ password }: { password: string }) {
  const results = useMemo(() => rules.map((r) => ({ ...r, ok: r.test(password) })), [password]);

  if (!password) return null;

  return (
    <ul className="space-y-1.5 rounded-xl border border-border/80 bg-muted/25 px-3 py-2.5" aria-label="Требования к паролю">
      {results.map((r) => (
        <li key={r.id} className="flex items-center gap-2 text-xs">
          {r.ok ? (
            <Check className="size-3.5 shrink-0 text-success" aria-hidden />
          ) : (
            <Circle className="size-3.5 shrink-0 text-muted-foreground/60" aria-hidden />
          )}
          <span className={cn(r.ok ? "text-foreground" : "text-muted-foreground")}>{r.label}</span>
        </li>
      ))}
    </ul>
  );
}
