"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { registerUser } from "@/lib/supabase/auth";

export default function RegisterPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      alert("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);

    const { error } = await registerUser(
      form.email,
      form.password
    );

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/onboarding");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-100">

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-5 rounded-2xl bg-white p-8 shadow-xl"
      >

        <h1 className="text-center text-3xl font-bold">
          Créer un compte
        </h1>

        <input
          type="email"
          placeholder="Email"
          className="w-full rounded-lg border p-3"
          value={form.email}
          onChange={(e) =>
            setForm({
              ...form,
              email: e.target.value,
            })
          }
        />

        <input
          type="password"
          placeholder="Mot de passe"
          className="w-full rounded-lg border p-3"
          value={form.password}
          onChange={(e) =>
            setForm({
              ...form,
              password: e.target.value,
            })
          }
        />

        <input
          type="password"
          placeholder="Confirmer le mot de passe"
          className="w-full rounded-lg border p-3"
          value={form.confirmPassword}
          onChange={(e) =>
            setForm({
              ...form,
              confirmPassword: e.target.value,
            })
          }
        />

        <button
          disabled={loading}
          className="w-full rounded-lg bg-emerald-600 py-3 font-semibold text-white"
        >
          {loading ? "Création..." : "Créer mon compte"}
        </button>

      </form>

    </div>
  );
}