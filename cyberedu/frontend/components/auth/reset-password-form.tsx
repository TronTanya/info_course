"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { AuthFormFooter } from "@/components/auth/auth-form-footer";
import { AuthGlassCard } from "@/components/auth/auth-glass-card";
import { PasswordInput } from "@/components/auth/password-input";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import type { ResetPasswordState } from "@/lib/actions/password-reset";
import { resetPasswordAction } from "@/lib/actions/password-reset";
import { resetPasswordSchema } from "@/lib/validation";

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [pending, setPending] = useState(false);
  const [state, setState] = useState<ResetPasswordState>({});
  const [success, setSuccess] = useState(false);

  const tokenMissing = token.trim().length === 0;

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const password = String(fd.get("password") ?? "");
    const confirmPassword = String(fd.get("confirmPassword") ?? "");

    const parsed = resetPasswordSchema.safeParse({ token, password, confirmPassword });
    if (!parsed.success) {
      const flat = parsed.error.flatten();
      setState({
        errors: {
          password: flat.fieldErrors.password,
          confirmPassword: flat.fieldErrors.confirmPassword,
          _form: flat.formErrors.length ? flat.formErrors : undefined,
        },
      });
      return;
    }

    setPending(true);
    setState({});
    try {
      const submitFd = new FormData();
      submitFd.set("token", parsed.data.token);
      submitFd.set("password", parsed.data.password);
      submitFd.set("confirmPassword", parsed.data.confirmPassword);
      const result = await resetPasswordAction({}, submitFd);
      if (result.ok) {
        setSuccess(true);
        return;
      }
      setState(result);
    } finally {
      setPending(false);
    }
  }

  if (success) {
    return (
      <AuthGlassCard
        title="Пароль обновлён"
        description="Теперь можно войти с новым паролем."
        footer={
          <AuthFormFooter>
            <Link className="font-semibold text-primary underline-offset-4 hover:underline" href="/auth/login">
              Перейти ко входу
            </Link>
          </AuthFormFooter>
        }
      >
        <div className="flex flex-col items-center gap-4 py-2 text-center" role="status">
          <span className="flex size-14 items-center justify-center rounded-2xl border border-success/35 bg-success/12 text-success">
            <CheckCircle2 className="size-8" aria-hidden />
          </span>
          <FormMessage variant="success">Сессия готова — используйте новый пароль для входа.</FormMessage>
        </div>
      </AuthGlassCard>
    );
  }

  if (tokenMissing) {
    return (
      <AuthGlassCard
        title="Ссылка недействительна"
        description="Запросите сброс пароля ещё раз или обратитесь к администратору курса."
        footer={
          <AuthFormFooter>
            <Link className="font-semibold text-primary underline-offset-4 hover:underline" href="/auth/forgot-password">
              Запросить новую ссылку
            </Link>
          </AuthFormFooter>
        }
      >
        <FormMessage>Ссылка для сброса отсутствует или устарела.</FormMessage>
      </AuthGlassCard>
    );
  }

  return (
    <AuthGlassCard
      title="Новый пароль"
      description="Придумайте надёжный пароль для защищённой сессии."
      footer={
        <AuthFormFooter>
          <Link className="font-semibold text-primary underline-offset-4 hover:underline" href="/auth/login">
            Вернуться ко входу
          </Link>
        </AuthFormFooter>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        {state.errors?._form ? <FormMessage>{state.errors._form[0]}</FormMessage> : null}
        <input type="hidden" name="token" value={token} />
        <PasswordInput
          autoComplete="new-password"
          label="Новый пароль"
          name="password"
          hint="Минимум 8 символов, буквы и цифры"
          required
          error={state.errors?.password?.[0]}
          disabled={pending}
        />
        <PasswordInput
          autoComplete="new-password"
          label="Подтверждение пароля"
          name="confirmPassword"
          required
          error={state.errors?.confirmPassword?.[0]}
          disabled={pending}
        />
        <Button className="w-full" size="lg" type="submit" loading={pending} disabled={pending}>
          Сохранить пароль
        </Button>
      </form>
    </AuthGlassCard>
  );
}
