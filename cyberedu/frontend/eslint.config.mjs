import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const syncRateLimitImportRestriction = {
  paths: [
    {
      name: "@/lib/security/rate-limit",
      importNames: [
        "consumeRateLimit",
        "consumeRateLimitSyncDevOnly",
        "consumeRateLimitSyncDevOnly_DEPRECATED_DO_NOT_USE_IN_SERVER_ACTIONS",
      ],
      message:
        "Sync rate limit is dev-only. Use enforceRateLimit or enforceServerActionRateLimit (Redis async).",
    },
    {
      name: "@/lib/security/rate-limit-service",
      importNames: ["consumeRateLimitSyncDevOnly_DEPRECATED_DO_NOT_USE_IN_SERVER_ACTIONS"],
      message:
        "Sync rate limit is dev-only. Use enforceRateLimit or enforceServerActionRateLimit (Redis async).",
    },
    {
      name: "@/lib/rate-limit",
      importNames: ["consumeRateLimit"],
      message:
        "consumeRateLimit was removed. Use enforceRateLimit or enforceServerActionRateLimit (Redis async).",
    },
  ],
};

const syncRateLimitCallRestriction = {
  selector:
    'CallExpression[callee.name="consumeRateLimit"], CallExpression[callee.name="consumeRateLimitSyncDevOnly"], CallExpression[callee.name="consumeRateLimitSyncDevOnly_DEPRECATED_DO_NOT_USE_IN_SERVER_ACTIONS"]',
  message:
    "Sync rate limit is dev-only. Use await enforceRateLimit() or await enforceServerActionRateLimit().",
};

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      "no-restricted-syntax": ["error", syncRateLimitCallRestriction],
    },
  },
  {
    files: ["lib/actions/**/*.ts"],
    rules: {
      "no-restricted-imports": ["error", syncRateLimitImportRestriction],
      "no-restricted-syntax": ["error", syncRateLimitCallRestriction],
    },
  },
  {
    files: [
      "middleware.ts",
      "app/**/route.ts",
      "app/**/page.tsx",
    ],
    rules: {
      "no-restricted-imports": ["error", syncRateLimitImportRestriction],
    },
  },
  {
    files: [
      "lib/security/rate-limit-service.ts",
      "tests/**/*.ts",
      "scripts/**",
    ],
    rules: {
      "no-restricted-syntax": "off",
      "no-restricted-imports": "off",
    },
  },
]);

export default eslintConfig;
