"use server";

import { randomBytes, createHash } from "node:crypto";
import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { appOrigin, getSmtpConfig, isProductionRuntime, sendAuthEmail } from "@/lib/auth/email-delivery";
import { enforceRateLimit, RATE_LIMIT_POLICIES } from "@/lib/security/rate-limit";
import { clientIpFromHeaders } from "@/lib/security/request-ip";
import { securityLog } from "@/lib/security-log";
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

const BCRYPT_COST = 12;
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

function resetIdentifier(userId: string): string {
  return `password_reset:${userId}`;
}

function hashResetToken(rawToken: string): string {
  return createHash("sha256").update(rawToken).digest("hex");
}

function parseResetIdentifier(identifier: string): string | null {
  if (!identifier.startsWith("password_reset:")) return null;
  const userId = identifier.slice("password_reset:".length).trim();
  return userId || null;
}

async function deliverResetEmail(email: string, resetUrl: string): Promise<boolean> {
  return sendAuthEmail({
    to: email,
    subject: "CyberEdu — сброс пароля",
    text:
      `Вы запросили сброс пароля.\n\n` +
      `Перейдите по ссылке: ${resetUrl}\n\n` +
      `Ссылка действует 60 минут. Если это были не вы — проигнорируйте письмо.`,
    html:
      `<p>Вы запросили сброс пароля.</p>` +
      `<p><a href="${resetUrl}">Установить новый пароль</a></p>` +
      `<p>Ссылка действует <strong>60 минут</strong>. Если это были не вы — проигнорируйте письмо.</p>`,
  });
}

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

  const normalizedEmail = parsed.data.email.trim().toLowerCase();
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true, email: true },
  });
  const smtpConfigured = getSmtpConfig() !== null;
  if (!smtpConfigured && isProductionRuntime()) {
    securityLog("auth.password_reset_unavailable", { reason: "smtp_not_configured" });
    return { errors: { _form: ["Сервис восстановления пароля временно недоступен. Попробуйте позже."] } };
  }
  if (user) {
    const rawToken = randomBytes(32).toString("hex");
    const hashedToken = hashResetToken(rawToken);
    const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);
    const identifier = resetIdentifier(user.id);

    await prisma.verificationToken.deleteMany({
      where: { identifier },
    });
    await prisma.verificationToken.create({
      data: {
        identifier,
        token: hashedToken,
        expires: expiresAt,
      },
    });

    const resetUrl = `${appOrigin()}/auth/reset-password?token=${rawToken}`;
    const delivered = await deliverResetEmail(user.email, resetUrl);
    if (!delivered) {
      // Dev/local fallback: no SMTP configured, keep flow testable without exposing in response.
      console.info(`[auth] Password reset link for ${user.email}: ${resetUrl}`);
      securityLog("auth.password_reset_link_logged_local", { userId: user.id });
    } else {
      securityLog("auth.password_reset_email_sent", { userId: user.id });
    }
  }
  securityLog("auth.password_reset_request", { foundUser: Boolean(user) });
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
  const h = await headers();
  const ip = clientIpFromHeaders(h);
  const rl = await enforceRateLimit({
    scope: "password_reset_confirm_ip",
    clientIp: ip,
    max: RATE_LIMIT_POLICIES.registerIp.max,
    windowMs: RATE_LIMIT_POLICIES.registerIp.windowMs,
  });
  if (!rl.allowed) {
    return { errors: { _form: ["Слишком много попыток сброса. Попробуйте позже."] } };
  }

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

  const tokenHash = hashResetToken(parsed.data.token);
  const tokenRow = await prisma.verificationToken.findFirst({
    where: {
      token: tokenHash,
      expires: { gt: new Date() },
      identifier: { startsWith: "password_reset:" },
    },
    select: { identifier: true, expires: true },
  });
  if (!tokenRow) {
    securityLog("auth.password_reset_invalid_token", { ip });
    return { errors: { _form: ["Ссылка недействительна или истекла. Запросите новую."] } };
  }

  const userId = parseResetIdentifier(tokenRow.identifier);
  if (!userId) {
    securityLog("auth.password_reset_invalid_identifier", { ip });
    return { errors: { _form: ["Ссылка недействительна или истекла. Запросите новую."] } };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, BCRYPT_COST);
  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
    await tx.verificationToken.deleteMany({
      where: { identifier: resetIdentifier(userId) },
    });
  });

  securityLog("auth.password_reset_success", { userId, ip, expiresAt: tokenRow.expires.toISOString() });
  return { ok: true };
}
