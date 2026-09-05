"use client";

import { useEffect, useMemo, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import {
  Target,
  MapPin,
  Building2,
  ExternalLink,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Briefcase,
  Search,
  X,
} from "lucide-react";

type Job = {
  id: string;
  title?: string | null;
  company?: string | null;
  source?: string | null;
  location?: string | null;
  domain?: string | null;
  domaine?: string | null;
  description?: string | null;
  url?: string | null;
  link?: string | null;
  apply_url?: string | null;
};

type Match = {
  id: string | number;
  profile_id: string;
  job_id: string;
  score: number | null;
  matched_skills?: string | string[] | null;
  missing_skills?: string | string[] | null;
  ai_summary?: string | null;
  ai_analysis?: string | null;
  recommendation?: string | null;
  job?: Job | null;
};

export default function MatchingPage() {
  const supabase = useMemo(
    () =>
      createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      ),
    []
  );

  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

  useEffect(() => {
    loadMatches();
  }, []);

  async function loadMatches() {
    try {
      setLoading(true);
      setError("");

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;

      if (!user) {
        throw new Error("Utilisateur non authentifié.");
      }

      const { data: matchData, error: matchError } = await supabase
        .from("job_matches")
        .select("*")
        .eq("profile_id", user.id)
        .order("score", { ascending: false });

      if (matchError) throw matchError;

      const rawMatches = (matchData || []) as Match[];
      const jobIds = [
        ...new Set(rawMatches.map((m) => String(m.job_id)).filter(Boolean)),
      ];

      let jobs: Job[] = [];

      if (jobIds.length > 0) {
        const { data: jobData, error: jobsError } = await supabase
          .from("jobs")
          .select(
            `
              id,
              title,
              company,
              source,
              location,
              domain,
              domaine,
              description,
              url,
              link,
              apply_url
            `
          )
          .in("id", jobIds);

        if (jobsError) {
          console.error("JOBS ERROR:", jobsError);
        } else {
          jobs = (jobData || []) as Job[];
        }
      }

      const formattedMatches = rawMatches.map((match) => ({
        ...match,
        job:
          jobs.find((job) => String(job.id) === String(match.job_id)) || null,
      }));

      setMatches(formattedMatches);
    } catch (err: unknown) {
      console.error("MATCHING LOAD ERROR:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Impossible de charger les résultats du matching."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  async function handleRefresh() {
    if (refreshing) return;
    setRefreshing(true);
    await loadMatches();
  }

  function parseSkills(value?: string | string[] | null): string[] {
    if (!value) return [];
    if (Array.isArray(value)) {
      return value.map((item) => String(item).trim()).filter(Boolean);
    }

    const text = String(value).trim();
    if (!text) return [];

    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => String(item).trim()).filter(Boolean);
      }
    } catch {
      // Pas du JSON
    }

    return text
      .replace(/^\[|\]$/g, "")
      .split(",")
      .map((item) => item.replace(/^["']|["']$/g, "").trim())
      .filter(Boolean);
  }

  function getScore(match: Match) {
    return Math.max(0, Math.min(100, Number(match.score || 0)));
  }

  function getScoreLabel(score: number) {
    if (score >= 80) return "Excellent match";
    if (score >= 65) return "Bon match";
    if (score >= 50) return "Match moyen";
    return "Match faible";
  }

  function getScoreClasses(score: number) {
    if (score >= 80) {
      return {
        badge: "bg-emerald-100 text-emerald-800 border-emerald-200",
        bar: "bg-emerald-500",
        icon: "text-emerald-600",
      };
    }
    if (score >= 65) {
      return {
        badge: "bg-amber-100 text-amber-800 border-amber-200",
        bar: "bg-amber-500",
        icon: "text-amber-600",
      };
    }
    if (score >= 50) {
      return {
        badge: "bg-blue-100 text-blue-800 border-blue-200",
        bar: "bg-blue-500",
        icon: "text-blue-600",
      };
    }
    return {
      badge: "bg-gray-100 text-gray-700 border-gray-200",
      bar: "bg-gray-400",
      icon: "text-gray-500",
    };
  }

  const filteredMatches = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return matches;

    return matches.filter((match) => {
      const job = match.job;
      const content = [
        job?.title,
        job?.company,
        job?.location,
        job?.domain,
        job?.domaine,
        job?.description,
        match.ai_summary,
        match.ai_analysis,
        match.recommendation,
        match.matched_skills,
        match.missing_skills,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return content.includes(term);
    });
  }, [matches, search]);

  const statistics = useMemo(() => {
    const scores = matches.map((match) => getScore(match));
    const average =
      scores.length > 0
        ? Math.round(
            scores.reduce((sum, score) => sum + score, 0) / scores.length
          )
        : 0;

    return {
      total: matches.length,
      excellent: scores.filter((score) => score >= 80).length,
      good: scores.filter((score) => score >= 65 && score < 80).length,
      average,
    };
  }, [matches]);

  function openJob(job?: Job | null) {
    if (!job) return;
    const url = job.apply_url || job.url || job.link;

    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
      return;
    }

    setSelectedMatch(
      matches.find((match) => String(match.job_id) === String(job.id)) || null
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8">
            <div className="h-8 w-64 animate-pulse rounded-lg bg-slate-200" />
            <div className="mt-3 h-4 w-96 max-w-full animate-pulse rounded bg-slate-200" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-28 animate-pulse rounded-2xl border border-slate-200 bg-white"
              />
            ))}
          </div>

          <div className="mt-6 space-y-4">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-64 animate-pulse rounded-2xl border border-slate-200 bg-white"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl">
        {/* HEADER */}
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#005c45] text-white shadow-sm">
              <Target className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                Matching Jobs
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Découvrez les offres qui correspondent le mieux à votre profil.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
            {refreshing ? "Actualisation..." : "Actualiser"}
          </button>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="font-semibold">Erreur</p>
              <p className="mt-1">{error}</p>
              <button
                type="button"
                onClick={loadMatches}
                className="mt-3 font-semibold underline"
              >
                Réessayer
              </button>
            </div>
          </div>
        )}

        {/* STATISTICS */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Total matchs
                </p>
                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {statistics.total}
                </p>
              </div>
              <div className="rounded-xl bg-slate-100 p-3">
                <Briefcase className="h-5 w-5 text-slate-600" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
                  Excellent
                </p>
                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {statistics.excellent}
                </p>
                <p className="mt-1 text-xs text-slate-400">≥ 80%</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-emerald-500" />
            </div>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">
                  Bons matchs
                </p>
                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {statistics.good}
                </p>
                <p className="mt-1 text-xs text-slate-400">65–79%</p>
              </div>
              <Target className="h-8 w-8 text-amber-500" />
            </div>
          </div>

          <div className="rounded-2xl border border-blue-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                  Score moyen
                </p>
                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {statistics.average}%
                </p>
              </div>
              <Sparkles className="h-8 w-8 text-blue-500" />
            </div>
          </div>
        </div>

        {/* SEARCH */}
        {matches.length > 0 && (
          <div className="mb-6">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher un poste, une entreprise, une ville ou une compétence..."
                className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-12 pr-12 text-sm text-slate-900 shadow-sm outline-none transition focus:border-[#005c45] focus:ring-2 focus:ring-[#005c45]/20"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* LIST */}
        {matches.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center shadow-sm">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#005c45]/10">
              <Target className="h-8 w-8 text-[#005c45]" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              Aucun matching disponible
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Lancez l'analyse IA depuis la page des offres d'emploi pour
              calculer les correspondances avec votre profil.
            </p>
            <a
              href="/jobs"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#005c45] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#004735]"
            >
              <Briefcase className="h-4 w-4" />
              Voir les offres
            </a>
          </div>
        ) : filteredMatches.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center">
            <Search className="mx-auto h-8 w-8 text-slate-300" />
            <h2 className="mt-3 font-semibold text-slate-900">
              Aucun résultat
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Aucun matching ne correspond à votre recherche.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {filteredMatches.map((match) => {
              const job = match.job;
              const score = getScore(match);
              const classes = getScoreClasses(score);
              const matchedSkills = parseSkills(match.matched_skills);
              const missingSkills = parseSkills(match.missing_skills);

              return (
                <article
                  key={String(match.id)}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
                >
                  <div className="p-5 sm:p-6">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex items-center gap-2">
                          <span className="rounded-md bg-[#005c45]/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-[#005c45]">
                            Matching IA
                          </span>
                        </div>
                        <h2 className="text-xl font-bold leading-tight text-slate-900 sm:text-2xl">
                          {job?.title || "Offre sans titre"}
                        </h2>
                        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">
                          <span className="inline-flex items-center gap-1.5">
                            <Building2 className="h-4 w-4" />
                            {job?.company ||
                              job?.source ||
                              "Entreprise non spécifiée"}
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <MapPin className="h-4 w-4" />
                            {job?.location || "Localisation non spécifiée"}
                          </span>
                          {(job?.domain || job?.domaine) && (
                            <span className="inline-flex items-center gap-1.5">
                              <Briefcase className="h-4 w-4" />
                              {job?.domain || job?.domaine}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="shrink-0 lg:w-44">
                        <div className="flex items-center justify-between lg:block">
                          <div>
                            <span
                              className={`inline-flex rounded-full border px-3 py-1.5 text-sm font-bold ${classes.badge}`}
                            >
                              {score}% Match
                            </span>
                            <p className="mt-2 text-xs font-medium text-slate-500">
                              {getScoreLabel(score)}
                            </p>
                          </div>
                          <div className="text-right lg:hidden">
                            <span className="text-2xl font-bold text-slate-900">
                              {score}%
                            </span>
                          </div>
                        </div>

                        <div className="mt-3 hidden h-2 overflow-hidden rounded-full bg-slate-100 lg:block">
                          <div
                            className={`h-full rounded-full ${classes.bar}`}
                            style={{ width: `${score}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {job?.description && (
                      <p className="mt-5 line-clamp-3 text-sm leading-6 text-slate-600">
                        {job.description}
                      </p>
                    )}

                    <div className="mt-5 grid gap-4 lg:grid-cols-2">
                      <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                        <div className="mb-3 flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          <h3 className="text-sm font-bold text-emerald-800">
                            Compétences correspondantes
                          </h3>
                        </div>
                        {matchedSkills.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {matchedSkills.map((skill, index) => (
                              <span
                                key={`${skill}-${index}`}
                                className="rounded-lg border border-emerald-200 bg-white px-2.5 py-1.5 text-xs font-medium text-emerald-800"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-emerald-700">
                            Aucune compétence enregistrée.
                          </p>
                        )}
                      </div>

                      <div className="rounded-xl border border-red-100 bg-red-50 p-4">
                        <div className="mb-3 flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-red-600" />
                          <h3 className="text-sm font-bold text-red-800">
                            Compétences manquantes
                          </h3>
                        </div>
                        {missingSkills.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {missingSkills.map((skill, index) => (
                              <span
                                key={`${skill}-${index}`}
                                className="rounded-lg border border-red-200 bg-white px-2.5 py-1.5 text-xs font-medium text-red-800"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-red-700">
                            Aucune compétence manquante identifiée.
                          </p>
                        )}
                      </div>
                    </div>

                    {(match.ai_summary || match.ai_analysis) && (
                      <div className="mt-4 rounded-xl border border-green-100 bg-green-50 p-4">
                        <div className="mb-2 flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-green-600" />
                          <h3 className="text-sm font-bold text-green-800">
                            Analyse IA
                          </h3>
                        </div>
                        <p className="text-sm leading-6 text-green-900">
                          {match.ai_summary || match.ai_analysis}
                        </p>
                      </div>
                    )}

                    {match.recommendation && (
                      <div className="mt-4 rounded-xl border-l-4 border-[#005c45] bg-slate-50 p-4">
                        <p className="text-sm font-medium leading-6 text-slate-700">
                          <span className="mr-1">💡</span>
                          {match.recommendation}
                        </p>
                      </div>
                    )}

                    <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-5">
                      <button
                        type="button"
                        onClick={() => setSelectedMatch(match)}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        Voir l'analyse complète
                      </button>

                      {(job?.apply_url || job?.url || job?.link) && (
                        <button
                          type="button"
                          onClick={() => openJob(job)}
                          className="inline-flex items-center gap-2 rounded-xl bg-[#005c45] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#004735]"
                        >
                          <ExternalLink className="h-4 w-4" />
                          Voir l'offre
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* DETAILS MODAL */}
        {selectedMatch && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) {
                setSelectedMatch(null);
              }
            }}
          >
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
              <div className="sticky top-0 flex items-start justify-between border-b border-slate-100 bg-white p-5">
                <div className="pr-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-[#005c45]">
                    Analyse du matching
                  </p>
                  <h2 className="mt-1 text-xl font-bold text-slate-900">
                    {selectedMatch.job?.title || "Offre"}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedMatch(null)}
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-5 p-5">
                <div className="rounded-xl bg-slate-50 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-600">
                      Score de compatibilité
                    </span>
                    <span
                      className={`rounded-full border px-3 py-1.5 text-sm font-bold ${
                        getScoreClasses(getScore(selectedMatch)).badge
                      }`}
                    >
                      {getScore(selectedMatch)}%
                    </span>
                  </div>
                  <div className="mt-3 h-3 overflow-hidden rounded-full bg-white">
                    <div
                      className={`h-full rounded-full ${
                        getScoreClasses(getScore(selectedMatch)).bar
                      }`}
                      style={{
                        width: `${getScore(selectedMatch)}%`,
                      }}
                    />
                  </div>
                </div>

                {(selectedMatch.ai_summary || selectedMatch.ai_analysis) && (
                  <div>
                    <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-900">
                      <Sparkles className="h-4 w-4 text-green-600" />
                      Analyse IA
                    </h3>
                    <p className="rounded-xl bg-green-50 p-4 text-sm leading-6 text-green-900">
                      {selectedMatch.ai_summary || selectedMatch.ai_analysis}
                    </p>
                  </div>
                )}

                <div>
                  <h3 className="mb-2 text-sm font-bold text-slate-900">
                    Compétences correspondantes
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {parseSkills(selectedMatch.matched_skills).length > 0 ? (
                      parseSkills(selectedMatch.matched_skills).map(
                        (skill, index) => (
                          <span
                            key={`${skill}-${index}`}
                            className="rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-800"
                          >
                            {skill}
                          </span>
                        )
                      )
                    ) : (
                      <span className="text-sm text-slate-400">
                        Aucune donnée disponible.
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="mb-2 text-sm font-bold text-slate-900">
                    Compétences manquantes
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {parseSkills(selectedMatch.missing_skills).length > 0 ? (
                      parseSkills(selectedMatch.missing_skills).map(
                        (skill, index) => (
                          <span
                            key={`${skill}-${index}`}
                            className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-800"
                          >
                            {skill}
                          </span>
                        )
                      )
                    ) : (
                      <span className="text-sm text-slate-400">
                        Aucune donnée disponible.
                      </span>
                    )}
                  </div>
                </div>

                {selectedMatch.recommendation && (
                  <div>
                    <h3 className="mb-2 text-sm font-bold text-slate-900">
                      Recommandation
                    </h3>
                    <div className="rounded-xl border-l-4 border-[#005c45] bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                      {selectedMatch.recommendation}
                    </div>
                  </div>
                )}

                {selectedMatch.job?.description && (
                  <div>
                    <h3 className="mb-2 text-sm font-bold text-slate-900">
                      Description du poste
                    </h3>
                    <p className="whitespace-pre-line rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                      {selectedMatch.job.description}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-white p-4">
                <button
                  type="button"
                  onClick={() => setSelectedMatch(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Fermer
                </button>
                {(selectedMatch.job?.apply_url ||
                  selectedMatch.job?.url ||
                  selectedMatch.job?.link) && (
                  <button
                    type="button"
                    onClick={() => openJob(selectedMatch.job)}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#005c45] px-4 py-2 text-sm font-semibold text-white hover:bg-[#004735]"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Postuler / Voir l'offre
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}