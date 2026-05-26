"use server";

import { createHash, randomBytes } from "node:crypto";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { appOrigin, getSmtpConfig, isProductionRuntime, sendAuthEmail } from "@/lib/auth/email-delivery";
import { enforceRateLimit, RATE_LIMIT_POLICIES } from "@/lib/security/rate-limit";
import { clientIpFromHeaders } from "@/lib/security/request-ip";
import { securityLog } from "@/lib/security-log";

const VERIFY_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

function verifyIdentifier(userId: string): string {
  return `email_verify:${userId}`;
}

function parseVerifyIdentifier(identifier: string): string | null {
  if (!identifier.startsWith("email_verify:")) return null;
  const userId = identifier.slice("email_verify:".length).trim();
  return userId || null;
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

async function issueAndSendVerificationEmail(userId: string, email: string): Promise<"sent" | "logged_local"> {
  const rawToken = randomBytes(32).toString("hex");
  const tokenHash = hashToken(rawToken);
  const identifier = verifyIdentifier(userId);
  const expires = new Date(Date.now() + VERIFY_TOKEN_TTL_MS);

  await prisma.verificationToken.deleteMany({ where: { identifier } });
  await prisma.verificationToken.create({
    data: {
      identifier,
      token: tokenHash,
      expires,
    },
  });

  const verifyUrl = `${appOrigin()}/auth/verify-email?token=${rawToken}&callbackUrl=${encodeURIComponent("/dashboard/profile")}`;
  const delivered = await sendAuthEmail({
    to: email,
    subject: "CyberEdu — подтверждение email",
    text:
      `Подтвердите email для доступа к личному кабинету.\n\n` +
      `Ссылка: ${verifyUrl}\n\n` +
      `Ссылка действует 24 часа.`,
    html:
      `<p>Подтвердите email для доступа к личному кабинету.</p>` +
      `<p><a href="${verifyUrl}">Подтвердить email</a></p>` +
      `<p>Ссылка действует <strong>24 часа</strong>.</p>`,
  });
  if (!delivered) {
    console.info(`[auth] Email verification link for ${email}: ${verifyUrl}`);
    securityLog("auth.verify_email_link_logged_local", { userId });
    return "logged_local";
  }
  securityLog("auth.verify_email_sent", { userId });
  return "sent";
}

export async function sendVerificationEmailAction(): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/login?callbackUrl=/auth/verify-email");
  }
  const h = await headers();
  const ip = clientIpFromHeaders(h);
  const rl = await enforceRateLimit({
    scope: "auth:verify:send",
    clientIp: ip,
    userId: session.user.id,
    max: RATE_LIMIT_POLICIES.registerIp.max,
    windowMs: RATE_LIMIT_POLICIES.registerIp.windowMs,
  });
  if (!rl.allowed) {
    redirect("/auth/verify-email?sent=rate_limited");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, emailVerified: true },
  });
  if (!user) {
    redirect("/auth/login");
  }
  if (user.emailVerified) {
    redirect("/auth/verify-email?sent=already_verified");
  }
  if (!getSmtpConfig() && isProductionRuntime()) {
    securityLog("auth.verify_email_unavailable", { reason: "smtp_not_configured", userId: user.id });
    redirect("/auth/verify-email?sent=unavailable");
  }

  await issueAndSendVerificationEmail(user.id, user.email);
  redirect("/auth/verify-email?sent=ok");
}

export async function verifyEmailToken(tokenRaw: string): Promise<
  | { ok: true; userId: string }
  | { ok: false; reason: "invalid" | "expired" | "already_verified" }
> {
  const token = tokenRaw.trim();
  if (!token) return { ok: false, reason: "invalid" };

  const tokenHash = hashToken(token);
  const now = new Date();
  const row = await prisma.verificationToken.findFirst({
    where: {
      token: tokenHash,
      identifier: { startsWith: "email_verify:" },
    },
    select: { identifier: true, expires: true },
  });
  if (!row) return { ok: false, reason: "invalid" };
  if (row.expires <= now) {
    await prisma.verificationToken.deleteMany({ where: { identifier: row.identifier } });
    return { ok: false, reason: "expired" };
  }
  const userId = parseVerifyIdentifier(row.identifier);
  if (!userId) return { ok: false, reason: "invalid" };

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, emailVerified: true },
  });
  if (!user) return { ok: false, reason: "invalid" };
  if (user.emailVerified) {
    await prisma.verificationToken.deleteMany({ where: { identifier: row.identifier } });
    return { ok: false, reason: "already_verified" };
  }

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: { emailVerified: new Date() },
    });
    await tx.verificationToken.deleteMany({
      where: { identifier: verifyIdentifier(userId) },
    });
  });
  securityLog("auth.verify_email_success", { userId });
  return { ok: true, userId };
}

export async function issueVerificationEmailForUser(userId: string, email: string): Promise<void> {
  if (!getSmtpConfig() && isProductionRuntime()) {
    securityLog("auth.verify_email_unavailable", { reason: "smtp_not_configured", userId });
    return;
  }
  await issueAndSendVerificationEmail(userId, email);
}
