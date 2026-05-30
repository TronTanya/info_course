import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, "..", ".env");
const envLocalPath = path.join(__dirname, "..", ".env.local");

function readDotEnv(file) {
  const map = {};
  if (!fs.existsSync(file)) return map;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([^#=]+)=(.*)$/);
    if (m) map[m[1].trim()] = m[2].trim().replace(/^"|"$/g, "");
  }
  return map;
}

function ensureLibpqCompat(url) {
  if (
    url &&
    /sslmode=(require|prefer|verify-ca)/i.test(url) &&
    !/[?&]uselibpqcompat=/i.test(url)
  ) {
    return `${url}${url.includes("?") ? "&" : "?"}uselibpqcompat=true`;
  }
  return url;
}

const env = { ...readDotEnv(envPath), ...readDotEnv(envLocalPath) };
process.env.DATABASE_URL = ensureLibpqCompat(env.DATABASE_URL);
process.env.DIRECT_URL = ensureLibpqCompat(env.DIRECT_URL);

const { PrismaClient } = await import("@prisma/client");
const prisma = new PrismaClient();
try {
  const count = await prisma.user.count();
  console.log("Prisma OK, users=", count);
} catch (error) {
  console.error("Prisma FAIL", error.message);
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
