import { Alert } from "@/components/ui/alert";

export function AdminDbUnavailableBanner() {
  return (
    <Alert variant="danger" title="База данных временно недоступна">
      <div className="space-y-2 text-sm">
        <p>
          Prisma не подключается к Supabase pooler с этого ПК (часто на Windows). Данные в облаке
          сохранены — проблема только в локальном TCP-подключении.
        </p>
        <p>
          <strong>Вариант 1:</strong> Supabase Dashboard → Connect → Prisma — скопируйте актуальные
          строки в <code className="rounded bg-muted px-1">cyberedu/frontend/.env</code>, затем
          перезапустите <code className="rounded bg-muted px-1">npm run dev</code>.
        </p>
        <p>
          <strong>Вариант 2 (надёжнее):</strong> Docker Desktop → в каталоге{" "}
          <code className="rounded bg-muted px-1">cyberedu</code>:{" "}
          <code className="rounded bg-muted px-1">docker compose up -d postgres</code>. Скопируйте{" "}
          <code className="rounded bg-muted px-1">.env.local.example</code> в{" "}
          <code className="rounded bg-muted px-1">.env.local</code> (локальный Postgres, порт 15432).
        </p>
      </div>
    </Alert>
  );
}
