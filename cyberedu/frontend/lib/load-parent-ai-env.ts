import fs from "node:fs";
import path from "node:path";
import { config } from "dotenv";

const AI_KEYS = ["OPENAI_API_KEY", "AI_API_KEY", "OPENAI_API_BASE_URL", "OPENAI_MODEL"] as const;

/**
 * При `npm run dev` Next читает только `frontend/.env`.
 * Если ключ DeepSeek задан в `cyberedu/.env` (для Docker), подставляем недостающие значения.
 */
export function loadParentAiEnv(): void {
  const parentEnv = path.resolve(process.cwd(), "..", ".env");
  if (!fs.existsSync(parentEnv)) return;

  const parsed = config({ path: parentEnv, quiet: true }).parsed ?? {};
  for (const key of AI_KEYS) {
    if (process.env[key]?.trim()) continue;
    const value = parsed[key]?.trim();
    if (value) process.env[key] = value;
  }
}
