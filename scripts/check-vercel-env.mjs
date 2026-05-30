const keys = [
  "DATABASE_URL",
  "DIRECT_URL",
  "AUTH_SECRET",
  "AUTH_URL",
  "NEXT_PUBLIC_APP_URL",
  "ENVIRONMENT",
  "TRUSTED_PROXY",
  "POSTGRES_PRISMA_URL",
  "POSTGRES_URL",
];
for (const key of keys) {
  const value = process.env[key]?.trim() ?? "";
  console.log(`${key}: ${value ? `set (${value.length} chars)` : "EMPTY"}`);
}
