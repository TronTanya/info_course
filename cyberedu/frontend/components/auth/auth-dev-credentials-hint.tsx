"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { safeCallbackUrl } from "@/lib/auth/safe-callback-url";

const DEMO_ACCOUNTS = {
  student: {
    email: "student@cyberedu.local",
    password: "Student12345!",
    label: "Войти как студент",
  },
  admin: {
    email: "admin@cyberedu.local",
    password: "Admin12345!",
    label: "Войти как админ",
  },
} as const;

/**
 * Только local dev: демо-учётки из prisma/seed (не показывать в production).
 */
export function AuthDevCredentialsHint() {
  const searchParams = useSearchParams();
  const [resetStatus, setResetStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [loginStatus, setLoginStatus] = useState<"idle" | "loading" | "error">("idle");

  if (process.env.NODE_ENV === "production") return null;

  async function resetDemo() {
    setResetStatus("loading");
    try {
      const res = await fetch("/api/dev/reset-demo-passwords", { method: "POST" });
      if (!res.ok) throw new Error("reset failed");
      setResetStatus("done");
    } catch {
      setResetStatus("error");
    }
  }

  async function demoLogin(role: keyof typeof DEMO_ACCOUNTS) {
    setLoginStatus("loading");
    const account = DEMO_ACCOUNTS[role];
    try {
      const res = await signIn("credentials", {
        email: account.email,
        password: account.password,
        redirect: false,
      });
      if (!res?.ok) {
        setLoginStatus("error");
        return;
      }
      const dest = role === "admin" ? "/admin" : safeCallbackUrl(searchParams.get("callbackUrl"));
      window.location.assign(dest);
    } catch {
      setLoginStatus("error");
    }
  }

  return (
    <div className="rounded-xl border border-primary/25 bg-primary/8 px-4 py-3 text-sm text-foreground">
      <p className="font-semibold text-primary">Демо-доступ (локальная разработка)</p>
      <p className="mt-2 text-xs text-muted-foreground">
        Свой email работает только после{" "}
        <strong className="text-foreground">регистрации</strong>. Для быстрого входа используйте демо-учётки:
      </p>
      <ul className="mt-2 space-y-1.5 font-mono text-xs text-muted-foreground">
        <li>
          <span className="text-foreground">Студент:</span> student@cyberedu.local / Student12345!
        </li>
        <li>
          <span className="text-foreground">Админ:</span> admin@cyberedu.local / Admin12345!
        </li>
      </ul>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <Button
          type="button"
          size="sm"
          className="sm:flex-1"
          loading={loginStatus === "loading"}
          onClick={() => demoLogin("student")}
        >
          {DEMO_ACCOUNTS.student.label}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="sm:flex-1"
          loading={loginStatus === "loading"}
          onClick={() => demoLogin("admin")}
        >
          {DEMO_ACCOUNTS.admin.label}
        </Button>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="mt-2"
        loading={resetStatus === "loading"}
        onClick={resetDemo}
      >
        Сбросить демо-пароли и блокировку
      </Button>
      {resetStatus === "done" ? (
        <p className="mt-2 text-xs text-success">Пароли сброшены — можно входить.</p>
      ) : null}
      {resetStatus === "error" || loginStatus === "error" ? (
        <p className="mt-2 text-xs text-danger">
          Не удалось войти. Нажмите «Сбросить демо-пароли» и попробуйте снова.
        </p>
      ) : null}
    </div>
  );
}
