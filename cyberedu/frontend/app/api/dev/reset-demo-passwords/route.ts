import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { clearLoginAttempts } from "@/lib/security/login-attempts";

const DEMO_ACCOUNTS = [
  { email: "admin@cyberedu.local", password: "Admin12345!" },
  { email: "student@cyberedu.local", password: "Student12345!" },
] as const;

function devOnly(): boolean {
  if (process.env.NODE_ENV === "production") return false;
  const env = (process.env.ENVIRONMENT ?? "").trim().toLowerCase();
  return env !== "production" && env !== "prod";
}

/** Локальная разработка: сброс паролей демо-учёток и снятие блокировки входа. */
export async function POST() {
  if (!devOnly()) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const ips = ["direct", "unknown", "127.0.0.1", "::1"] as const;

  for (const { email, password } of DEMO_ACCOUNTS) {
    const hash = await bcrypt.hash(password, 12);
    await prisma.user.upsert({
      where: { email },
      create: {
        email,
        passwordHash: hash,
        role: email === "admin@cyberedu.local" ? "ADMIN" : "USER",
        emailVerified: new Date(),
      },
      update: {
        passwordHash: hash,
        emailVerified: new Date(),
      },
    });
    await Promise.all(ips.map((ip) => clearLoginAttempts(email, ip)));
  }

  return NextResponse.json({
    ok: true,
    accounts: DEMO_ACCOUNTS.map((a) => ({ email: a.email, password: a.password })),
  });
}
