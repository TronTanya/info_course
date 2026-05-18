# Сертификаты (PDF, шаблон, скачивание)

## Как выдаётся сертификат

1. Студент завершает **все активные модули** курса (`moduleCompleted`).
2. В кабинете: «Получить сертификат» → `issueCertificate()` создаёт запись в БД и PDF на диске.
3. Скачивание: `GET /api/certificates/download/[certificateId]` (только владелец или ADMIN).
4. Публичная проверка: `/certificate/verify/<verificationCode>`.

Файл хранится в volume `frontend_uploads` → `certificates/{id}.pdf` ([STORAGE.md](./STORAGE.md)).

## Скачивание не работает

| Симптом | Причина | Решение |
|---------|---------|---------|
| `Offset is outside the bounds of the DataView` | Шрифты PDF были в **WOFF2**; `@react-pdf` их не читает | Исправлено: в `lib/certificate-pdf.tsx` зарегистрированы **`.woff`**. Перезапустите `npm run dev` и скачайте снова (PDF пересоберётся, если файла нет). |
| «Font family not registered» | В Docker standalone не скопированы `@fontsource/roboto` / `@react-pdf` | См. `frontend/Dockerfile` (COPY шрифтов). Пересоберите образ. |
| 404 | Чужой сертификат или неверный id | Войти под владельцем или ADMIN. |

Локальная проверка генерации:

```bash
cd cyberedu/frontend
npm test -- tests/certificate-pdf.test.ts
```

## Шаблон сертификата

Визуальный макет — **код**, не Word/HTML:

| Файл | Назначение |
|------|------------|
| [`frontend/lib/certificate-pdf.tsx`](../frontend/lib/certificate-pdf.tsx) | Макет A4 landscape: рамки, логотип (SVG), тексты, таблица дат, QR |
| [`frontend/lib/certificate.ts`](../frontend/lib/certificate.ts) | Данные из БД, QR, вызов `renderToBuffer`, сохранение файла |

### Быстрая настройка без правки макета

В `frontend/.env` (или production env):

```env
CERTIFICATE_ORG_LINE=ГАПОУ «ЯКСИТ»
CERTIFICATE_SIGNATORY_LINE=Директор учебного центра
```

Подставляются в блок подписи внизу PDF.

### Изменить дизайн (цвета, тексты, логотип)

1. Откройте `certificate-pdf.tsx`.
2. **`StyleSheet.create({ ... })`** — цвета (`#22d3ee`, `#0b1220`), отступы, шрифты.
3. **`CertificatePdfDocument`** — заголовок «Сертификат», подзаголовок, формулировка body.
4. **`CertificateBrandMarkPdf`** — SVG-щит в шапке (или замените на `<Image src="...">` с PNG в `public/`).
5. После правок: `npm test -- tests/certificate-pdf.test.ts`, затем в UI — повторная выдача/скачивание.

Дополнительно можно вынести константы в `lib/certificate-template.ts` (название бренда, слоган) — по желанию команды.

### Формат и технологии

- **@react-pdf/renderer** — React-компоненты → PDF.
- Шрифт **Roboto** (кириллица): только **WOFF** из `@fontsource/roboto`.
- QR: `qrcode` → data URL → `<Image src={qrDataUrl} />`.

Для сложного дизайна (фоновая картинка, печать) добавьте полноразмерный PNG/JPEG фон:

```tsx
<Image src="/certificate-background.png" style={{ position: "absolute", ... }} />
```

(файл положить в `public/` и учесть копирование в Docker `public/`.)
