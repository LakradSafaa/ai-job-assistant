"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  UserPlus,
  Check,
  X,
  Loader2,
  ArrowRight,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

import { registerUser } from "@/lib/supabase/auth";

type FormState = {
  email: string;
  password: string;
  confirmPassword: string;
};

export default function RegisterPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState<FormState>({
    email: "",
    password: "",
    confirmPassword: "",
  });

  /**
   * ---------------------------------------------------------
   * PASSWORD RULES
   * ---------------------------------------------------------
   */
  const passwordRules = {
    minLength: form.password.length >= 8,
    hasNumber: /\d/.test(form.password),
    hasUppercase: /[A-Z]/.test(form.password),
    hasLowercase: /[a-z]/.test(form.password),
  };

  const passwordScore = Object.values(passwordRules).filter(
    Boolean
  ).length;

  const passwordStrength =
    passwordScore === 0
      ? {
          label: "",
          width: "0%",
        }
      : passwordScore <= 1
      ? {
          label: "Faible",
          width: "25%",
        }
      : passwordScore === 2
      ? {
          label: "Moyen",
          width: "50%",
        }
      : passwordScore === 3
      ? {
          label: "Bon",
          width: "75%",
        }
      : {
          label: "Excellent",
          width: "100%",
        };

  /**
   * ---------------------------------------------------------
   * HANDLE INPUT
   * ---------------------------------------------------------
   */
  function updateField(
    field: keyof FormState,
    value: string
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    setError("");
    setSuccess("");
  }

  /**
   * ---------------------------------------------------------
   * VALIDATION
   * ---------------------------------------------------------
   */
  function validateForm() {
    const email = form.email.trim();

    if (!email) {
      return "Veuillez saisir votre adresse email.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return "Veuillez saisir une adresse email valide.";
    }

    if (!form.password) {
      return "Veuillez saisir un mot de passe.";
    }

    if (form.password.length < 8) {
      return "Le mot de passe doit contenir au moins 8 caractères.";
    }

    if (!/[A-Z]/.test(form.password)) {
      return "Le mot de passe doit contenir au moins une lettre majuscule.";
    }

    if (!/[a-z]/.test(form.password)) {
      return "Le mot de passe doit contenir au moins une lettre minuscule.";
    }

    if (!/\d/.test(form.password)) {
      return "Le mot de passe doit contenir au moins un chiffre.";
    }

    if (!form.confirmPassword) {
      return "Veuillez confirmer votre mot de passe.";
    }

    if (form.password !== form.confirmPassword) {
      return "Les mots de passe ne correspondent pas.";
    }

    return null;
  }

  /**
   * ---------------------------------------------------------
   * SUBMIT
   * ---------------------------------------------------------
   */
  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (loading) return;

    setError("");
    setSuccess("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const { error: registerError } = await registerUser(
        form.email.trim().toLowerCase(),
        form.password
      );

      if (registerError) {
        console.error(
          "REGISTER_ERROR:",
          registerError
        );

        let message =
          "Impossible de créer votre compte.";

        const errorMessage =
          registerError.message?.toLowerCase() || "";

        if (
          errorMessage.includes(
            "user already registered"
          ) ||
          errorMessage.includes(
            "already registered"
          )
        ) {
          message =
            "Un compte existe déjà avec cette adresse email.";
        } else if (
          errorMessage.includes("invalid email")
        ) {
          message =
            "L'adresse email est invalide.";
        } else if (
          errorMessage.includes("password")
        ) {
          message =
            "Le mot de passe ne respecte pas les exigences de sécurité.";
        } else if (
          errorMessage.includes("rate limit")
        ) {
          message =
            "Trop de tentatives. Veuillez patienter quelques instants.";
        } else if (registerError.message) {
          message = registerError.message;
        }

        setError(message);
        return;
      }

      setSuccess(
        "Votre compte a été créé avec succès. Redirection..."
      );

      /**
       * Small delay so the success message is visible.
       */
      setTimeout(() => {
        router.push("/onboarding");
        router.refresh();
      }, 700);
    } catch (err) {
      console.error(
        "REGISTER_UNEXPECTED_ERROR:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Une erreur inattendue est survenue."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* ===================================================
            LEFT — BRANDING
        ==================================================== */}
        <section className="relative hidden overflow-hidden bg-green-600 lg:flex">
          {/* Decorative background */}
          <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-green-900/20 blur-3xl" />

          <div className="relative z-10 flex w-full flex-col justify-between p-12 xl:p-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-lg">
                <Sparkles className="h-5 w-5 text-green-600" />
              </div>

              <div>
                <p className="text-lg font-bold text-white">
                  AI Job Assistant
                </p>

                <p className="text-xs text-green-100">
                  Smart Career Platform
                </p>
              </div>
            </div>

            {/* Main content */}
            <div className="max-w-xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur">
                <Sparkles className="h-4 w-4" />
                Votre carrière, propulsée par l'IA
              </div>

              <h1 className="text-4xl font-bold leading-tight text-white xl:text-5xl">
                Trouvez les bonnes opportunités,
                <span className="block text-green-100">
                  plus intelligemment.
                </span>
              </h1>

              <p className="mt-6 max-w-lg text-base leading-7 text-green-50">
                Créez votre profil, découvrez les offres
                adaptées à vos compétences et générez
                automatiquement des CV et lettres de
                motivation personnalisés.
              </p>

              {/* Features */}
              <div className="mt-10 space-y-4">
                <Feature
                  title="CV personnalisés"
                  description="Un CV adapté à chaque opportunité."
                />

                <Feature
                  title="Lettres de motivation IA"
                  description="Des lettres adaptées à chaque entreprise."
                />

                <Feature
                  title="Suivi des candidatures"
                  description="Centralisez toutes vos candidatures."
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center gap-2 text-sm text-green-100">
              <ShieldCheck className="h-4 w-4" />
              Vos données restent protégées
            </div>
          </div>
        </section>

        {/* ===================================================
            RIGHT — REGISTER FORM
        ==================================================== */}
        <section className="flex items-center justify-center px-5 py-10 sm:px-8 lg:px-12">
          <div className="w-full max-w-md">
            {/* Mobile logo */}
            <div className="mb-8 flex items-center justify-center gap-3 lg:hidden">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100">
                <Sparkles className="h-5 w-5 text-green-600" />
              </div>

              <div>
                <p className="font-bold text-slate-900">
                  AI Job Assistant
                </p>

                <p className="text-xs text-slate-500">
                  Smart Career Platform
                </p>
              </div>
            </div>

            {/* Header */}
            <div className="mb-8">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100">
                <UserPlus className="h-6 w-6 text-green-600" />
              </div>

              <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                Créer votre compte
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Commencez gratuitement et construisez votre
                prochaine opportunité professionnelle.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div
                role="alert"
                className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4"
              >
                <X className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

                <p className="text-sm font-medium leading-5 text-red-700">
                  {error}
                </p>
              </div>
            )}

            {/* Success */}
            {success && (
              <div
                role="status"
                className="mb-5 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4"
              >
                <Check className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />

                <p className="text-sm font-medium leading-5 text-green-700">
                  {success}
                </p>
              </div>
            )}

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              {/* EMAIL */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Adresse email
                </label>

                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="vous@exemple.com"
                    value={form.email}
                    onChange={(e) =>
                      updateField(
                        "email",
                        e.target.value
                      )
                    }
                    disabled={loading}
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-12 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-green-500 focus:ring-4 focus:ring-green-500/10 disabled:cursor-not-allowed disabled:bg-slate-100"
                  />
                </div>
              </div>

              {/* PASSWORD */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Mot de passe
                </label>

                <div className="relative">
                  <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                  <input
                    id="password"
                    name="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    autoComplete="new-password"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) =>
                      updateField(
                        "password",
                        e.target.value
                      )
                    }
                    disabled={loading}
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-12 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-green-500 focus:ring-4 focus:ring-green-500/10 disabled:cursor-not-allowed disabled:bg-slate-100"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (previous) => !previous
                      )
                    }
                    disabled={loading}
                    aria-label={
                      showPassword
                        ? "Masquer le mot de passe"
                        : "Afficher le mot de passe"
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>

                {/* Strength */}
                {form.password && (
                  <div className="mt-3">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs text-slate-500">
                        Force du mot de passe
                      </span>

                      <span className="text-xs font-semibold text-slate-700">
                        {passwordStrength.label}
                      </span>
                    </div>

                    <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-green-500 transition-all duration-300"
                        style={{
                          width:
                            passwordStrength.width,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* PASSWORD REQUIREMENTS */}
              {form.password && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="mb-3 text-xs font-semibold text-slate-700">
                    Votre mot de passe doit contenir :
                  </p>

                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <PasswordRule
                      valid={
                        passwordRules.minLength
                      }
                      text="8 caractères minimum"
                    />

                    <PasswordRule
                      valid={
                        passwordRules.hasUppercase
                      }
                      text="Une majuscule"
                    />

                    <PasswordRule
                      valid={
                        passwordRules.hasLowercase
                      }
                      text="Une minuscule"
                    />

                    <PasswordRule
                      valid={
                        passwordRules.hasNumber
                      }
                      text="Un chiffre"
                    />
                  </div>
                </div>
              )}

              {/* CONFIRM PASSWORD */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Confirmer le mot de passe
                </label>

                <div className="relative">
                  <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    autoComplete="new-password"
                    placeholder="••••••••"
                    value={form.confirmPassword}
                    onChange={(e) =>
                      updateField(
                        "confirmPassword",
                        e.target.value
                      )
                    }
                    disabled={loading}
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-12 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-green-500 focus:ring-4 focus:ring-green-500/10 disabled:cursor-not-allowed disabled:bg-slate-100"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(
                        (previous) => !previous
                      )
                    }
                    disabled={loading}
                    aria-label={
                      showConfirmPassword
                        ? "Masquer la confirmation"
                        : "Afficher la confirmation"
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>

                {form.confirmPassword && (
                  <div
                    className={`mt-2 flex items-center gap-1.5 text-xs font-medium ${
                      form.password ===
                      form.confirmPassword
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {form.password ===
                    form.confirmPassword ? (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        Les mots de passe correspondent
                      </>
                    ) : (
                      <>
                        <X className="h-3.5 w-3.5" />
                        Les mots de passe ne correspondent
                        pas
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* TERMS */}
              <p className="text-xs leading-5 text-slate-500">
                En créant un compte, vous acceptez les
                conditions d'utilisation et la politique de
                confidentialité de la plateforme.
              </p>

              {/* SUBMIT */}
              <button
                type="submit"
                disabled={loading}
                className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-5 text-sm font-bold text-white shadow-sm transition-all hover:bg-green-700 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-green-500/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Création du compte...
                  </>
                ) : (
                  <>
                    Créer mon compte
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>

            {/* LOGIN */}
            <div className="mt-7 border-t border-slate-200 pt-6 text-center">
              <p className="text-sm text-slate-500">
                Vous avez déjà un compte ?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-green-600 transition hover:text-green-700"
                >
                  Se connecter
                </Link>
              </p>
            </div>

            {/* Security */}
            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="h-4 w-4" />
              Inscription sécurisée
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

/**
 * ---------------------------------------------------------
 * FEATURE COMPONENT
 * ---------------------------------------------------------
 */
function Feature({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/15">
        <Check className="h-4 w-4 text-white" />
      </div>

      <div>
        <p className="font-semibold text-white">
          {title}
        </p>

        <p className="mt-1 text-sm text-green-100">
          {description}
        </p>
      </div>
    </div>
  );
}

/**
 * ---------------------------------------------------------
 * PASSWORD RULE
 * ---------------------------------------------------------
 */
function PasswordRule({
  valid,
  text,
}: {
  valid: boolean;
  text: string;
}) {
  return (
    <div
      className={`flex items-center gap-2 text-xs ${
        valid
          ? "text-green-600"
          : "text-slate-500"
      }`}
    >
      <span
        className={`flex h-4 w-4 items-center justify-center rounded-full ${
          valid
            ? "bg-green-100"
            : "bg-slate-200"
        }`}
      >
        {valid && (
          <Check className="h-2.5 w-2.5" />
        )}
      </span>

      {text}
    </div>
  );
}