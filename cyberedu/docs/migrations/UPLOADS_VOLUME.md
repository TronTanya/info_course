# Persistent uploads volume

> Полное описание рисков, API и S3 roadmap: **[STORAGE.md](../STORAGE.md)**.

## Проблема

До unified volume practice- и avatar-файлы писались в `/app/uploads/...` **без** bind/named volume (в dev — только `certificates` был на volume). При `docker compose up --force-recreate` файлы терялись.

## Решение (single-node)

1. Named volume `frontend_uploads` → `/app/uploads` (dev и prod) — **persistent**.
2. `UPLOADS_DIR=/app/uploads` в compose.
3. `UPLOAD_STORAGE_DRIVER=local` (default).
4. Код: `StorageService` (`lib/storage/`) — namespaces:
   - `practice/` — вложения практикумов
   - `avatars/` — пользовательские аватары
   - `certificates/` — PDF сертификатов

**Multi-replica:** local volume **не подходит** без shared FS — см. [STORAGE.md § риск](../STORAGE.md#риск-local-volume-и-несколько-реплик).

## Миграция существующего деплоя

Если в production уже есть PDF в старом volume только для `certificates`:

```bash
docker run --rm -v OLD_CERT_VOL:/from -v cyberedu-prod_frontend_uploads:/to alpine \
  sh -c "mkdir -p /to/certificates && cp -a /from/. /to/certificates/ 2>/dev/null || true"
```

## Локальная разработка вне Docker

По умолчанию: `<frontend>/uploads/`. Опционально: `UPLOADS_DIR=/path/to/writable/dir`.

## Будущее: S3

`UPLOAD_STORAGE_DRIVER=s3` — env (`S3_ENDPOINT`, `S3_BUCKET`, …) проверяется, **runtime не реализован** (`lib/storage/s3-storage.ts` — skeleton). Не включать в production до готовности и тестов.
