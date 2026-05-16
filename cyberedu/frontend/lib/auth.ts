import type { Role } from "@prisma/client";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { securityLog } from "@/lib/security-log";

if (process.env.NODE_ENV === "production") {
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
      "[auth] В development задайте AUTH_SECRET (≥32 символа) в frontend/.env — тот же, что в Docker compose, иначе JWT из cookie не расшифруется (JWTSessionError / no matching decryption secret).",
    );
  }
}

const nextAuth = NextAuth({
  // Важно: middleware и getToken используют `AUTH_SECRET` для расшифровки JWT.
  // Если NextAuth не получает тот же `secret`, cookie сессии шифруется одним ключом,
  // а читается другим (JWTSessionError: no matching decryption secret).
  secret: process.env.AUTH_SECRET?.trim(),
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 7 },
  trustHost: true,
  /** Битая cookie после смены AUTH_SECRET — ожидаемо; не засоряем консоль Next dev красным оверлеем. */
  logger:
    process.env.NODE_ENV !== "production"
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
        securityLog("auth.sign_in_success", { userId: user.id });
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

        const user = await prisma.user.findUnique({
          where: { email },
          select: { id: true, email: true, passwordHash: true, role: true },
        });
        if (!user?.passwordHash) return null;

        const valid = await bcrypt.compare(passwordRaw, user.passwordHash);
        if (!valid) return null;

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

/**
 * Вызов сессии без падения страницы: при смене `AUTH_SECRET` или битой cookie JWT
 * NextAuth бросает JWTSessionError — тогда показываем гостевую шапку (пользователь может войти снова).
 */
export async function authSafe() {
  try {
    return await auth();
  } catch {
    return null;
  }
}
