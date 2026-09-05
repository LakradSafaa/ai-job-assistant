import { createClient as createSupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error(
    "NEXT_PUBLIC_SUPABASE_URL est manquante."
  );
}

if (!supabaseAnonKey) {
  throw new Error(
    "NEXT_PUBLIC_SUPABASE_ANON_KEY est manquante."
  );
}

/**
 * Client Supabase principal utilisé côté frontend.
 */
export const supabase = createSupabaseClient(
  supabaseUrl,
  supabaseAnonKey
);

/**
 * Compatibilité avec les fichiers qui utilisent :
 *
 * import { createClient } from "@/lib/supabase/client";
 */
export function createClient() {
  return supabase;
}