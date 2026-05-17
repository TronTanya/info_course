/**
 * Учётные данные только для E2E / CI (не production).
 * Пароли из env; дефолты seed допустимы только при E2E_USE_SEED_CREDENTIALS=1 или CI.
 */

export type E2eRole = "student" | "admin";

export type E2eCredentials = {
  email: string;
  password: string;
};

const SEED_DEFAULTS = {
  admin: {
    email: "admin@cyberedu.local",
    password: "Admin12345!",
  },
  student: {
    email: "student@cyberedu.local",
    password: "Student12345!",
  },
} as const;

function isProductionSmokeE2E(): boolean {
  return process.env.E2E_PRODUCTION_SMOKE === "1";
}

function seedCredentialsAllowed(): boolean {
  if (isProductionSmokeE2E()) return true;
  if (process.env.E2E_USE_SEED_CREDENTIALS === "1") return true;
  if (process.env.ENVIRONMENT === "test" || process.env.ENVIRONMENT === "e2e") return true;
  if (process.env.CI === "true") return true;
  return false;
}

function assertSafeEnvironment(): void {
  const env = (process.env.ENVIRONMENT ?? "").trim().toLowerCase();
  if (env === "production" || env === "prod") {
    if (isProductionSmokeE2E()) return;
    throw new Error(
      "E2E: запрещено в ENVIRONMENT=production. Для CI/staging smoke: E2E_PRODUCTION_SMOKE=1 + изолированная БД.",
    );
  }
}

export function getE2eCredentials(role: E2eRole): E2eCredentials {
  assertSafeEnvironment();

  const fromEnv =
    role === "admin"
      ? {
          email: process.env.E2E_ADMIN_EMAIL?.trim(),
          password: process.env.E2E_ADMIN_PASSWORD,
        }
      : {
          email: process.env.E2E_STUDENT_EMAIL?.trim(),
          password: process.env.E2E_STUDENT_PASSWORD,
        };

  if (fromEnv.email && fromEnv.password) {
    return { email: fromEnv.email, password: fromEnv.password };
  }

  if (!seedCredentialsAllowed()) {
    throw new Error(
      `E2E: задайте E2E_${role === "admin" ? "ADMIN" : "STUDENT"}_EMAIL и E2E_*_PASSWORD, либо E2E_USE_SEED_CREDENTIALS=1 (dev seed).`,
    );
  }

  return role === "admin" ? { ...SEED_DEFAULTS.admin } : { ...SEED_DEFAULTS.student };
}
