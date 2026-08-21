"use client";

import { useEffect, useState } from "react";
import {
  Briefcase,
  Loader2,
  RefreshCw,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import JobCard from "@/components/jobs/JobCard";

type Company = {
  id: string;
  name: string | null;
  city: string | null;
  country: string | null;
  industry: string | null;
  logo_url: string | null;
  website: string | null;
};

type Job = {
  id: string;
  title: string | null;
  location: string | null;
  company_id: string | null;
  company: Company | null;
};

export type JobMatch = {
  id: number;
  score: number | null;
  matched_skills: string[] | string | null;
  missing_skills: string[] | string | null;
  ai_summary: string | null;
  profile_id: string | null;
  job_id: string | null;
  jobs: Job | null;
};

type RawJob = {
  id: string;
  title: string | null;
  location: string | null;
  company_id: string | null;
};

type RawJobMatch = {
  id: number;
  score: number | null;
  matched_skills: string[] | string | null;
  missing_skills: string[] | string | null;
  ai_summary: string | null;
  profile_id: string | null;
  job_id: string | null;
  jobs: RawJob | RawJob[] | null;
};

export default function JobsPage() {
  const [matches, setMatches] = useState<JobMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadJobs() {
    try {
      setLoading(true);
      setError("");

      const supabase = createClient();

      // ==========================================
      // 1. UTILISATEUR CONNECTÉ
      // ==========================================

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) {
        console.error(
          "Erreur authentification :",
          authError
        );

        throw new Error(
          "Impossible de vérifier votre session."
        );
      }

      if (!user) {
        throw new Error(
          "Utilisateur non authentifié. Veuillez vous reconnecter."
        );
      }

      console.log(
        "Utilisateur connecté :",
        user.id
      );

      // ==========================================
      // 2. PROFIL
      // ==========================================

      const {
        data: profile,
        error: profileError,
      } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) {
        console.warn(
          "Erreur récupération profile :",
          profileError
        );
      }

      const profileId =
        profile?.id ?? user.id;

      console.log(
        "Profile utilisé :",
        profileId
      );

      // ==========================================
      // 3. JOB_MATCHES + JOBS
      //
      // IMPORTANT :
      // Aucun JOIN avec companies ici.
      // ==========================================

      const {
        data: matchesData,
        error: matchesError,
      } = await supabase
        .from("job_matches")
        .select(`
          id,
          score,
          matched_skills,
          missing_skills,
          ai_summary,
          profile_id,
          job_id,
          jobs (
            id,
            title,
            location,
            company_id
          )
        `)
        .eq("profile_id", profileId)
        .order("score", {
          ascending: false,
        });

      if (matchesError) {
        console.error(
          "Erreur job_matches :",
          matchesError
        );

        throw new Error(
          `Erreur job_matches : ${matchesError.message}`
        );
      }

      const rawMatches =
        (matchesData ?? []) as unknown as RawJobMatch[];

      console.log(
        "Job matches récupérés :",
        rawMatches
      );

      // ==========================================
      // 4. RÉCUPÉRER LES company_id
      // ==========================================

      const companyIds = Array.from(
        new Set(
          rawMatches
            .map((match) => {
              const job = Array.isArray(match.jobs)
                ? match.jobs[0] ?? null
                : match.jobs;

              return job?.company_id ?? null;
            })
            .filter(
              (id): id is string =>
                Boolean(id)
            )
        )
      );

      console.log(
        "Company IDs trouvés :",
        companyIds
      );

      // ==========================================
      // 5. RÉCUPÉRER COMPANIES SÉPARÉMENT
      //
      // Pas de relationship Supabase.
      // ==========================================

      let companies: Company[] = [];

      if (companyIds.length > 0) {
        const {
          data: companiesData,
          error: companiesError,
        } = await supabase
          .from("companies")
          .select(`
            id,
            name,
            city,
            country,
            industry,
            logo_url,
            website
          `)
          .in("id", companyIds);

        if (companiesError) {
          console.warn(
            "Erreur récupération companies :",
            companiesError
          );

          // On ne bloque pas l'affichage des offres.
          companies = [];
        } else {
          companies =
            (companiesData ?? []) as Company[];
        }
      }

      console.log(
        "Companies récupérées :",
        companies
      );

      // ==========================================
      // 6. MAP company_id -> company
      // ==========================================

      const companyMap =
        new Map<string, Company>();

      for (const company of companies) {
        companyMap.set(
          company.id,
          company
        );
      }

      // ==========================================
      // 7. CONSTRUIRE LES MATCHES FINAUX
      // ==========================================

      const finalMatches: JobMatch[] =
        rawMatches.map((match) => {
          const rawJob = Array.isArray(
            match.jobs
          )
            ? match.jobs[0] ?? null
            : match.jobs;

          if (!rawJob) {
            return {
              id: match.id,
              score: match.score,
              matched_skills:
                match.matched_skills,
              missing_skills:
                match.missing_skills,
              ai_summary:
                match.ai_summary,
              profile_id:
                match.profile_id,
              job_id: match.job_id,
              jobs: null,
            };
          }

          const company =
            rawJob.company_id
              ? companyMap.get(
                  rawJob.company_id
                ) ?? null
              : null;

          return {
            id: match.id,
            score: match.score,
            matched_skills:
              match.matched_skills,
            missing_skills:
              match.missing_skills,
            ai_summary:
              match.ai_summary,
            profile_id:
              match.profile_id,
            job_id: match.job_id,

            jobs: {
              id: rawJob.id,
              title: rawJob.title,
              location:
                rawJob.location,
              company_id:
                rawJob.company_id,
              company,
            },
          };
        });

      console.log(
        "Matches finaux :",
        finalMatches
      );

      setMatches(finalMatches);
    } catch (err: unknown) {
      console.error(
        "Erreur chargement offres :",
        err
      );

      setMatches([]);

      setError(
        err instanceof Error
          ? err.message
          : "Une erreur est survenue."
      );
    } finally {
      setLoading(false);
    }
  }

  // ==========================================
  // CHARGEMENT INITIAL
  // ==========================================

  useEffect(() => {
    loadJobs();
  }, []);

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Offres recommandées
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Les offres correspondant à votre profil.
          </p>
        </div>

        <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-slate-800 bg-slate-950">
          <div className="text-center">
            <Loader2
              size={32}
              className="mx-auto animate-spin text-emerald-400"
            />

            <p className="mt-4 text-sm text-slate-400">
              Chargement des offres...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (error) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Offres recommandées
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Les offres correspondant à votre profil.
          </p>
        </div>

        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6">
          <p className="font-medium text-red-400">
            {error}
          </p>

          <button
            type="button"
            onClick={loadJobs}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-500/10 px-4 py-2 text-sm font-medium text-red-300 transition hover:bg-red-500/20"
          >
            <RefreshCw size={16} />
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // AUCUN MATCH
  // ==========================================

  if (matches.length === 0) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Offres recommandées
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Les offres correspondant à votre profil.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-slate-500">
            <Briefcase size={26} />
          </div>

          <h2 className="mt-5 text-lg font-semibold text-white">
            Aucune offre matchée pour le moment.
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
            Aucune correspondance n&apos;a encore été trouvée pour votre profil.
          </p>

          <button
            type="button"
            onClick={loadJobs}
            className="mx-auto mt-5 inline-flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-700"
          >
            <RefreshCw size={16} />
            Actualiser
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // LISTE DES OFFRES
  // ==========================================

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">
          Offres recommandées
        </h1>

        <p className="mt-2 text-sm text-slate-400">
          Les offres correspondant à votre profil.
        </p>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">
          {matches.length} offre
          {matches.length > 1 ? "s" : ""} trouvée
          {matches.length > 1 ? "s" : ""}
        </p>

        <span className="rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-400">
          Matches IA
        </span>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {matches.map((match) => (
          <JobCard
            key={match.id}
            match={match}
          />
        ))}
      </div>
    </div>
  );
}