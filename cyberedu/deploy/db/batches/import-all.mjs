import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const batchesDir = __dirname;
const envPath = path.resolve(batchesDir, '../../../frontend/.env');

const env = fs.readFileSync(envPath, 'utf8');
const directMatch = env.match(/^DIRECT_URL="(.+)"/m);
if (!directMatch) {
  console.error('No DIRECT_URL in .env');
  process.exit(1);
}

function transformSql(sql, filename) {
  if (!filename.includes('Question')) return sql;
  if (!sql.includes('"topic"')) return sql;
  let out = sql.replace(
    /INSERT INTO "Question" \("id", "testId", "questionText", "questionType", "points", "orderNumber", "textExpectedAnswer", "textManualGrading", "explanation", "topic"\)/g,
    'INSERT INTO "Question" ("id", "testId", "questionText", "questionType", "points", "orderNumber", "textExpectedAnswer", "textManualGrading", "explanation")'
  );
  out = out.replace(/, NULL\)/g, ')');
  out = out.replace(/, NULL,/g, ',');
  return out;
}

const connStr = directMatch[1];
const manifest = JSON.parse(fs.readFileSync(path.join(batchesDir, 'manifest.json'), 'utf8'));
const startIdx = parseInt(process.argv[2] ?? '0', 10);
const endIdx = parseInt(process.argv[3] ?? String(manifest.length - 1), 10);

const client = new pg.Client({ connectionString: connStr, ssl: { rejectUnauthorized: false } });
await client.connect();

const results = [];
for (let i = startIdx; i <= endIdx && i < manifest.length; i++) {
  const file = manifest[i];
  const raw = fs.readFileSync(path.join(batchesDir, file), 'utf8');
  const sql = transformSql(raw, file);
  try {
    await client.query(sql);
    results.push({ i, file, status: 'ok' });
    if ((i + 1) % 25 === 0) process.stderr.write(`Progress: ${i + 1}/${manifest.length} ${file}\n`);
  } catch (e) {
    const msg = e.message ?? String(e);
    if (/duplicate key|already exists|unique constraint/i.test(msg)) {
      results.push({ i, file, status: 'skipped_duplicate', error: msg.slice(0, 120) });
    } else {
      console.error('FAILED', file, msg);
      await client.end();
      process.exit(1);
    }
  }
}

await client.end();
const ok = results.filter((r) => r.status === 'ok').length;
const skipped = results.filter((r) => r.status === 'skipped_duplicate').length;
console.log(JSON.stringify({ startIdx, endIdx, ok, skipped, total: results.length }, null, 2));
