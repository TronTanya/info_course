"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { AuthFormFooter } from "@/components/auth/auth-form-footer";
import { AuthGlassCard } from "@/components/auth/auth-glass-card";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { Input } from "@/components/ui/input";
import type { ForgotPasswordState } from "@/lib/actions/password-reset";
import { requestPasswordResetAction } from "@/lib/actions/password-reset";

export function ForgotPasswordForm() {
  const [pending, setPending] = useState(false);
  const [state, setState] = useState<ForgotPasswordState>({});

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setPending(true);
    setState({});
    try {
      const result = await requestPasswordResetAction({}, fd);
      setState(result);
    } finally {
      setPending(false);
    }
  }

  if (state.ok) {
    return (
      <AuthGlassCard
        title="Проверьте почту"
        description="Если аккаунт зарегистрирован на указанный адрес, вы получите письмо с инструкциями."
        footer={
          <AuthFormFooter>
            <Link className="font-semibold text-primary underline-offset-4 hover:underline" href="/auth/login">
              Вернуться ко входу
            </Link>
          </AuthFormFooter>
        }
      >
        <div className="flex flex-col items-center gap-4 py-2 text-center" role="status">
          <span className="flex size-14 items-center justify-center rounded-2xl border border-success/35 bg-success/12 text-success">
            <CheckCircle2 className="size-8" aria-hidden />
          </span>
          <FormMessage variant="success">
            Запрос принят. Ссылка для сброса пароля действует ограниченное время.
          </FormMessage>
        </div>
      </AuthGlassCard>
    );
  }

  return (
    <AuthGlassCard
      title="Сброс пароля"
      description="Укажите email — отправим ссылку для создания нового пароля."
      footer={
        <AuthFormFooter>
          Вспомнили пароль?{" "}
          <Link className="font-semibold text-primary underline-offset-4 hover:underline" href="/auth/login">
            Войти
          </Link>
        </AuthFormFooter>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        {state.errors?._form ? <FormMessage>{state.errors._form[0]}</FormMessage> : null}
        <Input
          autoComplete="email"
          label="Email"
          name="email"
          type="email"
          placeholder="name@example.ru"
          required
          error={state.errors?.email?.[0]}
          disabled={pending}
        />
        <Button className="w-full" size="lg" type="submit" loading={pending} disabled={pending}>
          Отправить ссылку
        </Button>
      </form>
    </AuthGlassCard>
  );
}
