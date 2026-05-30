/**
 * Import deploy/db/docker-demo-data.sql into Supabase via Node.
 * Run from cyberedu/frontend: node scripts/import-demo-data-to-supabase.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import pg from "pg";
import { from as copyFrom } from "pg-copy-streams";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frontendRoot = path.resolve(__dirname, "..");
const cybereduRoot = path.resolve(frontendRoot, "..");
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
    let data = m[3];
    if (!data.trim()) continue;
    if (SKIP_TABLES.has(table)) continue;
    if (table === 'public."User"') {
      data = data
        .split("\n")
        .filter((line) => line && !/\te2e-/i.test(line))
        .join("\n");
    }
    if (table === 'public."Profile"') {
      data = data
        .split("\n")
        .filter((line) => line && !/\tVerify\tE2E\t/i.test(line))
        .join("\n");
    }
    if (!data.trim()) continue;
    blocks.push({ table, columns, data });
  }
  return blocks;
}

async function main() {
  if (!fs.existsSync(dumpPath)) throw new Error(`Missing dump: ${dumpPath}`);
  if (!fs.existsSync(envPath)) throw new Error(`Missing ${envPath}`);

  const env = readDotEnv(envPath);
  const rawUrl = env.DIRECT_URL || env.DATABASE_URL;
  if (!rawUrl?.startsWith("postgres")) throw new Error("DIRECT_URL required in .env");
  let url = rawUrl.includes("sslmode=") ? rawUrl : `${rawUrl}${rawUrl.includes("?") ? "&" : "?"}sslmode=require`;
  if (!/[?&]uselibpqcompat=/i.test(url)) {
    url = `${url}&uselibpqcompat=true`;
  }

  const client = new pg.Client({
    connectionString: url,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 120_000,
  });

  console.log("Connecting to Supabase...");
  await client.connect();

  console.log("Truncating...");
  await client.query(TRUNCATE_SQL);

  const blocks = parseCopyBlocks(fs.readFileSync(dumpPath, "utf8"));
  console.log(`Importing ${blocks.length} tables...`);

  for (const { table, columns, data } of blocks) {
    const rowCount = data.split("\n").filter(Boolean).length;
    process.stdout.write(`  ${table} (${rowCount})... `);
    const stream = client.query(copyFrom(`COPY ${table} (${columns}) FROM STDIN`));
    await pipeline(Readable.from([`${data}\n`]), stream);
    console.log("ok");
  }

  const { rows } = await client.query('SELECT COUNT(*)::int AS n FROM "User"');
  console.log(`Done. Users: ${rows[0].n}`);
  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
