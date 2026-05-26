"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

/**
 * Только local dev: демо-учётки из prisma/seed (не показывать в production).
 */
export function AuthDevCredentialsHint() {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  if (process.env.NODE_ENV === "production") return null;

  async function resetDemo() {
    setStatus("loading");
    try {
      const res = await fetch("/api/dev/reset-demo-passwords", { method: "POST" });
      if (!res.ok) throw new Error("reset failed");
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="rounded-xl border border-primary/25 bg-primary/8 px-4 py-3 text-sm text-foreground">
      <p className="font-semibold text-primary">Демо-доступ (локальная разработка)</p>
      <ul className="mt-2 space-y-1.5 font-mono text-xs text-muted-foreground">
        <li>
          <span className="text-foreground">Админ:</span> admin@cyberedu.local / Admin12345!
        </li>
        <li>
          <span className="text-foreground">Студент:</span> student@cyberedu.local / Student12345!
        </li>
      </ul>
      <p className="mt-2 text-xs text-muted-foreground">
        Вход по <strong className="text-foreground">email</strong>, не по логину. URL в адресной строке с паролем не
        входит автоматически — нажмите <strong className="text-foreground">Войти</strong>. С телефона в Wi‑Fi:{" "}
        <strong className="text-foreground">http://192.168.0.4:3100</strong> (тот же хост, что в браузере).
      </p>
      <Button type="button" variant="outline" size="sm" className="mt-3" loading={status === "loading"} onClick={resetDemo}>
        Сбросить демо-пароли и блокировку
      </Button>
      {status === "done" ? (
        <p className="mt-2 text-xs text-success">Готово — войдите с паролями выше.</p>
      ) : null}
      {status === "error" ? (
        <p className="mt-2 text-xs text-danger">Не удалось сбросить. Проверьте, что dev-сервер запущен.</p>
      ) : null}
    </div>
  );
}
