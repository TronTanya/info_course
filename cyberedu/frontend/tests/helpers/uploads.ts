import { expect, type Page } from "@playwright/test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const RATE_LIMIT_ERROR = /слишком много отправок|слишком много проверок/i;

/** Минимальный безопасный текстовый файл для FILE_UPLOAD практики. */
export function createTempUploadFile(prefix = "e2e-upload"): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "cyberedu-e2e-"));
  const filePath = path.join(dir, `${prefix}.txt`);
  fs.writeFileSync(
    filePath,
    "CyberEdu E2E upload fixture — analysis notes for lab submission.\n",
    "utf8",
  );
  return filePath;
}

/**
 * Загрузка файла в практику (input[type=file] + «Проверить»).
 * Пропускает, если на странице нет file input (TEXT-only seed).
 */
export async function uploadPracticeFileIfPresent(page: Page, filePath?: string): Promise<boolean> {
  const input = page.locator('input[type="file"]').first();
  if (!(await input.isVisible({ timeout: 5_000 }).catch(() => false))) {
    return false;
  }

  const uploadPath = filePath ?? createTempUploadFile();
  await input.setInputFiles(uploadPath);

  const submit = page.getByRole("button", { name: /^проверить$/i }).first();
  await expect(submit).toBeEnabled({ timeout: 5_000 });
  await submit.click();

  await expect(page.getByText(RATE_LIMIT_ERROR)).not.toBeVisible({ timeout: 15_000 });
  await expect(
    page.getByText(/успешно отправлен|на проверке|принят|ошибка загрузки/i).first(),
  ).toBeVisible({ timeout: 20_000 });

  return true;
}

/** Путь к статическому fixture (tests/fixtures/files/). */
export function fixturePath(name: string): string {
  return path.join(process.cwd(), "tests", "fixtures", "files", name);
}
