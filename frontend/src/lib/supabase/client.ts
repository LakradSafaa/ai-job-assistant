import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL est manquante.");
}

if (!supabaseAnonKey) {
  throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY est manquante.");
}

/**
 * Client Supabase côté navigateur gérant les cookies SSR
 */
export function createClient() {
  return createBrowserClient(supabaseUrl!, supabaseAnonKey!);
}

/**
 * Export de compatibilité pour les fichiers utilisant `import { supabase }`
 */
export const supabase = createClient();
