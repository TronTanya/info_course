import { expect, type Page } from "@playwright/test";

const RATE_LIMIT_ERROR = /слишком много отправок|слишком много проверок/i;

export async function openFirstTestPage(page: Page): Promise<void> {
  await page.goto("/dashboard/course");
  await expect(page.locator("h1").first()).toBeVisible({ timeout: 20_000 });

  const testUrls = await page.evaluate(() =>
    Array.from(document.querySelectorAll<HTMLAnchorElement>("a[href]"))
      .map((a) => a.getAttribute("href"))
      .filter((h): h is string => Boolean(h?.match(/^\/dashboard\/course\/[^/]+\/test$/))),
  );
  const testUrl = testUrls.at(-1) ?? testUrls[0] ?? null;
  if (testUrl) {
    await page.goto(testUrl);
    await expect(page).toHaveURL(/\/dashboard\/course\/[^/]+\/test/);
    return;
  }

  const moduleRoot = await page.evaluate(() => {
    const href = Array.from(document.querySelectorAll<HTMLAnchorElement>("a[href]"))
      .map((a) => a.getAttribute("href"))
      .find((h) => h?.match(/^\/dashboard\/course\/[^/]+$/));
    return href ?? null;
  });
  if (moduleRoot) {
    await page.goto(`${moduleRoot}/test`);
    await expect(page).toHaveURL(/\/dashboard\/course\/[^/]+\/test/);
    return;
  }

  const testLink = page.getByRole("link", { name: /Перейти к тесту|Пройти тест|Продолжить/i }).first();
  await testLink.click({ timeout: 10_000 });
  await expect(page).toHaveURL(/\/dashboard\/course\/[^/]+\/test/);
}

export async function startTestAttempt(page: Page): Promise<void> {
  const retake = page.getByRole("button", { name: /Пройти тест ещё раз/i });
  if (await retake.isVisible().catch(() => false)) {
    await retake.click();
    await expect(page.getByText(/Прогресс по ответам:/i).first()).toBeVisible({ timeout: 10_000 });
  }
}

async function answerVisibleQuestion(page: Page): Promise<void> {
  const textarea = page.getByRole("textbox").first();
  if (await textarea.isVisible().catch(() => false)) {
    await textarea.fill(
      "E2E smoke: развёрнутый ответ для проверки rate limit server action и отправки теста.",
    );
    return;
  }

  const checkboxes = page.getByRole("checkbox");
  const cbCount = await checkboxes.count();
  for (let i = 0; i < cbCount; i++) {
    await checkboxes.nth(i).check();
  }
  if (cbCount > 0) return;

  const radio = page.getByRole("radio").first();
  if (await radio.isVisible().catch(() => false)) {
    await radio.check();
  }
}

async function testAnswerProgress(page: Page): Promise<{ answered: number; total: number } | null> {
  const progress = page.getByText(/Прогресс по ответам:/i).first();
  if (!(await progress.isVisible({ timeout: 2_000 }).catch(() => false))) return null;
  const text = await progress.textContent();
  const m = text?.match(/(\d+)\s*\/\s*(\d+)/);
  if (!m) return null;
  return { answered: Number(m[1]), total: Number(m[2]) };
}

/** Ответить на все вопросы и отправить тест; false — если тест уже сдан и повтор недоступен в UI. */
export async function submitModuleTest(page: Page): Promise<boolean> {
  const retake = page.getByRole("button", { name: /Пройти тест ещё раз/i });
  const hasResult = await page
    .getByText(/Тест уже пройден|Результат:|Статус:/i)
    .first()
    .isVisible({ timeout: 3_000 })
    .catch(() => false);

  if (hasResult && !(await retake.isVisible().catch(() => false))) {
    return false;
  }

  await startTestAttempt(page);

  if (!(await page.getByText(/Прогресс по ответам:/i).first().isVisible({ timeout: 5_000 }).catch(() => false))) {
    return false;
  }

  const finishBtn = page.getByRole("button", { name: /Завершить тест/i });
  const maxSteps = 40;

  for (let step = 0; step < maxSteps; step++) {
    await answerVisibleQuestion(page);
    const progress = await testAnswerProgress(page);
    if (progress && progress.answered >= progress.total) {
      break;
    }

    const nextBtn = page.getByRole("button", { name: /Следующий вопрос/i });
    if (await nextBtn.isEnabled().catch(() => false)) {
      await nextBtn.click();
      continue;
    }

    const backBtn = page.getByRole("button", { name: /Назад/i });
    if (await backBtn.isEnabled().catch(() => false)) {
      await backBtn.click();
      continue;
    }
    break;
  }

  if (!(await finishBtn.isEnabled().catch(() => false))) {
    return false;
  }
  await finishBtn.click();
  await expect(page.getByText(RATE_LIMIT_ERROR)).not.toBeVisible({ timeout: 15_000 });
  await expect(page.getByText(/Результат:|Статус:/i).first()).toBeVisible({ timeout: 20_000 });
  return true;
}

/** Первая доступная лекция на карте курса (seed). */
export async function openFirstLessonPage(page: Page): Promise<void> {
  await page.goto("/dashboard/course");
  await expect(page.locator("h1").first()).toBeVisible({ timeout: 20_000 });

  const lessonUrl = await page.evaluate(() =>
    Array.from(document.querySelectorAll<HTMLAnchorElement>("a[href]"))
      .map((a) => a.getAttribute("href"))
      .find((h): h is string => Boolean(h?.match(/^\/dashboard\/course\/[^/]+\/lesson$/))),
  );
  if (lessonUrl) {
    await page.goto(lessonUrl);
    await expect(page).toHaveURL(/\/dashboard\/course\/[^/]+\/lesson/);
    return;
  }

  const moduleRoot = await page.evaluate(() => {
    const href = Array.from(document.querySelectorAll<HTMLAnchorElement>("a[href]"))
      .map((a) => a.getAttribute("href"))
      .find((h) => h?.match(/^\/dashboard\/course\/[^/]+$/));
    return href ?? null;
  });

  if (!moduleRoot) {
    throw new Error("Lesson: module id not found on course map — check seed");
  }

  await page.goto(`${moduleRoot}/lesson`);
  await expect(page).toHaveURL(/\/dashboard\/course\/[^/]+\/lesson/);
}

export async function openFirstPracticePage(page: Page): Promise<void> {
  await page.goto("/dashboard/course");
  const practiceLink = page.locator('a[href^="/dashboard/course/"][href$="/practice"]').first();
  if ((await practiceLink.count()) === 0) {
    throw new Error("Practice link not available — complete test first or check seed");
  }
  await practiceLink.click();
  await expect(page).toHaveURL(/\/dashboard\/course\/[^/]+\/practice/);
}

/** TEXT-практика: заполнить textarea и отправить. */
export async function submitPracticeTextIfPresent(page: Page): Promise<void> {
  const textarea = page.locator("textarea").first();
  if (!(await textarea.isVisible().catch(() => false))) {
    return;
  }
  await textarea.fill(
    "E2E smoke practice submission: описание шагов и выводов для проверки server action rate limit в production-like окружении.",
  );
  const submit = page.getByRole("button", { name: /Отправить на проверку/i }).first();
  if (!(await submit.isVisible().catch(() => false))) {
    return;
  }
  await submit.click();
  await expect(page.getByText(RATE_LIMIT_ERROR)).not.toBeVisible({ timeout: 15_000 });
}
