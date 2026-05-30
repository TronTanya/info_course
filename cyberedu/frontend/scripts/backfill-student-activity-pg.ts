/**
 * Заполнение Supabase через pg (стабильнее pooler на Windows).
 * npx tsx scripts/backfill-student-activity-pg.ts
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";
import { randomUUID } from "node:crypto";

function newId() {
  return randomUUID().replace(/-/g, "").slice(0, 25);
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

function loadEnv() {
  for (const file of [".env.local", ".env"]) {
    const p = path.join(root, file);
    if (!fs.existsSync(p)) continue;
    for (const line of fs.readFileSync(p, "utf8").split(/\r?\n/)) {
      const m = line.match(/^\s*([^#=]+)=(.*)$/);
      if (m) process.env[m[1].trim()] = m[2].trim().replace(/^"|"$/g, "");
    }
  }
  let url = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (url && /sslmode=(require|prefer)/i.test(url) && !/[?&]uselibpqcompat=/i.test(url)) {
    url += `${url.includes("?") ? "&" : "?"}uselibpqcompat=true`;
  }
  return url;
}

const STUDENT_EMAIL = "student@cyberedu.local";
const BEFORE_APRIL = Date.UTC(2026, 2, 31, 22, 0, 0);
const TIMELINE_START = Date.UTC(2026, 0, 15, 8, 0, 0);

function hash32(input: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

type Tier = "none" | "partial" | "full";

function tier(email: string, userId: string): Tier {
  if (email === STUDENT_EMAIL) return "full";
  const b = hash32(`${userId}|tier`) % 100;
  if (b < 28) return "none";
  if (b < 70) return "partial";
  return "full";
}

function partialFlags(userId: string, idx: number) {
  const h = hash32(`${userId}|p|${idx}`);
  const s = h % 5;
  if (s === 0) return { l: false, v: false, t: false, p: false, m: false, score: 0 };
  if (s === 1) return { l: true, v: false, t: false, p: false, m: false, score: 8 + (h % 12) };
  if (s === 2) return { l: true, v: true, t: false, p: false, m: false, score: 18 + (h % 22) };
  if (s === 3) return { l: true, v: true, t: true, p: false, m: false, score: 35 + (h % 25) };
  return { l: true, v: true, t: true, p: h % 3 === 0, m: false, score: 52 + (h % 28) };
}

function timeline(userId: string, n: number): Date[] {
  const salt = hash32(`${userId}|tl`);
  let t = TIMELINE_START + (salt % 20) * 86400000;
  const out: Date[] = [];
  for (let i = 0; i < n; i++) {
    if (i > 0) t += (6 + (hash32(`${userId}|g|${i}`) % 36)) * 3600000;
    if (t > BEFORE_APRIL) t = BEFORE_APRIL - (n - 1 - i) * 1500000;
    out.push(new Date(t));
  }
  for (let i = 1; i < out.length; i++) {
    if (out[i]!.getTime() <= out[i - 1]!.getTime()) {
      out[i] = new Date(out[i - 1]!.getTime() + 3000000);
    }
  }
  return out;
}

function modScore(userId: string, modId: string, i: number) {
  return 52 + (hash32(`${userId}|${modId}|${i}`) % 49);
}

function iso(d: Date) {
  return d.toISOString();
}

async function q(client: pg.Client, sql: string, params: unknown[] = []) {
  return client.query(sql, params);
}

async function main() {
  loadEnv();
  const url = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL missing");

  const client = new pg.Client({
    connectionString: url,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 120000,
  });
  await client.connect();

  const courseRes = await q(client, `SELECT id FROM "Course" ORDER BY "createdAt" ASC LIMIT 1`);
  const courseId = courseRes.rows[0]?.id as string | undefined;
  if (!courseId) throw new Error("No course");

  const modRes = await q(
    client,
    `SELECT m.id, t.id AS "testId", t."minScore", pt.id AS "taskId", pt."maxScore"
     FROM "Module" m
     LEFT JOIN "Test" t ON t."moduleId" = m.id
     LEFT JOIN "PracticalTask" pt ON pt."moduleId" = m.id
     WHERE m."courseId" = $1 AND m."isActive" = true
     ORDER BY m."orderNumber" ASC`,
    [courseId],
  );

  type Mod = { id: string; tests: { id: string; minScore: number }[]; tasks: { id: string; maxScore: number }[] };
  const modMap = new Map<string, Mod>();
  for (const row of modRes.rows) {
    let m = modMap.get(row.id);
    if (!m) {
      m = { id: row.id, tests: [], tasks: [] };
      modMap.set(row.id, m);
    }
    if (row.testId && !m.tests.some((t) => t.id === row.testId)) {
      m.tests.push({ id: row.testId, minScore: row.minScore ?? 0 });
    }
    if (row.taskId && !m.tasks.some((t) => t.id === row.taskId)) {
      m.tasks.push({ id: row.taskId, maxScore: row.maxScore ?? 100 });
    }
  }
  const modules = [...modMap.values()];

  const usersRes = await q(
    client,
    `SELECT id, email FROM "User" WHERE role = 'USER' AND email NOT ILIKE 'e2e-%' ORDER BY email`,
  );
  const users = usersRes.rows as { id: string; email: string }[];
  const ids = users.map((u) => u.id);

  console.log(`Users ${users.length}, modules ${modules.length}`);

  await q(client, `DELETE FROM "TestAttemptAnswer" WHERE "attemptId" IN (SELECT id FROM "TestAttempt" WHERE "userId" = ANY($1::text[]))`, [ids]);
  await q(client, `DELETE FROM "TestAttempt" WHERE "userId" = ANY($1::text[])`, [ids]);
  await q(client, `DELETE FROM "Submission" WHERE "userId" = ANY($1::text[])`, [ids]);
  await q(client, `DELETE FROM "Certificate" WHERE "userId" = ANY($1::text[])`, [ids]);
  await q(client, `DELETE FROM "UserAchievement" WHERE "userId" = ANY($1::text[]) AND kind = 'CERTIFICATE_EARNED'`, [ids]);
  await q(client, `DELETE FROM "Progress" WHERE "userId" = ANY($1::text[])`, [ids]);

  let stats = { none: 0, partial: 0, full: 0, attempts: 0, subs: 0, certs: 0 };

  for (const user of users) {
    const t = tier(user.email, user.id);
    const tl = timeline(user.id, modules.length);
    if (t === "none") {
      stats.none++;
      continue;
    }

    const progressSql: string[] = [];
    const progressParams: unknown[] = [];
    const attemptSql: string[] = [];
    const attemptParams: unknown[] = [];
    const subSql: string[] = [];
    const subParams: unknown[] = [];

    let pIdx = 1;
    let aIdx = 1;
    let sIdx = 1;

    const addProgress = (
      modId: string,
      flags: { l: boolean; v: boolean; t: boolean; p: boolean; m: boolean; score: number },
      at: Date,
    ) => {
      progressSql.push(
        `($${pIdx++},$${pIdx++},$${pIdx++},$${pIdx++},$${pIdx++},$${pIdx++},$${pIdx++},$${pIdx++},$${pIdx++},$${pIdx++},$${pIdx++})`,
      );
      progressParams.push(
        newId(),
        user.id,
        modId,
        flags.l,
        flags.v,
        flags.t,
        flags.p,
        flags.m,
        flags.score,
        iso(at),
        iso(at),
      );
    };

    const addAttempts = (mod: Mod, score: number, at: Date) => {
      for (const test of mod.tests) {
        const sc = Math.min(100, score + (hash32(`${user.id}|${test.id}`) % 8));
        attemptSql.push(`($${aIdx++},$${aIdx++},$${aIdx++},$${aIdx++},$${aIdx++},$${aIdx++},$${aIdx++})`);
        attemptParams.push(newId(), user.id, test.id, sc, 100, sc >= test.minScore, iso(at));
      }
    };

    const addSubs = (mod: Mod, score: number, at: Date) => {
      for (const task of mod.tasks) {
        const pts = task.maxScore > 0 ? task.maxScore : 100;
        subSql.push(
          `($${sIdx++},$${sIdx++},$${sIdx++},$${sIdx++},$${sIdx++},$${sIdx++},$${sIdx++},$${sIdx++},$${sIdx++})`,
        );
        subParams.push(
          newId(),
          user.id,
          task.id,
          "Ответ по практическому заданию (демо-данные курса).",
          Math.min(pts, 70 + (hash32(`${user.id}|${task.id}`) % 31)),
          "ACCEPTED",
          iso(at),
          iso(at),
          iso(at),
        );
      }
    };

    if (t === "full") {
      stats.full++;
      for (let i = 0; i < modules.length; i++) {
        const mod = modules[i]!;
        const at = tl[i]!;
        const score = modScore(user.id, mod.id, i);
        addProgress(mod.id, { l: true, v: true, t: true, p: true, m: true, score }, at);
        addAttempts(mod, score, at);
        addSubs(mod, score, at);
      }
    } else {
      stats.partial++;
      const firstInc = modules.length <= 1 ? 0 : hash32(`${user.id}|inc`) % modules.length;
      for (let i = 0; i < firstInc; i++) {
        const mod = modules[i]!;
        const at = tl[i]!;
        const score = modScore(user.id, mod.id, i);
        addProgress(mod.id, { l: true, v: true, t: true, p: true, m: true, score }, at);
        addAttempts(mod, score, at);
        addSubs(mod, score, at);
      }
      const mod = modules[firstInc];
      if (mod) {
        const f = partialFlags(user.id, firstInc);
        const base = tl[firstInc]!;
        const at = new Date(Math.max(base.getTime() - 7200000, TIMELINE_START));
        addProgress(
          mod.id,
          { l: f.l, v: f.v, t: f.t, p: f.p, m: f.m, score: f.score },
          at,
        );
        if (f.t) addAttempts(mod, f.score, at);
        if (f.p) addSubs(mod, f.score, at);
      }
    }

    if (progressSql.length) {
      await q(
        client,
        `INSERT INTO "Progress" (id,"userId","moduleId","lessonCompleted","videoCompleted","testCompleted","practiceCompleted","moduleCompleted",score,"createdAt","updatedAt") VALUES ${progressSql.join(",")}`,
        progressParams,
      );
    }
    if (attemptSql.length) {
      await q(
        client,
        `INSERT INTO "TestAttempt" (id,"userId","testId",score,"maxScore",passed,"createdAt") VALUES ${attemptSql.join(",")}`,
        attemptParams,
      );
      stats.attempts += attemptSql.length;
    }
    if (subSql.length) {
      await q(
        client,
        `INSERT INTO "Submission" (id,"userId","practicalTaskId","textAnswer",score,status,"createdAt","updatedAt","checkedAt") VALUES ${subSql.join(",")}`,
        subParams,
      );
      stats.subs += subSql.length;
    }

    if (t === "full") {
      const lastAt = tl[tl.length - 1]!;
      const issued =
        user.email === STUDENT_EMAIL
          ? new Date(Date.UTC(2026, 2, 28, 14, 30, 0))
          : new Date(Math.min(lastAt.getTime() + 86400000, BEFORE_APRIL));
      await q(
        client,
        `INSERT INTO "Certificate" (id,"userId","courseId","certificateNumber","verificationCode","issuedAt") VALUES ($1,$2,$3,$4,$5,$6)`,
        [
          newId(),
          user.id,
          courseId,
          `CE-2026-${user.id.slice(-10).toUpperCase()}`,
          `VRFY-${user.id.replace(/-/g, "").slice(0, 22)}`,
          iso(issued),
        ],
      );
      await q(
        client,
        `INSERT INTO "UserAchievement" (id,"userId",kind,"unlockedAt") VALUES ($1,$2,'CERTIFICATE_EARNED',$3) ON CONFLICT DO NOTHING`,
        [newId(), user.id, iso(issued)],
      );
      stats.certs++;
    }
  }

  const verify = await q(
    client,
    `SELECT
      (SELECT COUNT(*)::int FROM "Progress") AS progress,
      (SELECT COUNT(*)::int FROM "TestAttempt") AS attempts,
      (SELECT COUNT(*)::int FROM "Submission" WHERE status='ACCEPTED') AS subs,
      (SELECT COUNT(*)::int FROM "Certificate") AS certs,
      (SELECT MAX("updatedAt") FROM "Progress") AS max_progress,
      (SELECT MAX("createdAt") FROM "TestAttempt") AS max_test,
      (SELECT MAX("issuedAt") FROM "Certificate") AS max_cert`,
  );

  console.log("Stats:", stats);
  console.log("Verify:", verify.rows[0]);
  await client.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
