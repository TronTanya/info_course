import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, "..", ".env");

function readDotEnv(file) {
  const map = {};
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([^#=]+)=(.*)$/);
    if (m) map[m[1].trim()] = m[2].trim().replace(/^"|"$/g, "");
  }
  return map;
}

const env = fs.existsSync(envPath) ? readDotEnv(envPath) : {};
const url = process.env.DATABASE_URL ?? env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL empty");
  process.exit(1);
}
console.log("DATABASE_URL host:", new URL(url.replace(/^postgres(ql)?:\/\//, "http://")).host);

const client = new pg.Client({
  connectionString: url,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 60_000,
});

try {
  await client.connect();
  const { rows } = await client.query('SELECT COUNT(*)::int AS n FROM "User"');
  console.log("OK users=", rows[0].n);
} catch (error) {
  console.error("FAIL", error.code ?? "", error.message);
  process.exit(1);
} finally {
  await client.end().catch(() => {});
}
