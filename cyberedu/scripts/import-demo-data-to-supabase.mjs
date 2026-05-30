/**
 * Import deploy/db/docker-demo-data.sql into Supabase via Node (no local psql/docker).
 * Usage: node scripts/import-demo-data-to-supabase.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import pg from "pg";
import { from as copyFrom } from "pg-copy-streams";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cybereduRoot = path.resolve(__dirname, "..");
const frontendRoot = path.join(cybereduRoot, "frontend");
const dumpPath = path.join(cybereduRoot, "deploy", "db", "docker-demo-data.sql");
const envPath = path.join(frontendRoot, ".env");

function readDotEnv(file) {
  const map = {};
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([^#=]+)=(.*)$/);
    if (m) map[m[1].trim()] = m[2].trim().replace(/^"|"$/g, "");
  }
  return map;
}

const SKIP_TABLES = new Set([
  "public.users",
  "public.achievements",
  "public.courses",
  "public.modules",
  "public.lessons",
  "public.ai_adaptations",
  "public.practical_tasks",
  "public.ai_messages",
  "public.alembic_version",
  "public.tests",
  "public.questions",
  "public.answers",
  "public.certificates",
  "public.profiles",
  "public.progress",
  "public.reviews",
  "public.submissions",
  "public.test_attempts",
  "public.test_attempt_answers",
]);

const TRUNCATE_SQL = `
SET session_replication_role = replica;
TRUNCATE TABLE
  "TestAttemptAnswer",
  "TestAttempt",
  "Submission",
  "Progress",
  "UserAchievement",
  "Certificate",
  "Review",
  "AiAdaptation",
  tutor_chat_message,
  tutor_chat_thread,
  course_progress,
  security_audit_log,
  "Account",
  "Session",
  "VerificationToken",
  "Profile",
  "User",
  "Answer",
  "Question",
  "Test",
  "PracticalTask",
  "Lesson",
  "Module",
  "Course"
RESTART IDENTITY CASCADE;
SET session_replication_role = DEFAULT;
`;

function parseCopyBlocks(sql) {
  const blocks = [];
  const re = /^COPY ([^\s]+) \(([^)]+)\) FROM stdin;\r?\n([\s\S]*?)\r?\n\\.\r?\n/gm;
  let m;
  while ((m = re.exec(sql)) !== null) {
    const table = m[1];
    const columns = m[2];
    const data = m[3];
    if (!data.trim()) continue;
    if (SKIP_TABLES.has(table)) continue;
    blocks.push({ table, columns, data });
  }
  return blocks;
}

async function main() {
  if (!fs.existsSync(dumpPath)) {
    throw new Error(`Missing dump: ${dumpPath}`);
  }
  if (!fs.existsSync(envPath)) {
    throw new Error(`Missing ${envPath}`);
  }

  const env = readDotEnv(envPath);
  let url = env.DIRECT_URL || env.DATABASE_URL;
  if (!url?.startsWith("postgres")) {
    throw new Error("DIRECT_URL must be set in frontend/.env");
  }

  const client = new pg.Client({
    connectionString: url,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 60_000,
  });

  console.log("Connecting to Supabase...");
  await client.connect();

  console.log("Truncating existing data...");
  await client.query(TRUNCATE_SQL);

  const sql = fs.readFileSync(dumpPath, "utf8");
  const blocks = parseCopyBlocks(sql);
  console.log(`Importing ${blocks.length} COPY blocks...`);

  for (const { table, columns, data } of blocks) {
    const rowCount = data.split("\n").filter(Boolean).length;
    process.stdout.write(`  ${table} (${rowCount} rows)... `);
    const copySql = `COPY ${table} (${columns}) FROM STDIN`;
    const stream = client.query(copyFrom(copySql));
    await pipeline(Readable.from([`${data}\n`]), stream);
    console.log("ok");
  }

  const { rows } = await client.query('SELECT COUNT(*)::int AS n FROM "User"');
  console.log(`Done. Users in Supabase: ${rows[0].n}`);
  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
