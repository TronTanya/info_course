# Upload storage (local volume / S3 roadmap)

## Текущая реализация

| Аспект | Поведение |
|--------|-----------|
| **Код** | `cyberedu/frontend/lib/storage/` — `StorageService` + `LocalStorageService` |
| **Namespaces** | `practice/`, `avatars/`, `certificates/` под `UPLOADS_DIR` |
| **Docker prod** | Named volume `frontend_uploads` → `/app/uploads` ([`docker-compose.prod.yml`](../docker-compose.prod.yml)) |
| **Путь в БД** | Не абсолютный путь на диске: `Submission.fileUrl` → `/api/practice/download?id=…`; `User.avatarUrl` → API или пресет; сертификаты — id + файл `{id}.pdf` |
| **Публичный доступ** | Нет прямой раздачи с диска: только API с auth (`/api/practice/download`, `/api/profile/avatar/image`, `/api/certificates/download/…`) |
| **Validation** | `lib/security/upload-sandbox.ts` — расширения, path traversal; magic bytes + size — `practice-files.ts`, `avatar-upload.ts` |
| **Cleanup** | Замена аватара — `deleteByPrefix`; practice — `deletePracticeFile` по submission id |
| **Rate limit** | `upload` preset в `withApiGuard` |

## Риск: local volume и несколько реплик

**`UPLOAD_STORAGE_DRIVER=local` (по умолчанию) поддержан только для single-node / одной реплики frontend.**

При горизонтальном масштабировании (2+ контейнера frontend без shared filesystem):

- загрузка на реплику A не видна на реплике B;
- health/read может давать 404 для файлов с другой ноды.

**Митигация до S3:**

1. Одна реплика frontend **или** shared NFS/EFS (вне scope репозитория).
2. Бэкап volume `frontend_uploads` ([`migrations/UPLOADS_VOLUME.md`](./migrations/UPLOADS_VOLUME.md)).
3. Не включать `UPLOAD_STORAGE_DRIVER=s3` до готовой реализации.

## Переменные окружения

| Переменная | Default | Назначение |
|------------|---------|------------|
| `UPLOAD_STORAGE_DRIVER` | `local` | `local` \| `s3` (s3 **не реализован**) |
| `STORAGE_DRIVER` | — | Legacy alias для `UPLOAD_STORAGE_DRIVER` |
| `UPLOADS_DIR` | `<cwd>/uploads` | Корень local storage; в compose: `/app/uploads` |

При `UPLOAD_STORAGE_DRIVER=s3` (будущее) потребуются:

- `S3_ENDPOINT`
- `S3_BUCKET`
- `S3_ACCESS_KEY_ID`
- `S3_SECRET_ACCESS_KEY`
- `S3_REGION`

Сейчас при `s3` приложение **падает при старте загрузки** с явной ошибкой (env + «not implemented»).

## Абстракция в коде

```
lib/storage/
  types.ts           — StorageService (используется сейчас)
  local-storage.ts   — LocalStorageProvider (production-ready)
  s3-storage.ts      — skeleton, NOT IMPLEMENTED
  s3-config.ts       — валидация env для s3
  provider-types.ts  — StorageProvider (целевой контракт для S3)
  index.ts           — getStorageService()
```

Высокоуровневый `StorageProvider` (`putObject` / `getObjectUrl` / `deleteObject`) — для будущего адаптера; call sites остаются на `StorageService`, чтобы не ломать uploads.

## Миграция на S3 (план)

1. Реализовать `createS3StorageService()` (AWS SDK v3 или `@aws-sdk/client-s3` + MinIO).
2. Integration-тесты с MinIO в CI (отдельный job).
3. Скрипт миграции: copy `frontend_uploads` → bucket с префиксами `practice/`, `avatars/`, `certificates/`.
4. На multi-replica: presigned URLs или proxy read через API (как сейчас для practice).
5. Включить `UPLOAD_STORAGE_DRIVER=s3` только после checklist в go-live.

## Проверки

```bash
cd cyberedu/frontend
npm run test -- tests/storage-service.test.ts tests/security-upload.test.ts
# volume в prod compose:
grep -A2 frontend_uploads ../docker-compose.prod.yml
```
