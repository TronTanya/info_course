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
  const finish = page.getByRole("button", { name: /Завершить тест/i });
  const retake = page.getByRole("button", { name: /Пройти тест ещё раз|Пройти снова/i });
  const start = page.getByRole("button", { name: /Начать тест/i });

  if (await finish.isVisible().catch(() => false)) return;

  await expect(start.or(retake).or(finish)).toBeVisible({ timeout: 20_000 });
  if (await finish.isVisible().catch(() => false)) return;

  const launcher = (await retake.isVisible().catch(() => false)) ? retake : start;
  await launcher.scrollIntoViewIfNeeded();
  await launcher.click();
  await expect(finish).toBeVisible({ timeout: 30_000 });
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
  const filled = page.getByText(/Заполнено\s+\d+\s*\/\s*\d+/i).first();
  const progress = page.getByText(/Прогресс по ответам:/i).first();
  const el = (await filled.isVisible({ timeout: 400 }).catch(() => false)) ? filled : progress;
  if (!(await el.isVisible({ timeout: 400 }).catch(() => false))) return null;
  const text = await el.textContent();
  const m = text?.match(/(\d+)\s*\/\s*(\d+)/);
  if (!m) return null;
  return { answered: Number(m[1]), total: Number(m[2]) };
}

async function answerAllTestQuestions(page: Page): Promise<void> {
  const nav = page.getByRole("navigation", { name: /Навигация по вопросам/i });
  const count = await nav.getByRole("button").count();
  for (let i = 0; i < count; i++) {
    await nav.getByRole("button").nth(i).click();
    await answerVisibleQuestion(page);
  }
}

/** Ответить на все вопросы и отправить тест; false — если тест уже сдан и повтор недоступен в UI. */
export async function submitModuleTest(page: Page): Promise<boolean> {
  await startTestAttempt(page);

  const finishBtn = page.getByRole("button", { name: /Завершить тест/i });
  if (!(await finishBtn.isVisible().catch(() => false))) {
    return false;
  }

  await answerAllTestQuestions(page);

  const progress = await testAnswerProgress(page);
  if (!progress || progress.answered < progress.total) {
    const nextBtn = page.getByRole("button", { name: /Далее|Следующий вопрос/i });
    for (let step = 0; step < 12; step++) {
      await answerVisibleQuestion(page);
      const p = await testAnswerProgress(page);
      if (p && p.answered >= p.total) break;
      if (await nextBtn.isEnabled().catch(() => false)) {
        await nextBtn.click();
      } else {
        break;
      }
    }
  }

  if (!(await finishBtn.isEnabled().catch(() => false))) {
    return false;
  }
  await finishBtn.click();

  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible({ timeout: 10_000 });
  const confirmSubmit = dialog.getByRole("button", { name: /Отправить ответы/i });
  await expect(confirmSubmit).toBeEnabled({ timeout: 15_000 });
  await confirmSubmit.click();

  await expect(page.getByText(RATE_LIMIT_ERROR)).not.toBeVisible({ timeout: 15_000 });
  await expect(page.getByText(/Результат теста|Результат:|Статус:/i).first()).toBeVisible({ timeout: 30_000 });
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
  await expect(page.locator("h1").first()).toBeVisible({ timeout: 20_000 });

  const practiceUrl = await page.evaluate(() =>
    Array.from(document.querySelectorAll<HTMLAnchorElement>("a[href]"))
      .map((a) => a.getAttribute("href"))
      .find((h): h is string => Boolean(h?.match(/^\/dashboard\/course\/[^/]+\/practice$/))),
  );
  if (practiceUrl) {
    await page.goto(practiceUrl);
    await expect(page).toHaveURL(/\/dashboard\/course\/[^/]+\/practice/);
    return;
  }

  const moduleRoot = await page.evaluate(() => {
    const href = Array.from(document.querySelectorAll<HTMLAnchorElement>("a[href]"))
      .map((a) => a.getAttribute("href"))
      .find((h) => h?.match(/^\/dashboard\/course\/[^/]+$/));
    return href ?? null;
  });
  if (moduleRoot) {
    await page.goto(`${moduleRoot}/practice`);
    await expect(page).toHaveURL(/\/dashboard\/course\/[^/]+\/practice/);
    return;
  }

  throw new Error("Practice: module id not found on course map — check seed");
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
  const submit = page.getByRole("button", { name: /Отправить (?:ответ )?на проверку/i }).first();
  if (!(await submit.isVisible().catch(() => false))) {
    return;
  }
  await submit.click();
  await expect(page.getByText(RATE_LIMIT_ERROR)).not.toBeVisible({ timeout: 15_000 });
}
