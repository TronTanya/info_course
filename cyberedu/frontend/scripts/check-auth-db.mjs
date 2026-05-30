import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const email = "admin@cyberedu.local";
const password = "Admin12345!";

try {
  const url = process.env.DATABASE_URL ?? "";
  const hostMatch = url.match(/@([^:/]+)/);
  console.log("DATABASE_URL host:", hostMatch?.[1] ?? "(missing)");
  console.log("DATABASE_URL port:", url.includes(":6543") ? "6543" : url.includes(":5432") ? "5432" : "?");

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, role: true, passwordHash: true },
  });
  if (!user?.passwordHash) {
    console.log("RESULT: admin user missing or no password");
    process.exit(1);
  }
  const ok = await bcrypt.compare(password, user.passwordHash);
  console.log("RESULT: admin found, password match =", ok);
  process.exit(ok ? 0 : 2);
} catch (error) {
  console.error("RESULT: error", error instanceof Error ? error.message : error);
  process.exit(3);
} finally {
  await prisma.$disconnect();
}
