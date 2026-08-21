"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { supabase } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const cleanEmail = email.trim();

      if (!cleanEmail) {
        throw new Error(
          "Veuillez saisir votre adresse email."
        );
      }

      if (!password) {
        throw new Error(
          "Veuillez saisir votre mot de passe."
        );
      }

      const { error: loginError } =
        await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

      if (loginError) {
        throw loginError;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      console.error(
        "Erreur connexion :",
        err
      );

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(
          "Impossible de se connecter."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-black text-[#1F2937]">
          Bon retour 👋
        </h1>

        <p className="mt-3 text-stone-500">
          Connectez-vous à votre compte.
        </p>
      </div>

      <form
        onSubmit={handleLogin}
        className="space-y-4"
      >
        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-medium text-[#1F2937]"
          >
            Adresse email
          </label>

          <Input
            id="email"
            type="email"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            placeholder="Adresse email"
            autoComplete="email"
            disabled={loading}
            required
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-2 block text-sm font-medium text-[#1F2937]"
          >
            Mot de passe
          </label>

          <Input
            id="password"
            type="password"
            value={password}
            onChange={(event) =>
              setPassword(
                event.target.value
              )
            }
            placeholder="Mot de passe"
            autoComplete="current-password"
            disabled={loading}
            required
          />
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <Button
          type="submit"
          disabled={loading}
          className="h-12 w-full bg-[#1F6F5F] hover:bg-[#18584C]"
        >
          {loading
            ? "Connexion..."
            : "Se connecter"}
        </Button>
      </form>

      <p className="text-center text-sm text-stone-500">
        Vous n&apos;avez pas de compte ?{" "}
        <Link
          href="/register"
          className="font-semibold text-[#1F6F5F] hover:underline"
        >
          Créer un compte
        </Link>
      </p>
    </div>
  );
}