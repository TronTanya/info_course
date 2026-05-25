"use server";

import { headers } from "next/headers";
import { enforceRateLimit, RATE_LIMIT_POLICIES } from "@/lib/security/rate-limit";
import { clientIpFromHeaders } from "@/lib/security/request-ip";
import { SECURITY_ACTIONS } from "@/lib/security/audit-actions";
import { logSecurityEvent } from "@/lib/security/audit";
import { forgotPasswordSchema, resetPasswordSchema } from "@/lib/validation";

export type ForgotPasswordState = {
  ok?: boolean;
  errors?: { email?: string[]; _form?: string[] };
};

export type ResetPasswordState = {
  ok?: boolean;
  errors?: {
    password?: string[];
    confirmPassword?: string[];
    _form?: string[];
  };
};

/** Запрос ссылки на сброс: всегда успех с точки зрения UI (без раскрытия наличия email). */
export async function requestPasswordResetAction(
  _prev: ForgotPasswordState,
  formData: FormData,
): Promise<ForgotPasswordState> {
  const h = await headers();
  const ip = clientIpFromHeaders(h);
  const policy = RATE_LIMIT_POLICIES.registerIp;
  const rl = await enforceRateLimit({
    scope: "password_reset_ip",
    clientIp: ip,
    max: policy.max,
    windowMs: policy.windowMs,
  });
  if (!rl.allowed) {
    return { errors: { _form: ["Слишком много запросов. Попробуйте позже."] } };
  }

  const parsed = forgotPasswordSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    const flat = parsed.error.flatten();
    return { errors: { email: flat.fieldErrors.email } };
  }

  logSecurityEvent({
    action: SECURITY_ACTIONS.AUTH_PASSWORD_RESET_REQUEST,
    ip,
    path: "/auth/forgot-password",
    severity: "info",
    metadata: { stage: "requested" },
  });
  return { ok: true };
}

/**
 * Сброс пароля по токену. Пока нет почтового провайдера — возвращаем понятное сообщение.
 * UI и валидация готовы к подключению токенов из БД.
 */
export async function resetPasswordAction(
  _prev: ResetPasswordState,
  formData: FormData,
): Promise<ResetPasswordState> {
  const parsed = resetPasswordSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    const flat = parsed.error.flatten();
    return {
      errors: {
        password: flat.fieldErrors.password,
        confirmPassword: flat.fieldErrors.confirmPassword,
        _form: flat.formErrors.length ? flat.formErrors : undefined,
      },
    };
  }

  logSecurityEvent({
    action: "auth.password_reset.attempt",
    metadata: { stage: "token_submit", prefixLen: 8 },
  });
  return {
    errors: {
      _form: [
        "Сброс пароля по ссылке скоро будет доступен. Если вы забыли пароль — напишите преподавателю или администратору курса.",
      ],
    },
  };
}
