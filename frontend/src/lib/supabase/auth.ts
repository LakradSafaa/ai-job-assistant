import { supabase } from "./client";

/**
 * Créer un nouveau compte
 */
export async function registerUser(
  email: string,
  password: string
) {
  return await supabase.auth.signUp({
    email: email.trim().toLowerCase(),
    password,
  });
}

/**
 * Se connecter
 */
export async function loginUser(
  email: string,
  password: string
) {
  return await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });
}

/**
 * Se déconnecter
 */
export async function logoutUser() {
  return await supabase.auth.signOut();
}

/**
 * Récupérer l'utilisateur actuellement connecté
 */
export async function getCurrentUser() {
  return await supabase.auth.getUser();
}