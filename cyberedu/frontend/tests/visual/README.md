# Visual regression (Playwright)

Baseline PNG live in `__screenshots__/` (commit them with UI changes).

```bash
# Compare against baselines (CI + local)
npm run test:e2e:visual

# Refresh baselines after intentional UI change
npm run test:e2e:visual:update
```

Requires app on `PLAYWRIGHT_BASE_URL` (default `http://localhost:3100`) and seed creds for dashboard shot:

`E2E_USE_SEED_CREDENTIALS=1`
