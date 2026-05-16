import { expect, type Page } from "@playwright/test";

const RATE_LIMIT_ERROR = /слишком много отправок|слишком много проверок/i;

export async function openFirstTestPage(page: Page): Promise<void> {
  await page.goto("/dashboard/course");
  const testLink = page.locator('a[href*="/test"]').first();
  if ((await testLink.count()) > 0) {
    await testLink.click();
  } else {
    await page.getByRole("link", { name: /Начать|Продолжить|тест/i }).first().click();
  }
  await expect(page).toHaveURL(/\/dashboard\/course\/[^/]+\/test/);
}

export async function startTestAttempt(page: Page): Promise<void> {
  const retake = page.getByRole("button", { name: /Пройти тест ещё раз/i });
  if (await retake.isVisible().catch(() => false)) {
    await retake.click();
  }
}

/** Ответить на все вопросы и отправить тест. */
export async function submitModuleTest(page: Page): Promise<void> {
  await startTestAttempt(page);

  const finishBtn = page.getByRole("button", { name: /Завершить тест/i });
  const maxSteps = 40;

  for (let step = 0; step < maxSteps; step++) {
    const radio = page.locator('input[type="radio"]').first();
    const checkbox = page.locator('input[type="checkbox"]').first();
    const textarea = page.locator("textarea").first();

    if (await radio.isVisible().catch(() => false)) {
      await radio.check();
    } else if (await checkbox.isVisible().catch(() => false)) {
      await checkbox.check();
    } else if (await textarea.isVisible().catch(() => false)) {
      await textarea.fill(
        "E2E smoke: развёрнутый ответ для проверки rate limit server action и отправки теста.",
      );
    }

    if (await finishBtn.isEnabled().catch(() => false)) {
      break;
    }

    const nextBtn = page.getByRole("button", { name: /Следующий вопрос/i });
    if (await nextBtn.isEnabled().catch(() => false)) {
      await nextBtn.click();
      continue;
    }
    break;
  }

  await expect(finishBtn).toBeEnabled({ timeout: 15_000 });
  await finishBtn.click();
  await expect(page.getByText(RATE_LIMIT_ERROR)).not.toBeVisible({ timeout: 15_000 });
  await expect(page.getByText(/Результат:|Статус:/i).first()).toBeVisible({ timeout: 20_000 });
}

export async function openFirstPracticePage(page: Page): Promise<void> {
  await page.goto("/dashboard/course");
  const practiceLink = page.locator('a[href*="/practice"]').first();
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
