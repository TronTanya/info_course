import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

import { requireSupabaseEnv } from "@/lib/supabase/env";

let browserClient: SupabaseClient | undefined;

/** Browser / Client Components. */
export function createClient(): SupabaseClient {
  if (browserClient) return browserClient;
  const { url, publishableKey } = requireSupabaseEnv();
  browserClient = createBrowserClient(url, publishableKey);
  return browserClient;
}
