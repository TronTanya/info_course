# CyberEdu

**CyberEdu** — интерактивная платформа курса по информационной безопасности: лекции, тесты, практика, AI-адаптация под интересы пользователя, сертификат, админ-панель.

**Визуальный бренд:** логотипы и favicon лежат в `cyberedu/frontend/public/brand/` (`logo-full.svg`, `logo-mark.svg`, `favicon.svg`); в интерфейсе используется компонент `components/brand/brand-logo.tsx`.

Исходный код и **полная документация** (стек, архитектура, Docker, демо-доступ, безопасность, сценарии) — в каталоге **[`cyberedu/`](./cyberedu/)**, файл **[`cyberedu/README.md`](./cyberedu/README.md)**.

Запуск **только через Docker** из каталога `cyberedu/`:

```bash
cp .env.example .env
docker compose up --build
```

- Сайт (Next.js): http://localhost:3100 — в Docker нужна **пересборка** образа после правок кода; для UI без пересборки см. **`cyberedu/scripts/design-live.sh`** в `cyberedu/README.md`.
- Backend (OpenAPI): http://localhost:18000/docs  
- pgAdmin: http://localhost:15050  
