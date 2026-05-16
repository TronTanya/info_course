import type { Role } from "@prisma/client";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { SECURITY_ACTIONS } from "@/lib/security/audit-actions";
import { logSecurityEvent } from "@/lib/security/audit";
import {
  checkLoginRateLimit,
  clearLoginAttempts,
  isLoginLocked,
  recordFailedLogin,
} from "@/lib/security/login-attempts";
import { clientIpFromHeaders } from "@/lib/security/request-ip";

const isProd = process.env.NODE_ENV === "production";

if (isProd) {
  const s = process.env.AUTH_SECRET?.trim();
  if (!s || s.length < 32) {
    throw new Error(
      "AUTH_SECRET: в production задайте секрет NextAuth не короче 32 символов (например: openssl rand -base64 32).",
    );
  }
} else {
  const s = process.env.AUTH_SECRET?.trim();
  if (!s || s.length < 32) {
    console.warn(
      "[auth] В development задайте AUTH_SECRET (≥32 символа) в frontend/.env — тот же, что в Docker compose.",
    );
  }
}

const sessionMaxAge = Number(process.env.AUTH_SESSION_MAX_AGE ?? 60 * 60 * 24 * 2); // 2 суток по умолчанию

const nextAuth = NextAuth({
  secret: process.env.AUTH_SECRET?.trim(),
  session: {
    strategy: "jwt",
    maxAge: sessionMaxAge,
    updateAge: 60 * 60, // обновление JWT раз в час при активности
  },
  trustHost: true,
  useSecureCookies: isProd,
  cookies: isProd
    ? {
        sessionToken: {
          name: "__Secure-authjs.session-token",
          options: {
            httpOnly: true,
            sameSite: "lax",
            path: "/",
            secure: true,
          },
        },
      }
    : undefined,
  logger:
    !isProd
      ? {
          error(code, ...metadata: unknown[]) {
            const text = typeof code === "string" ? code : code instanceof Error ? code.message : String(code);
            if (text === "JWT_SESSION_ERROR" || text.includes("JWTSessionError")) return;
            console.error("[auth]", code, ...metadata);
          },
        }
      : undefined,
  pages: {
    signIn: "/auth/login",
  },
  events: {
    async signIn({ user }) {
      if (user?.id) {
        const h = await headers();
        logSecurityEvent({
          userId: user.id,
          action: SECURITY_ACTIONS.AUTH_LOGIN_SUCCESS,
          ip: clientIpFromHeaders(h),
          path: "/auth/login",
        });
      }
    },
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const emailRaw = credentials?.email;
        const passwordRaw = credentials?.password;
        if (typeof emailRaw !== "string" || typeof passwordRaw !== "string") {
          return null;
        }
        const email = emailRaw.trim().toLowerCase();
        if (!email || !passwordRaw) return null;

        const h = await headers();
        const ip = clientIpFromHeaders(h);

        const loginRl = await checkLoginRateLimit(ip);
        if (!loginRl.ok) {
          logSecurityEvent({
            action: SECURITY_ACTIONS.AUTH_LOGIN_RATE_LIMITED,
            severity: "warn",
            ip,
            path: "/auth/login",
            metadata: { reason: "rate_limit" },
          });
          return null;
        }

        if (isLoginLocked(email, ip)) {
          logSecurityEvent({
            action: SECURITY_ACTIONS.AUTH_LOGIN_LOCKED,
            severity: "warn",
            ip,
            path: "/auth/login",
            metadata: { reason: "account_locked" },
          });
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email },
          select: { id: true, email: true, passwordHash: true, role: true },
        });
        if (!user?.passwordHash) {
          recordFailedLogin(email, ip);
          logSecurityEvent({
            action: SECURITY_ACTIONS.AUTH_LOGIN_FAILED,
            severity: "warn",
            ip,
            path: "/auth/login",
            metadata: { reason: "unknown_user" },
          });
          return null;
        }

        const valid = await bcrypt.compare(passwordRaw, user.passwordHash);
        if (!valid) {
          const attempt = recordFailedLogin(email, ip);
          logSecurityEvent({
            userId: user.id,
            action: SECURITY_ACTIONS.AUTH_LOGIN_FAILED,
            severity: attempt.locked ? "high" : "warn",
            ip,
            path: "/auth/login",
            metadata: { reason: "bad_password", failures: attempt.failures, locked: attempt.locked },
          });
          return null;
        }

        clearLoginAttempts(email, ip);
        return {
          id: user.id,
          email: user.email,
          role: user.role,
          name: null as string | null,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.role = user.role as Role;
        token.email = user.email ?? undefined;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.sub as string) ?? "";
        session.user.role = (token.role as Role | undefined) ?? "USER";
        if (typeof token.email === "string") {
          session.user.email = token.email;
        }
      }
      return session;
    },
  },
});

export const { handlers, auth, signIn, signOut } = nextAuth;

export async function authSafe() {
  try {
    return await auth();
  } catch {
    return null;
  }
}
