/**
 * Supabase API (Storage, Realtime, Data API). Postgres остаётся на Prisma + DATABASE_URL.
 */
export function getSupabaseUrl(): string | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  return url || null;
}

/** Publishable (sb_publishable_…) или legacy anon key. */
export function getSupabasePublishableKey(): string | null {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    null
  );
}

export function isSupabaseConfigured(): boolean {
  return Boolean(getSupabaseUrl() && getSupabasePublishableKey());
}

export function requireSupabaseEnv(): { url: string; publishableKey: string } {
  const url = getSupabaseUrl();
  const publishableKey = getSupabasePublishableKey();
  if (!url || !publishableKey) {
    throw new Error(
      "Supabase не настроен: задайте NEXT_PUBLIC_SUPABASE_URL и NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (или NEXT_PUBLIC_SUPABASE_ANON_KEY). См. cyberedu/docs/SUPABASE.md",
    );
  }
  return { url, publishableKey };
}
