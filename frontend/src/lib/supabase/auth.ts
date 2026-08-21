import { supabase } from "./client";

export async function registerUser(
  email: string,
  password: string
) {
  return await supabase.auth.signUp({
    email,
    password,
  });
}

export async function loginUser(
  email: string,
  password: string
) {
  return await supabase.auth.signInWithPassword({
    email,
    password,
  });
}

export async function logoutUser() {
  return await supabase.auth.signOut();
}

export async function getCurrentUser() {
  return await supabase.auth.getUser();
}