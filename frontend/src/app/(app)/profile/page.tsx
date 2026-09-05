"use client";

import { useEffect, useMemo, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Sparkles,
  Edit3,
  Check,
  X,
  Loader2,
  Camera,
  Save,
  AlertCircle,
} from "lucide-react";

type Profile = {
  id: string;
  first_name: string;
  last_name: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  domaine: string;
  skills: string[];
  bio: string;
};

type FormErrors = {
  name?: string;
  phone?: string;
  location?: string;
  domaine?: string;
  skills?: string;
  bio?: string;
};

export default function ProfilePage() {
  const supabase = useMemo(
    () =>
      createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      ),
    []
  );

  const [profile, setProfile] = useState<Profile | null>(null);
  const [formData, setFormData] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  // ==========================================================
  // LOAD PROFILE
  // ==========================================================
  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      setLoading(true);
      setError("");

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) {
        throw new Error(authError.message);
      }

      if (!user) {
        throw new Error("Utilisateur non authentifié.");
      }

      const { data, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) {
        throw new Error(profileError.message);
      }

      const firstName = data?.first_name || "";
      const lastName = data?.last_name || "";
      const name = data?.name || `${firstName} ${lastName}`.trim();

      const profileData: Profile = {
        id: user.id,
        first_name: firstName,
        last_name: lastName,
        name,
        email: data?.email || user.email || "",
        phone: data?.phone || "",
        location: data?.location || "",
        domaine: data?.domaine || "",
        skills: normalizeSkills(data?.skills),
        bio: data?.bio || data?.summary || "",
      };

      setProfile(profileData);
      setFormData({
        ...profileData,
        skills: [...profileData.skills],
      });
    } catch (err: unknown) {
      console.error("LOAD PROFILE ERROR:", err);
      setError(
        err instanceof Error ? err.message : "Impossible de charger le profil."
      );
    } finally {
      setLoading(false);
    }
  }

  // ==========================================================
  // SKILLS NORMALIZATION
  // ==========================================================
  function normalizeSkills(value: unknown): string[] {
    if (Array.isArray(value)) {
      return value.map((item) => String(item).trim()).filter(Boolean);
    }
    if (typeof value === "string") {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
          return parsed.map((item) => String(item).trim()).filter(Boolean);
        }
      } catch {
        // Ignorer si ce n'est pas du JSON valide
      }

      return value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }

    return [];
  }

  // ==========================================================
  // INITIALS
  // ==========================================================
  function getInitials(name: string) {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "U";
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  // ==========================================================
  // UPDATE FIELD
  // ==========================================================
  function updateField(field: keyof Profile, value: string | string[]) {
    setFormData((current) => {
      if (!current) return current;
      return {
        ...current,
        [field]: value,
      };
    });

    setFormErrors((current) => ({
      ...current,
      [field]: undefined,
    }));
  }

  // ==========================================================
  // VALIDATION
  // ==========================================================
  function validateForm(): boolean {
    if (!formData) return false;
    const errors: FormErrors = {};

    const name = formData.name.trim();
    const phone = formData.phone.trim();
    const location = formData.location.trim();
    const domaine = formData.domaine.trim();
    const bio = formData.bio.trim();
    const skills = normalizeSkills(formData.skills);

    if (!name) {
      errors.name = "Le nom complet est obligatoire.";
    } else if (name.length < 2) {
      errors.name = "Le nom doit contenir au moins 2 caractères.";
    }

    if (phone) {
      const phoneRegex = /^[+0-9\s().-]{8,20}$/;
      if (!phoneRegex.test(phone)) {
        errors.phone = "Veuillez saisir un numéro de téléphone valide.";
      }
    }

    if (!location) {
      errors.location = "La localisation est obligatoire.";
    }

    if (!domaine) {
      errors.domaine = "Le domaine est obligatoire.";
    } else if (domaine.length < 2) {
      errors.domaine = "Le domaine est trop court.";
    }

    if (skills.length === 0) {
      errors.skills = "Ajoutez au moins une compétence.";
    }

    if (skills.length > 30) {
      errors.skills = "Vous pouvez ajouter au maximum 30 compétences.";
    }

    if (bio.length > 2000) {
      errors.bio = "La présentation ne doit pas dépasser 2000 caractères.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  // ==========================================================
  // SAVE
  // ==========================================================
  async function handleSave() {
    if (!profile || !formData) return;
    setError("");
    setSuccess("");

    const valid = validateForm();
    if (!valid) {
      setError("Veuillez corriger les champs indiqués.");
      return;
    }

    try {
      setSaving(true);
      const skills = normalizeSkills(formData.skills);

      const updates = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        location: formData.location.trim(),
        domaine: formData.domaine.trim(),
        skills,
        bio: formData.bio.trim(),
        updated_at: new Date().toISOString(),
      };

      const { data, error: updateError } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", profile.id)
        .select()
        .single();

      if (updateError) {
        throw new Error(updateError.message);
      }

      const updatedProfile: Profile = {
        ...profile,
        name: updates.name,
        phone: updates.phone,
        location: updates.location,
        domaine: updates.domaine,
        skills,
        bio: updates.bio,
      };

      setProfile(updatedProfile);
      setFormData({
        ...updatedProfile,
        skills: [...skills],
      });
      setIsEditing(false);
      setFormErrors({});
      setSuccess("Votre profil a été enregistré avec succès.");
    } catch (err: unknown) {
      console.error("SAVE PROFILE ERROR:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Erreur lors de la sauvegarde du profil."
      );
    } finally {
      setSaving(false);
    }
  }

  // ==========================================================
  // CANCEL
  // ==========================================================
  function handleCancel() {
    if (!profile) return;
    setFormData({
      ...profile,
      skills: [...profile.skills],
    });
    setFormErrors({});
    setError("");
    setIsEditing(false);
  }

  // ==========================================================
  // LOADING STATE
  // ==========================================================
  if (loading) {
    return (
      <div className="flex min-h-[450px] flex-col items-center justify-center p-6 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-900" />
        <p className="mt-3 text-sm text-slate-500">Chargement du profil...</p>
      </div>
    );
  }

  // ==========================================================
  // NO PROFILE / ERROR STATE
  // ==========================================================
  if (!profile || !formData) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="h-6 w-6 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-900">
                  Impossible de charger le profil
                </p>
                <p className="mt-1 text-sm text-red-700">
                  {error || "Profil introuvable."}
                </p>
                <button
                  type="button"
                  onClick={loadProfile}
                  className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white shadow transition hover:bg-red-700"
                >
                  Réessayer
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const skillsList = normalizeSkills(formData.skills);
  const initials = getInitials(profile.name);

  // ==========================================================
  // MAIN UI
  // ==========================================================
  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        
        {/* HEADER */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              Mon profil
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Gérez vos informations professionnelles et les données utilisées par le matching IA.
            </p>
          </div>

          {!isEditing ? (
            <button
              type="button"
              onClick={() => {
                setError("");
                setSuccess("");
                setIsEditing(true);
              }}
              className="flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
            >
              <Edit3 className="h-4 w-4" />
              Modifier mon profil
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCancel}
                disabled={saving}
                className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                <X className="h-4 w-4" />
                Annuler
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {saving ? "Enregistrement..." : "Enregistrer"}
              </button>
            </div>
          )}
        </div>

        {/* FEEDBACK MESSAGES */}
        {success && (
          <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <Check className="h-5 w-5 text-emerald-600" />
            <p className="text-sm font-medium text-emerald-700">{success}</p>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="text-sm font-medium text-red-700">{error}</p>
          </div>
        )}

        {/* AVATAR & EN-TÊTE PROFIL */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="h-28 bg-slate-900 sm:h-36" />
          <div className="px-5 pb-6 sm:px-8">
            <div className="-mt-12 flex flex-col gap-4 sm:-mt-14 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                <div className="relative">
                  <div className="flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-white bg-slate-800 text-2xl font-bold text-white shadow-lg sm:h-28 sm:w-28 sm:text-3xl">
                    {initials}
                  </div>
                  {isEditing && (
                    <button
                      type="button"
                      className="absolute bottom-1 right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-slate-900 text-white shadow"
                      title="Avatar"
                    >
                      <Camera className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="pb-1">
                  <h2 className="text-xl font-bold text-slate-900">
                    {profile.name || "Utilisateur"}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">{profile.email}</p>
                  {profile.domaine && (
                    <span className="mt-2 inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                      {profile.domaine}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* INFORMATIONS PERSONNELLES */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
              <User className="h-4 w-4 text-slate-700" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900">Informations personnelles</h2>
              <p className="text-xs text-slate-500">Vos informations de contact.</p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* NAME */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                Nom complet
              </label>
              {isEditing ? (
                <>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    className={`w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:ring-2 ${
                      formErrors.name
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
                        : "border-slate-300 focus:border-slate-900 focus:ring-slate-900/10"
                    }`}
                    placeholder="Votre nom complet"
                  />
                  {formErrors.name && (
                    <p className="mt-1 text-xs text-red-600">{formErrors.name}</p>
                  )}
                </>
              ) : (
                <p className="text-sm font-medium text-slate-800">
                  {profile.name || "Non renseigné"}
                </p>
              )}
            </div>

            {/* EMAIL */}
            <div>
              <label className="mb-1.5 flex items-center gap-1 text-xs font-semibold text-slate-600">
                <Mail className="h-3.5 w-3.5" />
                Email
              </label>
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
                <p className="text-sm font-medium text-slate-700">
                  {profile.email || "Non renseigné"}
                </p>
              </div>
              <p className="mt-1 text-[11px] text-slate-400">
                L'adresse email est liée à votre compte.
              </p>
            </div>

            {/* PHONE */}
            <div>
              <label className="mb-1.5 flex items-center gap-1 text-xs font-semibold text-slate-600">
                <Phone className="h-3.5 w-3.5" />
                Téléphone
              </label>
              {isEditing ? (
                <>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    className={`w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:ring-2 ${
                      formErrors.phone
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
                        : "border-slate-300 focus:border-slate-900 focus:ring-slate-900/10"
                    }`}
                    placeholder="+212 6 XX XX XX XX"
                  />
                  {formErrors.phone && (
                    <p className="mt-1 text-xs text-red-600">{formErrors.phone}</p>
                  )}
                </>
              ) : (
                <p className="text-sm font-medium text-slate-800">
                  {profile.phone || "Non renseigné"}
                </p>
              )}
            </div>

            {/* LOCATION */}
            <div>
              <label className="mb-1.5 flex items-center gap-1 text-xs font-semibold text-slate-600">
                <MapPin className="h-3.5 w-3.5" />
                Localisation
              </label>
              {isEditing ? (
                <>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => updateField("location", e.target.value)}
                    className={`w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:ring-2 ${
                      formErrors.location
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
                        : "border-slate-300 focus:border-slate-900 focus:ring-slate-900/10"
                    }`}
                    placeholder="Casablanca, Maroc"
                  />
                  {formErrors.location && (
                    <p className="mt-1 text-xs text-red-600">
                      {formErrors.location}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-sm font-medium text-slate-800">
                  {profile.location || "Non renseignée"}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* DOMAINE PROFESSIONNEL */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50">
              <Briefcase className="h-4 w-4 text-emerald-700" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900">Domaine professionnel</h2>
              <p className="text-xs text-slate-500">
                Utilisé pour sélectionner les offres compatibles.
              </p>
            </div>
          </div>

          {isEditing ? (
            <>
              <input
                type="text"
                value={formData.domaine}
                onChange={(e) => updateField("domaine", e.target.value)}
                placeholder="Ex: informatique"
                className={`w-full rounded-lg border bg-white px-3 py-3 text-sm text-slate-900 outline-none transition focus:ring-2 ${
                  formErrors.domaine
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
                    : "border-slate-300 focus:border-slate-900 focus:ring-slate-900/10"
                }`}
              />
              {formErrors.domaine && (
                <p className="mt-1 text-xs text-red-600">{formErrors.domaine}</p>
              )}
              <p className="mt-2 text-[11px] text-slate-400">
                Exemple : informatique, data science, développement web...
              </p>
            </>
          ) : (
            <div className="inline-flex items-center rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800">
              {profile.domaine || "Domaine non renseigné"}
            </div>
          )}
        </section>

        {/* COMPÉTENCES */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-50">
              <Sparkles className="h-4 w-4 text-green-700" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900">Compétences</h2>
              <p className="text-xs text-slate-500">
                Ces compétences sont utilisées par le matching.
              </p>
            </div>
          </div>

          {isEditing && (
            <>
              <input
                type="text"
                value={skillsList.join(", ")}
                onChange={(e) => updateField("skills", e.target.value)}
                placeholder="Python, Java, React, SQL, Docker..."
                className={`w-full rounded-lg border bg-white px-3 py-3 text-sm text-slate-900 outline-none transition focus:ring-2 ${
                  formErrors.skills
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
                    : "border-slate-300 focus:border-slate-900 focus:ring-slate-900/10"
                }`}
              />
              {formErrors.skills && (
                <p className="mt-1 text-xs text-red-600">{formErrors.skills}</p>
              )}
              <p className="mt-2 text-[11px] text-slate-400">
                Séparez les compétences par des virgules.
              </p>
            </>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            {skillsList.length === 0 ? (
              <p className="text-sm italic text-slate-400">
                Aucune compétence enregistrée.
              </p>
            ) : (
              skillsList.map((skill, index) => (
                <span
                  key={`${skill}-${index}`}
                  className="rounded-lg border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700"
                >
                  {skill}
                </span>
              ))
            )}
          </div>
        </section>

        {/* PRÉSENTATION / BIO */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="mb-6">
            <h2 className="font-bold text-slate-900">Présentation</h2>
            <p className="mt-1 text-xs text-slate-500">
              Présentez votre parcours, vos objectifs et votre expertise.
            </p>
          </div>

          {isEditing ? (
            <>
              <textarea
                rows={7}
                value={formData.bio}
                onChange={(e) => updateField("bio", e.target.value)}
                maxLength={2000}
                placeholder="Présentez brièvement votre parcours professionnel, vos compétences et vos objectifs..."
                className={`w-full resize-none rounded-lg border bg-white px-3 py-3 text-sm leading-relaxed text-slate-900 outline-none transition focus:ring-2 ${
                  formErrors.bio
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
                    : "border-slate-300 focus:border-slate-900 focus:ring-slate-900/10"
                }`}
              />
              <div className="mt-2 flex items-center justify-between">
                {formErrors.bio ? (
                  <p className="text-xs text-red-600">{formErrors.bio}</p>
                ) : (
                  <span />
                )}
                <p className="text-[11px] text-slate-400">
                  {formData.bio.length}/2000
                </p>
              </div>
            </>
          ) : (
            <p className="whitespace-pre-line text-sm leading-7 text-slate-600">
              {profile.bio || "Aucune présentation renseignée."}
            </p>
          )}
        </section>

        {/* BARRE D'ACTIONS FLOTTANTE EN MODE ÉDITION */}
        {isEditing && (
          <div className="sticky bottom-4 z-10 rounded-xl border border-slate-200 bg-white/95 p-4 shadow-lg backdrop-blur">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-slate-500">
                Vérifiez vos informations avant d'enregistrer.
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={saving}
                  className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 sm:flex-none"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50 sm:flex-none"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                  {saving ? "Sauvegarde..." : "Enregistrer"}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}