/**
 * Базовый HTTP-клиент к FastAPI backend.
 * На этом этапе — тонкая обёртка над fetch; дальше можно заменить на сгенерированный SDK.
 */
const base = () => (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(/\/$/, "");

export async function apiGet<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${base()}${path.startsWith("/") ? path : `/${path}`}`, {
    ...init,
    method: "GET",
    headers: {
      Accept: "application/json",
      ...init?.headers,
    },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`API ${res.status}: ${res.statusText}`);
  }
  return (await res.json()) as T;
}
