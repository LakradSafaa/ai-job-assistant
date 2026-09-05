"use client";

import { useEffect, useState, useMemo } from "react";
import { createBrowserClient } from "@supabase/ssr";
import {
  Bookmark,
  MapPin,
  Building2,
  Briefcase,
  ExternalLink,
  Trash2,
  Loader2,
  Search,
  Sparkles,
  X,
} from "lucide-react";

// ==========================================
// TYPES & INTERFACES
// ==========================================

export type JobDetail = {
  id: string;
  title?: string | null;
  company?: string | null;
  location?: string | null;
  domain?: string | null;
  domaine?: string | null;
  description?: string | null;
  url?: string | null;
  link?: string | null;
  apply_url?: string | null;
};

export type SavedJobItem = {
  id: string;
  profile_id: string;
  job_id: string;
  created_at: string;
  jobs?: JobDetail | JobDetail[] | null;
};

export type MatchItem = {
  job_id: string;
  score?: number | null;
  ai_summary?: string | null;
  recommendation?: string | null;
};

// ==========================================
// SOUS-COMPOSANTS
// ==========================================

function JobSearchInput({
  value,
  onChange,
  onClear,
}: {
  value: string;
  onChange: (val: string) => void;
  onClear: () => void;
}) {
  return (
    <div className="mb-6">
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Rechercher une offre, entreprise, localisation ou domaine..."
          className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-12 pr-12 text-sm text-slate-800 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
        />
        {value && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

function AiAnalysisCard({ match }: { match: MatchItem }) {
  if (!match.ai_summary) return null;

  return (
    <div className="mt-5 rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-emerald-700" />
        <h3 className="text-xs font-bold uppercase tracking-wide text-emerald-800">
          Analyse IA
        </h3>
      </div>

      <p className="mt-2 text-sm leading-6 text-emerald-900">
        {match.ai_summary}
      </p>

      {match.recommendation && (
        <p className="mt-2 text-sm font-semibold text-emerald-900">
          {match.recommendation}
        </p>
      )}
    </div>
  );
}

function SavedJobCard({
  saved,
  match,
  isRemoving,
  onRemove,
  onOpen,
}: {
  saved: SavedJobItem;
  match?: MatchItem;
  isRemoving: boolean;
  onRemove: (id: string) => void;
  onOpen: (job: JobDetail) => void;
}) {
  // Gestion de la relation unitaire ou tableau retournée par Supabase
  const job = Array.isArray(saved.jobs) ? saved.jobs[0] : saved.jobs;

  if (!job) return null;

  const score = match?.score != null ? Number(match.score) : null;

  const getScoreBadgeClass = (s: number) => {
    if (s >= 80) return "bg-emerald-100 text-emerald-800 border-emerald-200";
    if (s >= 60) return "bg-amber-100 text-amber-800 border-amber-200";
    if (s >= 40) return "bg-orange-100 text-orange-800 border-orange-200";
    return "bg-slate-100 text-slate-700 border-slate-200";
  };

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      <div className="p-5 sm:p-6">
        {/* HEADER CARTE */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex items-start gap-3">
              <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 sm:flex">
                <Briefcase className="h-5 w-5 text-slate-500" />
              </div>

              <div className="min-w-0">
                <h2 className="text-lg font-bold leading-7 text-slate-900 sm:text-xl">
                  {job.title || "Titre non spécifié"}
                </h2>

                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <Building2 className="h-4 w-4" />
                    {job.company || "Entreprise non spécifiée"}
                  </span>

                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" />
                    {job.location || "Localisation non spécifiée"}
                  </span>
                </div>

                {(job.domain || job.domaine) && (
                  <span className="mt-3 inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
                    {job.domain || job.domaine}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* BADGE SCORE */}
          {score !== null && (
            <div
              className={`w-fit rounded-full border px-4 py-2 text-sm font-bold ${getScoreBadgeClass(
                score
              )}`}
            >
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                {score}% Match
              </div>
            </div>
          )}
        </div>

        {/* DESCRIPTION */}
        {job.description && (
          <div className="mt-5">
            <p className="line-clamp-3 text-sm leading-6 text-slate-600">
              {job.description}
            </p>
          </div>
        )}

        {/* ANALYSE IA */}
        {match && <AiAnalysisCard match={match} />}

        {/* ACTIONS */}
        <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-5">
          <button
            type="button"
            onClick={() => onOpen(job)}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800"
          >
            <ExternalLink className="h-4 w-4" />
            Voir l'offre
          </button>

          <button
            type="button"
            onClick={() => onRemove(saved.id)}
            disabled={isRemoving}
            className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isRemoving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            {isRemoving ? "Suppression..." : "Retirer"}
          </button>
        </div>
      </div>
    </article>
  );
}

// ==========================================
// PAGE PRINCIPALE
// ==========================================

export default function SavedJobsPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [savedJobs, setSavedJobs] = useState<SavedJobItem[]>([]);
  const [matches, setMatches] = useState<MatchItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadSavedJobs();
  }, []);

  async function loadSavedJobs() {
    try {
      setLoading(true);
      setError("");

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("Utilisateur non authentifié.");
      }

      const { data, error: savedError } = await supabase
        .from("saved_jobs")
        .select(
          `
          id,
          profile_id,
          job_id,
          created_at,
          jobs (
            id,
            title,
            company,
            location,
            domain,
            domaine,
            description,
            url,
            link,
            apply_url
          )
        `
        )
        .eq("profile_id", user.id)
        .order("created_at", { ascending: false });

      if (savedError) throw savedError;

      const { data: matchData, error: matchError } = await supabase
        .from("job_matches")
        .select("job_id, score, ai_summary, recommendation")
        .eq("profile_id", user.id);

      if (matchError) {
        console.warn("Erreur récuperation des scores:", matchError);
      }

      setSavedJobs((data || []) as SavedJobItem[]);
      setMatches((matchData || []) as MatchItem[]);
    } catch (err: any) {
      console.error("LOAD SAVED JOBS ERROR:", err);
      setError(
        err?.message || "Impossible de charger les offres sauvegardées."
      );
    } finally {
      setLoading(false);
    }
  }

  async function removeSavedJob(savedId: string) {
    try {
      setRemovingId(savedId);
      setError("");

      const { error } = await supabase
        .from("saved_jobs")
        .delete()
        .eq("id", savedId);

      if (error) throw error;

      setSavedJobs((current) =>
        current.filter((job) => String(job.id) !== String(savedId))
      );
    } catch (err: any) {
      console.error("REMOVE SAVED JOB ERROR:", err);
      setError(err?.message || "Impossible de retirer cette offre.");
    } finally {
      setRemovingId(null);
    }
  }

  function openJob(job: JobDetail) {
    const url = job.apply_url || job.url || job.link;
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
      return;
    }
    alert("Le lien de candidature n'est pas disponible pour cette offre.");
  }

  const filteredJobs = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    if (!search) return savedJobs;

    return savedJobs.filter((saved) => {
      const job = Array.isArray(saved.jobs) ? saved.jobs[0] : saved.jobs;
      if (!job) return false;

      return (
        job.title?.toLowerCase().includes(search) ||
        job.company?.toLowerCase().includes(search) ||
        job.location?.toLowerCase().includes(search) ||
        job.domain?.toLowerCase().includes(search) ||
        job.domaine?.toLowerCase().includes(search) ||
        job.description?.toLowerCase().includes(search)
      );
    });
  }, [savedJobs, searchTerm]);

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl">
        {/* EN-TÊTE PAGE */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100">
              <Bookmark className="h-5 w-5 text-emerald-700" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                Offres sauvegardées
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Retrouvez les offres que vous souhaitez consulter ou auxquelles vous souhaitez postuler.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <p className="text-xs font-medium text-slate-400">
              OFFRES SAUVEGARDÉES
            </p>
            <p className="mt-1 text-xl font-bold text-slate-900">
              {savedJobs.length}
            </p>
          </div>
        </div>

        {/* AFFICHAGE ERREUR */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <p className="font-semibold">Erreur</p>
            <p className="mt-1">{error}</p>
          </div>
        )}

        {/* CHAMP DE RECHERCHE */}
        {!loading && savedJobs.length > 0 && (
          <JobSearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            onClear={() => setSearchTerm("")}
          />
        )}

        {/* ÉTATS CHARGEMENT / VIDE / LISTE */}
        {loading ? (
          <div className="flex min-h-[400px] items-center justify-center rounded-2xl border border-slate-200 bg-white">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-700" />
              <p className="text-sm text-slate-500">
                Chargement des offres sauvegardées...
              </p>
            </div>
          </div>
        ) : savedJobs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
              <Bookmark className="h-8 w-8 text-slate-400" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">
              Aucune offre sauvegardée
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Lorsque vous trouverez une offre intéressante, sauvegardez-la pour la retrouver facilement ici.
            </p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <Search className="mx-auto h-10 w-10 text-slate-300" />
            <h2 className="mt-4 text-lg font-semibold text-slate-900">
              Aucune offre trouvée
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Essayez avec un autre terme de recherche.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {filteredJobs.map((saved) => {
              const jobId = Array.isArray(saved.jobs)
                ? saved.jobs[0]?.id
                : saved.jobs?.id;

              const match = matches.find(
                (m) => String(m.job_id) === String(jobId)
              );

              return (
                <SavedJobCard
                  key={saved.id}
                  saved={saved}
                  match={match}
                  isRemoving={removingId === saved.id}
                  onRemove={removeSavedJob}
                  onOpen={openJob}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}