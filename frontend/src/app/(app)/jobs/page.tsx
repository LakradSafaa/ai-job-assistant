"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { supabase } from "@/lib/supabase/client";

import {
  Search,
  Eye,
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  MapPin,
  Building2,
  BriefcaseBusiness,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  RefreshCw,
  BrainCircuit,
  Target,
  type LucideIcon,
} from "lucide-react";

/* ============================================================
   TYPES
============================================================ */

type Job = {
  id: string | number;

  created_at?: string | null;

  /*
   * IMPORTANT :
   * company_id n'est PAS utilisé dans la requête principale
   * jobs, car ce champ n'est pas confirmé dans la table jobs.
   *
   * Il reste optionnel uniquement pour les données retournées
   * par le matching n8n.
   */
  company_id?: string | null;

  company?: string | null;

  company_name?: string | null;

  title?: string | null;

  description?: string | null;

  location?: string | null;

  contract_type?: string | null;

  remote?: boolean | null;

  salary_min?: number | null;

  salary_max?: number | null;

  currency?: string | null;

  experience_level?: string | null;

  skills?: string | string[] | null;

  published_at?: string | null;

  source?: string | null;

  external_id?: string | null;

  url?: string | null;

  link?: string | null;

  /*
   * IMPORTANT :
   * apply_url est conservé dans le type car le matching n8n
   * peut éventuellement le retourner.
   *
   * MAIS il n'est PAS demandé dans la requête Supabase
   * principale car la colonne n'existe pas dans jobs.
   */
  apply_url?: string | null;

  /*
   * IMPORTANT :
   * Le vrai champ est domaine.
   */
  domaine?: string | null;

  sous_domaine?: string | null;

  classification_score?: number | null;

  /* ==========================================================
     MATCHING
  ========================================================== */

  score?: number | null;

  match_score?: number | null;

  matched_skills?: string | string[] | null;

  missing_skills?: string | string[] | null;

  ai_summary?: string | null;

  ai_analysis?: string | null;

  recommendation?: string | null;

  is_saved?: boolean;
};

/* ============================================================
   HELPERS
============================================================ */

function parseSkills(
  value: string | string[] | null | undefined
): string[] {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => String(item).trim())
      .filter(Boolean);
  }

  const text = String(value).trim();

  if (!text) {
    return [];
  }

  /*
   * JSON ARRAY
   */

  try {
    const parsed = JSON.parse(text);

    if (Array.isArray(parsed)) {
      return parsed
        .map((item) => String(item).trim())
        .filter(Boolean);
    }
  } catch {
    // Ce n'est pas du JSON.
  }

  /*
   * TEXT
   */

  return text
    .split(/[,;|\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function safeText(
  value: unknown,
  fallback = ""
): string {
  if (
    value === null ||
    value === undefined
  ) {
    return fallback;
  }

  return String(value);
}

/* ============================================================
   PAGE
============================================================ */

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [isAnalyzing, setIsAnalyzing] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const [successMessage, setSuccessMessage] =
    useState<string | null>(null);

  const [searchTerm, setSearchTerm] =
    useState("");

  const [savingJobId, setSavingJobId] =
    useState<string | number | null>(null);

  const [selectedJob, setSelectedJob] =
    useState<Job | null>(null);

  const [profileId, setProfileId] =
    useState<string | null>(null);

  /* ==========================================================
     GET PROFILE ID
  ========================================================== */

  const getProfileId =
    useCallback(
      async (): Promise<string> => {
        /*
         * 1. LOCAL STORAGE
         */

        if (
          typeof window !== "undefined"
        ) {
          const stored =
            localStorage.getItem(
              "profile_id"
            );

          if (
            stored &&
            stored.trim()
          ) {
            return stored.trim();
          }
        }

        /*
         * 2. AUTH USER
         */

        const {
          data: {
            user,
          },
        } =
          await supabase.auth.getUser();

        if (user?.id) {
          const id =
            String(user.id);

          if (
            typeof window !== "undefined"
          ) {
            localStorage.setItem(
              "profile_id",
              id
            );
          }

          return id;
        }

        /*
         * 3. FIRST PROFILE
         *
         * Fallback uniquement si aucun
         * utilisateur authentifié n'est trouvé.
         */

        const {
          data: profile,
          error,
        } =
          await supabase
            .from("profiles")
            .select("id")
            .limit(1)
            .maybeSingle();

        if (error) {
          throw new Error(
            error.message
          );
        }

        if (!profile?.id) {
          throw new Error(
            "Aucun profil trouvé dans Supabase."
          );
        }

        const id =
          String(profile.id);

        if (
          typeof window !== "undefined"
        ) {
          localStorage.setItem(
            "profile_id",
            id
          );
        }

        return id;
      },
      []
    );

  /* ==========================================================
     COMPANY NAME

     IMPORTANT :
     On NE fait plus de requête automatique vers companies
     pendant le chargement de /jobs.

     Cela supprime le Bad Request actuel.
  ========================================================== */

  const enrichCompanies =
    useCallback(
      async (
        sourceJobs: Job[]
      ): Promise<Job[]> => {
        if (
          !sourceJobs ||
          sourceJobs.length === 0
        ) {
          return [];
        }

        /*
         * On ne bloque jamais les jobs à cause
         * de la table companies.
         *
         * Si le nom est déjà présent dans les données,
         * on le conserve.
         *
         * Sinon :
         * "Entreprise non renseignée"
         */

        return sourceJobs.map(
          (job) => {
            const companyName =
              safeText(
                job.company,
                ""
              ).trim() ||
              safeText(
                job.company_name,
                ""
              ).trim() ||
              "Entreprise non renseignée";

            return {
              ...job,

              company:
                companyName,

              company_name:
                companyName,
            };
          }
        );
      },
      []
    );

  /* ==========================================================
     GET SAVED IDS
  ========================================================== */

  const getSavedIds =
    useCallback(
      async (
        currentProfileId: string
      ): Promise<Set<string>> => {
        const {
          data,
          error,
        } =
          await supabase
            .from("saved_jobs")
            .select("job_id")
            .eq(
              "profile_id",
              currentProfileId
            );

        if (error) {
          console.error(
            "SAVED JOBS ERROR:",
            error,
            JSON.stringify(
              error,
              null,
              2
            )
          );

          /*
           * Une erreur sur saved_jobs
           * ne doit pas empêcher l'affichage
           * des offres.
           */

          return new Set();
        }

        return new Set(
          (data || []).map(
            (item: any) =>
              String(
                item.job_id
              )
          )
        );
      },
      []
    );

  /* ==========================================================
     LOAD ALL JOBS
  ========================================================== */

  const fetchJobs =
    useCallback(
      async () => {
        setIsLoading(true);
        setErrorMessage(null);

        try {
          /*
           * PROFILE
           */

          const currentProfileId =
            await getProfileId();

          setProfileId(
            currentProfileId
          );

          /*
           * GET JOBS
           *
           * IMPORTANT :
           *
           * On utilise uniquement les colonnes
           * connues/confirmées de jobs.
           *
           * Pas de company_id ici.
           * Pas de company.
           * Pas de domain.
           * Pas de apply_url.
           */

          const {
            data,
            error,
          } =
            await supabase
              .from("jobs")
              .select(`
                id,
                created_at,
                title,
                description,
                location,
                contract_type,
                remote,
                salary_min,
                salary_max,
                currency,
                experience_level,
                skills,
                published_at,
                source,
                external_id,
                url,
                link,
                domaine,
                sous_domaine,
                classification_score
              `)
              .order(
                "created_at",
                {
                  ascending: false,
                }
              );

          if (error) {
            console.error(
              "JOBS ERROR:",
              error,
              JSON.stringify(
                error,
                null,
                2
              )
            );

            throw new Error(
              error.message ||
                "Impossible de récupérer les offres."
            );
          }

          let loadedJobs =
            (data || []) as Job[];

          console.log(
            "TOTAL JOBS CHARGÉS:",
            loadedJobs.length
          );

          /*
           * COMPANY ENRICHMENT
           *
           * Aucun appel companies.
           */

          loadedJobs =
            await enrichCompanies(
              loadedJobs
            );

          /*
           * SAVED JOBS
           */

          const savedIds =
            await getSavedIds(
              currentProfileId
            );

          /*
           * NORMALIZE
           *
           * Les offres normales ne sont pas
           * des matches IA.
           */

          loadedJobs =
            loadedJobs.map(
              (job) => ({
                ...job,

                is_saved:
                  savedIds.has(
                    String(
                      job.id
                    )
                  ),

                score:
                  null,

                match_score:
                  null,

                matched_skills:
                  null,

                missing_skills:
                  null,

                ai_summary:
                  null,

                ai_analysis:
                  null,

                recommendation:
                  null,
              })
            );

          setJobs(
            loadedJobs
          );

          console.log(
            "OFFRES AFFICHÉES:",
            loadedJobs.length
          );
        } catch (error) {
          console.error(
            "LOAD JOBS ERROR:",
            error
          );

          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Impossible de charger les offres."
          );
        } finally {
          setIsLoading(false);
        }
      },
      [
        enrichCompanies,
        getProfileId,
        getSavedIds,
      ]
    );

  /* ==========================================================
     INITIAL LOAD
  ========================================================== */

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  /* ==========================================================
     SEARCH
  ========================================================== */

  const filteredJobs =
    useMemo(() => {
      const search =
        searchTerm
          .trim()
          .toLowerCase();

      if (!search) {
        return jobs;
      }

      return jobs.filter(
        (job) => {
          const text = [
            job.title,
            job.company,
            job.company_name,
            job.source,
            job.location,
            job.domaine,
            job.sous_domaine,
            job.description,

            Array.isArray(
              job.skills
            )
              ? job.skills.join(
                  " "
                )
              : job.skills,

            job.contract_type,
            job.experience_level,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          return text.includes(
            search
          );
        }
      );
    }, [
      jobs,
      searchTerm,
    ]);

  /* ==========================================================
     MATCHING IA

     IMPORTANT :
     Cette logique reste intacte.
  ========================================================== */

  const handleRunMatching =
    async () => {
      if (isAnalyzing) {
        return;
      }

      setIsAnalyzing(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      try {
        /*
         * PROFILE
         */

        const currentProfileId =
          profileId ||
          (await getProfileId());

        setProfileId(
          currentProfileId
        );

        console.log(
          "================================="
        );

        console.log(
          "LANCEMENT MATCHING"
        );

        console.log(
          "PROFILE:",
          currentProfileId
        );

        console.log(
          "================================="
        );

        /*
         * CALL NEXT.JS API
         */

        const response =
          await fetch(
            "/api/jobs/match",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Accept:
                  "application/json",
              },

              body: JSON.stringify({
                profile_id:
                  currentProfileId,
              }),

              cache:
                "no-store",
            }
          );

        /*
         * RESPONSE
         */

        const raw =
          await response.text();

        let data: any = {};

        if (
          raw &&
          raw.trim()
        ) {
          try {
            data =
              JSON.parse(
                raw
              );
          } catch {
            console.error(
              "MATCHING RAW RESPONSE:",
              raw
            );

            throw new Error(
              "La réponse du matching n'est pas un JSON valide."
            );
          }
        }

        console.log(
          "MATCHING RESPONSE:",
          data
        );

        /*
         * HTTP ERROR
         */

        if (!response.ok) {
          throw new Error(
            data?.error ||
              data?.message ||
              data?.details ||
              `Erreur HTTP ${response.status}`
          );
        }

        if (
          data?.success ===
          false
        ) {
          throw new Error(
            data?.error ||
              data?.message ||
              "Le matching a échoué."
          );
        }

        /*
         * EXTRACT MATCHED JOBS
         */

        let rawMatchedJobs: any[] =
          [];

        if (
          Array.isArray(
            data?.jobs
          )
        ) {
          rawMatchedJobs =
            data.jobs;
        } else if (
          Array.isArray(
            data?.matches
          )
        ) {
          rawMatchedJobs =
            data.matches;
        } else if (
          Array.isArray(data)
        ) {
          rawMatchedJobs =
            data;
        }

        console.log(
          "OFFRES MATCHÉES REÇUES:",
          rawMatchedJobs.length
        );

        /*
         * NORMALIZATION
         */

        const normalizedJobs: Job[] =
          rawMatchedJobs
            .map(
              (
                item: any
              ): Job | null => {
                /*
                 * n8n peut retourner :
                 *
                 * {
                 *   job: {...},
                 *   score: 80
                 * }
                 *
                 * ou :
                 *
                 * {
                 *   id: "...",
                 *   title: "...",
                 *   score: 80
                 * }
                 */

                let job: any =
                  item;

                if (
                  item?.job &&
                  typeof item.job ===
                    "object"
                ) {
                  job =
                    item.job;
                }

                /*
                 * ID
                 */

                if (
                  !job?.id &&
                  item?.job_id
                ) {
                  job = {
                    ...job,

                    id:
                      item.job_id,
                  };
                }

                if (!job?.id) {
                  return null;
                }

                /*
                 * SCORE
                 */

                const score =
                  Number(
                    item?.score ??
                      item?.match_score ??
                      job?.score ??
                      job?.match_score ??
                      0
                  );

                /*
                 * RETURN
                 */

                return {
                  ...job,

                  id:
                    job.id,

                  score,

                  match_score:
                    score,

                  matched_skills:
                    item?.matched_skills ??
                    job?.matched_skills ??
                    null,

                  missing_skills:
                    item?.missing_skills ??
                    job?.missing_skills ??
                    null,

                  ai_summary:
                    item?.ai_summary ??
                    job?.ai_summary ??
                    item?.summary ??
                    job?.summary ??
                    null,

                  ai_analysis:
                    item?.ai_analysis ??
                    job?.ai_analysis ??
                    null,

                  recommendation:
                    item?.recommendation ??
                    job?.recommendation ??
                    null,

                  /*
                   * IMPORTANT :
                   * vrai champ = domaine
                   */

                  domaine:
                    job?.domaine ??
                    null,

                  sous_domaine:
                    job?.sous_domaine ??
                    null,
                };
              }
            )
            .filter(
              (
                job
              ): job is Job =>
                job !== null
            );

        /*
         * SCORE >= 60
         */

        const matchingJobs =
          normalizedJobs.filter(
            (job) =>
              Number(
                job.match_score ??
                  job.score ??
                  0
              ) >= 60
          );

        /*
         * COMPANY
         *
         * Aucun appel Supabase companies.
         */

        let finalJobs =
          await enrichCompanies(
            matchingJobs
          );

        /*
         * SAVED
         */

        const savedIds =
          await getSavedIds(
            currentProfileId
          );

        finalJobs =
          finalJobs.map(
            (job) => ({
              ...job,

              is_saved:
                savedIds.has(
                  String(
                    job.id
                  )
                ),
            })
          );

        /*
         * SORT SCORE DESC
         */

        finalJobs.sort(
          (a, b) =>
            Number(
              b.match_score ??
                b.score ??
                0
            ) -
            Number(
              a.match_score ??
                a.score ??
                0
            )
        );

        /*
         * DISPLAY ONLY MATCHES
         */

        setJobs(
          finalJobs
        );

        /*
         * TOTAL
         */

        const totalReceived =
          Number(
            data?.total_jobs_received ??
              data?.total_jobs ??
              1000
          );

        const minimumScore =
          Number(
            data?.minimum_score ??
              60
          );

        /*
         * SUCCESS
         */

        setSuccessMessage(
          `Matching terminé : ${finalJobs.length} offre(s) correspondante(s) parmi ${totalReceived} offres. Seuil : ${minimumScore}%.`
        );

        console.log(
          "================================="
        );

        console.log(
          "MATCHING TERMINÉ"
        );

        console.log(
          "TOTAL OFFRES:",
          totalReceived
        );

        console.log(
          "MATCHES:",
          finalJobs.length
        );

        console.log(
          "SEUIL:",
          minimumScore
        );

        console.log(
          "================================="
        );
      } catch (error) {
        console.error(
          "MATCHING ERROR:",
          error
        );

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Erreur lors du matching."
        );
      } finally {
        setIsAnalyzing(
          false
        );
      }
    };

  /* ==========================================================
     RELOAD ALL
  ========================================================== */

  const handleReloadAll =
    async () => {
      setSuccessMessage(null);
      setErrorMessage(null);

      await fetchJobs();

      setSuccessMessage(
        "Toutes les offres ont été rechargées."
      );
    };

  /* ==========================================================
     SAVE JOB
  ========================================================== */

  const handleSaveJob =
    async (job: Job) => {
      if (
        savingJobId !== null
      ) {
        return;
      }

      try {
        setSavingJobId(
          job.id
        );

        setErrorMessage(null);
        setSuccessMessage(null);

        const currentProfileId =
          profileId ||
          (await getProfileId());

        setProfileId(
          currentProfileId
        );

        /*
         * DELETE
         */

        if (job.is_saved) {
          const {
            error,
          } =
            await supabase
              .from("saved_jobs")
              .delete()
              .eq(
                "profile_id",
                currentProfileId
              )
              .eq(
                "job_id",
                job.id
              );

          if (error) {
            throw error;
          }

          setJobs(
            (current) =>
              current.map(
                (item) =>
                  String(
                    item.id
                  ) ===
                  String(
                    job.id
                  )
                    ? {
                        ...item,

                        is_saved:
                          false,
                      }
                    : item
              )
          );

          if (
            selectedJob &&
            String(
              selectedJob.id
            ) ===
              String(
                job.id
              )
          ) {
            setSelectedJob({
              ...selectedJob,

              is_saved:
                false,
            });
          }

          setSuccessMessage(
            "Offre retirée des offres sauvegardées."
          );

          return;
        }

        /*
         * INSERT
         */

        const {
          error,
        } =
          await supabase
            .from("saved_jobs")
            .insert({
              profile_id:
                currentProfileId,

              job_id:
                job.id,
            });

        if (error) {
          if (
            error.code ===
            "23505"
          ) {
            setSuccessMessage(
              "Cette offre est déjà sauvegardée."
            );

            return;
          }

          throw error;
        }

        setJobs(
          (current) =>
            current.map(
              (item) =>
                String(
                  item.id
                ) ===
                String(
                  job.id
                )
                  ? {
                      ...item,

                      is_saved:
                        true,
                    }
                  : item
            )
        );

        if (
          selectedJob &&
          String(
            selectedJob.id
          ) ===
            String(
              job.id
            )
        ) {
          setSelectedJob({
            ...selectedJob,

            is_saved: true,
          });
        }

        setSuccessMessage(
          "Offre sauvegardée avec succès."
        );
      } catch (error) {
        console.error(
          "SAVE JOB ERROR:",
          error
        );

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Impossible de sauvegarder l'offre."
        );
      } finally {
        setSavingJobId(
          null
        );
      }
    };

  /* ==========================================================
     APPLY
  ========================================================== */

  const handleApply =
    (job: Job) => {
      const applicationUrl =
        job.apply_url ||
        job.url ||
        job.link;

      if (applicationUrl) {
        window.open(
          applicationUrl,
          "_blank",
          "noopener,noreferrer"
        );

        return;
      }

      setSelectedJob(
        job
      );
    };

  /* ==========================================================
     SCORE STYLE
  ========================================================== */

  function getScoreStyle(
    score:
      | number
      | null
      | undefined
  ) {
    const value =
      Number(score || 0);

    if (value >= 80) {
      return {
        badge:
          "border-emerald-200 bg-emerald-50 text-emerald-700",

        progress:
          "bg-emerald-500",

        label:
          "Excellent match",
      };
    }

    if (value >= 60) {
      return {
        badge:
          "border-green-200 bg-green-50 text-green-700",

        progress:
          "bg-green-500",

        label:
          "Bon match",
      };
    }

    if (value >= 40) {
      return {
        badge:
          "border-amber-200 bg-amber-50 text-amber-700",

        progress:
          "bg-amber-500",

        label:
          "Match moyen",
      };
    }

    return {
      badge:
        "border-slate-200 bg-slate-50 text-slate-600",

      progress:
        "bg-slate-400",

      label:
        "Match faible",
    };
  }

  /* ==========================================================
     STATS
  ========================================================== */

  const matchingCount =
    jobs.filter(
      (job) =>
        job.match_score !=
          null &&
        Number(
          job.match_score
        ) >= 60
    ).length;

  const savedCount =
    jobs.filter(
      (job) =>
        job.is_saved
    ).length;

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="page-container">

        {/* ====================================================
            HEADER
        ==================================================== */}

        <header className="mb-7 animate-fade-in">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">

            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">

                <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500" />

                Recherche intelligente

              </div>

              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                Offres d'emploi
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                Découvrez les opportunités qui correspondent
                le mieux à votre profil et à vos compétences.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">

              <button
                type="button"
                onClick={
                  handleReloadAll
                }
                disabled={
                  isAnalyzing ||
                  isLoading
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >

                <RefreshCw
                  className={`h-4 w-4 ${
                    isLoading
                      ? "animate-spin"
                      : ""
                  }`}
                />

                Toutes les offres

              </button>

              <button
                type="button"
                onClick={
                  handleRunMatching
                }
                disabled={
                  isAnalyzing ||
                  isLoading
                }
                className="ai-button"
              >

                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />

                    Analyse des 1000 offres...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />

                    Lancer le matching IA
                  </>
                )}

              </button>

            </div>
          </div>
        </header>

        {/* ====================================================
            STATS
        ==================================================== */}

        {!isLoading && (
          <div className="mb-6 grid gap-4 md:grid-cols-3">

            <StatCard
              label="Offres affichées"
              value={jobs.length}
              icon={
                BriefcaseBusiness
              }
              delay="0ms"
            />

            <StatCard
              label="Correspondances ≥ 60%"
              value={
                matchingCount
              }
              icon={Target}
              green
              delay="70ms"
            />

            <StatCard
              label="Offres sauvegardées"
              value={
                savedCount
              }
              icon={Bookmark}
              delay="140ms"
            />

          </div>
        )}

        {/* ====================================================
            SEARCH
        ==================================================== */}

        <div className="saas-card mb-6 p-3 animate-fade-in">

          <div className="relative">

            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

            <input
              type="text"
              value={
                searchTerm
              }
              onChange={(
                event
              ) =>
                setSearchTerm(
                  event.target.value
                )
              }
              placeholder="Rechercher un poste, une entreprise, une localisation ou un domaine..."
              className="w-full rounded-xl border-0 bg-slate-50 py-3.5 pl-12 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
            />

            {searchTerm && (
              <button
                type="button"
                onClick={() =>
                  setSearchTerm(
                    ""
                  )
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >

                <X className="h-4 w-4" />

              </button>
            )}

          </div>
        </div>

        {/* ====================================================
            ERROR
        ==================================================== */}

        {errorMessage && (
          <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 animate-fade-scale">

            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

            <div>

              <p className="font-bold">
                Une erreur est survenue
              </p>

              <p className="mt-1 leading-5">
                {errorMessage}
              </p>

            </div>

          </div>
        )}

        {/* ====================================================
            SUCCESS
        ==================================================== */}

        {successMessage && (
          <div className="mb-5 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 animate-fade-scale">

            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />

            <div>

              <p className="font-bold">
                Matching terminé
              </p>

              <p className="mt-1">
                {successMessage}
              </p>

            </div>

          </div>
        )}

        {/* ====================================================
            LOADING
        ==================================================== */}

        {isLoading ? (
          <div className="saas-card flex min-h-[360px] flex-col items-center justify-center">

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50">

              <Loader2 className="h-7 w-7 animate-spin text-emerald-600" />

            </div>

            <p className="mt-5 text-sm font-semibold text-slate-700">
              Chargement des offres...
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Récupération des opportunités disponibles
            </p>

          </div>
        ) : filteredJobs.length === 0 ? (
          <EmptyState
            hasSearch={
              searchTerm.length > 0
            }
          />
        ) : (
          <div className="space-y-5">

            {filteredJobs.map(
              (
                job,
                index
              ) => {
                const score =
                  Number(
                    job.match_score ??
                      job.score ??
                      0
                  );

                const hasScore =
                  job.match_score !=
                    null ||
                  job.score != null;

                const scoreStyle =
                  getScoreStyle(
                    score
                  );

                const matchedSkills =
                  parseSkills(
                    job.matched_skills
                  );

                const missingSkills =
                  parseSkills(
                    job.missing_skills
                  );

                return (
                  <article
                    key={String(
                      job.id
                    )}
                    style={{
                      animationDelay: `${index * 60}ms`,
                    }}
                    className="saas-card overflow-hidden animate-fade-in"
                  >

                    {/* JOB */}

                    <div className="p-6">

                      <div className="flex flex-col gap-6 xl:flex-row xl:justify-between">

                        <div className="min-w-0 flex-1">

                          <div className="flex flex-wrap items-center gap-2">

                            {job.domaine && (
                              <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-700">
                                {job.domaine}
                              </span>
                            )}

                            {job.sous_domaine && (
                              <span className="rounded-full bg-green-50 px-3 py-1 text-[11px] font-bold text-green-700">
                                {job.sous_domaine}
                              </span>
                            )}

                            {job.source && (
                              <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-600">
                                {job.source}
                              </span>
                            )}

                          </div>

                          <h2 className="mt-3 text-xl font-bold leading-snug text-slate-900">
                            {job.title ||
                              "Titre non spécifié"}
                          </h2>

                          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">

                            <span className="inline-flex items-center gap-1.5">

                              <Building2 className="h-4 w-4 text-slate-400" />

                              {job.company ||
                                job.company_name ||
                                "Entreprise non spécifiée"}

                            </span>

                            <span className="inline-flex items-center gap-1.5">

                              <MapPin className="h-4 w-4 text-slate-400" />

                              {job.location ||
                                "Localisation non spécifiée"}

                            </span>

                            {job.contract_type && (
                              <span className="inline-flex items-center gap-1.5">

                                <BriefcaseBusiness className="h-4 w-4 text-slate-400" />

                                {job.contract_type}

                              </span>
                            )}

                            {job.remote && (
                              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                                Télétravail
                              </span>
                            )}

                          </div>

                        </div>

                        {/* SCORE */}

                        {hasScore && (
                          <div className="shrink-0 xl:w-44">

                            <div
                              className={`rounded-2xl border p-4 ${scoreStyle.badge}`}
                            >

                              <div className="flex items-center justify-between">

                                <span className="text-[10px] font-bold uppercase tracking-wider">
                                  Match IA
                                </span>

                                <BrainCircuit className="h-4 w-4" />

                              </div>

                              <div className="mt-2 flex items-end gap-1">

                                <span className="text-3xl font-black">
                                  {score}
                                </span>

                                <span className="mb-1 text-sm font-bold">
                                  /100
                                </span>

                              </div>

                              <p className="mt-1 text-[11px] font-semibold">
                                {scoreStyle.label}
                              </p>

                            </div>

                          </div>
                        )}

                      </div>

                      {/* SCORE BAR */}

                      {hasScore && (
                        <div className="mt-6">

                          <div className="mb-2 flex items-center justify-between">

                            <span className="text-[11px] font-semibold text-slate-400">
                              Compatibilité avec votre profil
                            </span>

                            <span className="text-[11px] font-bold text-slate-500">
                              {score}%
                            </span>

                          </div>

                          <div className="h-2 overflow-hidden rounded-full bg-slate-100">

                            <div
                              className={`h-full rounded-full transition-all duration-1000 ${scoreStyle.progress}`}
                              style={{
                                width: `${Math.min(
                                  100,
                                  Math.max(
                                    0,
                                    score
                                  )
                                )}%`,
                              }}
                            />

                          </div>

                        </div>
                      )}

                      {/* DESCRIPTION */}

                      {job.description && (
                        <p className="mt-5 line-clamp-4 text-sm leading-6 text-slate-600">
                          {job.description}
                        </p>
                      )}

                      {/* SALARY */}

                      {(job.salary_min !=
                        null ||
                        job.salary_max !=
                          null) && (
                        <div className="mt-5">

                          <span className="inline-flex rounded-xl bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700">

                            💰{" "}

                            {job.salary_min !=
                            null
                              ? job.salary_min
                              : ""}

                            {job.salary_min !=
                              null &&
                            job.salary_max !=
                              null
                              ? " - "
                              : ""}

                            {job.salary_max !=
                            null
                              ? job.salary_max
                              : ""}

                            {job.currency
                              ? ` ${job.currency}`
                              : ""}

                          </span>

                        </div>
                      )}

                      {/* SKILLS */}

                      {(matchedSkills.length >
                        0 ||
                        missingSkills.length >
                          0) && (
                        <div className="mt-5 grid gap-4 md:grid-cols-2">

                          {matchedSkills.length >
                            0 && (
                            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4">

                              <p className="text-xs font-bold text-emerald-700">
                                ✓ Compétences correspondantes
                              </p>

                              <div className="mt-3 flex flex-wrap gap-2">

                                {matchedSkills.map(
                                  (
                                    skill,
                                    skillIndex
                                  ) => (
                                    <span
                                      key={`${skill}-${skillIndex}`}
                                      className="rounded-lg border border-emerald-100 bg-white px-2.5 py-1.5 text-xs font-semibold text-emerald-700 shadow-sm"
                                    >
                                      {skill}
                                    </span>
                                  )
                                )}

                              </div>

                            </div>
                          )}

                          {missingSkills.length >
                            0 && (
                            <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-4">

                              <p className="text-xs font-bold text-amber-700">
                                + Compétences à développer
                              </p>

                              <div className="mt-3 flex flex-wrap gap-2">

                                {missingSkills.map(
                                  (
                                    skill,
                                    skillIndex
                                  ) => (
                                    <span
                                      key={`${skill}-${skillIndex}`}
                                      className="rounded-lg border border-amber-100 bg-white px-2.5 py-1.5 text-xs font-semibold text-amber-700 shadow-sm"
                                    >
                                      {skill}
                                    </span>
                                  )
                                )}

                              </div>

                            </div>
                          )}

                        </div>
                      )}

                      {/* AI */}

                      {(job.ai_analysis ||
                        job.ai_summary ||
                        job.recommendation) && (
                        <div className="mt-6 rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-5">

                          <div className="flex items-center gap-3">

                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">

                              <Sparkles className="h-5 w-5 text-emerald-600" />

                            </div>

                            <div>

                              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                                Intelligence artificielle
                              </p>

                              <p className="mt-0.5 text-sm font-bold text-slate-900">
                                Analyse de compatibilité
                              </p>

                            </div>

                          </div>

                          {(job.ai_analysis ||
                            job.ai_summary) && (
                            <p className="mt-4 text-sm leading-6 text-slate-700">
                              {job.ai_analysis ||
                                job.ai_summary}
                            </p>
                          )}

                          {job.recommendation && (
                            <div className="mt-4 rounded-xl border border-emerald-100 bg-white p-3">

                              <p className="text-xs font-bold text-emerald-700">
                                💡 Recommandation
                              </p>

                              <p className="mt-1 text-sm font-medium text-slate-700">
                                {job.recommendation}
                              </p>

                            </div>
                          )}

                        </div>
                      )}

                    </div>

                    {/* ACTIONS */}

                    <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/70 px-6 py-4 sm:flex-row sm:items-center">

                      <button
                        type="button"
                        onClick={() =>
                          setSelectedJob(
                            job
                          )
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                      >

                        <Eye className="h-4 w-4" />

                        Voir les détails

                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleSaveJob(
                            job
                          )
                        }
                        disabled={
                          savingJobId ===
                          job.id
                        }
                        className={[
                          "inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition",
                          job.is_saved
                            ? "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
                            : "border-slate-200 bg-white text-slate-700 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700",
                        ].join(
                          " "
                        )}
                      >

                        {savingJobId ===
                        job.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : job.is_saved ? (
                          <BookmarkCheck className="h-4 w-4" />
                        ) : (
                          <Bookmark className="h-4 w-4" />
                        )}

                        {job.is_saved
                          ? "Sauvegardée"
                          : "Sauvegarder"}

                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleApply(
                            job
                          )
                        }
                        className="sm:ml-auto inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-md"
                      >

                        Postuler

                        <ExternalLink className="h-4 w-4" />

                      </button>

                    </div>

                  </article>
                );
              }
            )}

          </div>
        )}

      </div>

      {/* ========================================================
          MODAL
      ======================================================== */}

      {selectedJob && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm animate-fade-scale"
          onClick={() =>
            setSelectedJob(
              null
            )
          }
        >

          <div
            className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* HEADER */}

            <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-100 bg-white/95 p-6 backdrop-blur">

              <div className="pr-6">

                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">

                  <Sparkles className="h-3 w-3" />

                  Offre analysée par IA

                </span>

                <h2 className="mt-3 text-2xl font-bold text-slate-900">
                  {selectedJob.title ||
                    "Offre d'emploi"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {selectedJob.company ||
                    selectedJob.company_name ||
                    "Entreprise non spécifiée"}
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedJob(
                    null
                  )
                }
                className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >

                <X className="h-5 w-5" />

              </button>

            </div>

            {/* BODY */}

            <div className="max-h-[calc(90vh-110px)] overflow-y-auto p-6">

              <div className="grid gap-4 sm:grid-cols-2">

                <ModalInfo
                  icon={Building2}
                  label="Entreprise"
                  value={
                    selectedJob.company ||
                    selectedJob.company_name ||
                    "Non spécifiée"
                  }
                />

                <ModalInfo
                  icon={MapPin}
                  label="Localisation"
                  value={
                    selectedJob.location ||
                    "Non spécifiée"
                  }
                />

                <ModalInfo
                  icon={
                    BriefcaseBusiness
                  }
                  label="Domaine"
                  value={
                    selectedJob.domaine ||
                    "Non spécifié"
                  }
                />

                {selectedJob.match_score !=
                  null && (
                  <ModalInfo
                    icon={Target}
                    label="Score de matching"
                    value={`${selectedJob.match_score}%`}
                    green
                  />
                )}

              </div>

              {selectedJob.description && (
                <section className="mt-7">

                  <h3 className="mb-3 text-sm font-bold text-slate-900">
                    Description du poste
                  </h3>

                  <div className="rounded-2xl bg-slate-50 p-5">

                    <p className="whitespace-pre-line text-sm leading-7 text-slate-600">
                      {selectedJob.description}
                    </p>

                  </div>

                </section>
              )}

              {selectedJob.skills && (
                <section className="mt-6">

                  <h3 className="mb-3 text-sm font-bold text-slate-900">
                    Compétences demandées
                  </h3>

                  <div className="rounded-2xl bg-slate-50 p-5">

                    <p className="whitespace-pre-line text-sm leading-7 text-slate-600">
                      {Array.isArray(
                        selectedJob.skills
                      )
                        ? selectedJob.skills.join(
                            ", "
                          )
                        : selectedJob.skills}
                    </p>

                  </div>

                </section>
              )}

              {(selectedJob.ai_analysis ||
                selectedJob.ai_summary) && (
                <section className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-5">

                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">

                      <Sparkles className="h-5 w-5 text-emerald-600" />

                    </div>

                    <h3 className="text-sm font-bold text-emerald-800">
                      Analyse IA
                    </h3>

                  </div>

                  <p className="mt-4 text-sm leading-7 text-slate-700">
                    {selectedJob.ai_analysis ||
                      selectedJob.ai_summary}
                  </p>

                </section>
              )}

              {selectedJob.recommendation && (
                <div className="mt-4 rounded-xl bg-white p-4">

                  <p className="text-xs font-bold text-emerald-700">
                    💡 Recommandation
                  </p>

                  <p className="mt-1 text-sm font-medium text-slate-700">
                    {selectedJob.recommendation}
                  </p>

                </div>
              )}

              {/* ACTIONS */}

              <div className="mt-7 flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">

                <button
                  type="button"
                  onClick={() =>
                    handleSaveJob(
                      selectedJob
                    )
                  }
                  disabled={
                    savingJobId ===
                    selectedJob.id
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >

                  {savingJobId ===
                  selectedJob.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : selectedJob.is_saved ? (
                    <BookmarkCheck className="h-4 w-4" />
                  ) : (
                    <Bookmark className="h-4 w-4" />
                  )}

                  {selectedJob.is_saved
                    ? "Sauvegardée"
                    : "Sauvegarder"}

                </button>

                {(selectedJob.apply_url ||
                  selectedJob.url ||
                  selectedJob.link) && (
                  <button
                    type="button"
                    onClick={() =>
                      handleApply(
                        selectedJob
                      )
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700"
                  >

                    Postuler

                    <ExternalLink className="h-4 w-4" />

                  </button>
                )}

              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

/* ============================================================
   STAT CARD
============================================================ */

function StatCard({
  label,
  value,
  icon: Icon,
  green = false,
  delay,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
  green?: boolean;
  delay: string;
}) {
  return (
    <div
      style={{
        animationDelay: delay,
      }}
      className="saas-card animate-fade-in p-5"
    >

      <div className="flex items-center justify-between">

        <div>

          <p className="text-xs font-semibold text-slate-400">
            {label}
          </p>

          <p
            className={[
              "mt-2 text-2xl font-black",
              green
                ? "text-emerald-600"
                : "text-slate-900",
            ].join(" ")}
          >
            {value}
          </p>

        </div>

        <div
          className={[
            "flex h-11 w-11 items-center justify-center rounded-xl",
            green
              ? "bg-emerald-50 text-emerald-600"
              : "bg-slate-50 text-slate-500",
          ].join(" ")}
        >

          <Icon className="h-5 w-5" />

        </div>

      </div>

    </div>
  );
}

/* ============================================================
   EMPTY STATE
============================================================ */

function EmptyState({
  hasSearch,
}: {
  hasSearch: boolean;
}) {
  return (
    <div className="saas-card flex min-h-[400px] flex-col items-center justify-center text-center">

      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50">

        <Search className="h-7 w-7 text-emerald-500" />

      </div>

      <h2 className="mt-5 text-lg font-bold text-slate-900">

        {hasSearch
          ? "Aucune offre trouvée"
          : "Aucune offre correspondante"}

      </h2>

      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">

        {hasSearch
          ? "Essayez avec un autre mot-clé, une autre entreprise ou une autre localisation."
          : "Lancez le matching IA pour rechercher les offres qui correspondent à votre profil."}

      </p>

    </div>
  );
}

/* ============================================================
   MODAL INFO
============================================================ */

function ModalInfo({
  icon: Icon,
  label,
  value,
  green = false,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  green?: boolean;
}) {
  return (
    <div
      className={[
        "rounded-2xl border p-4",
        green
          ? "border-emerald-100 bg-emerald-50"
          : "border-slate-100 bg-slate-50",
      ].join(" ")}
    >

      <div className="flex items-center gap-2">

        <Icon
          className={[
            "h-4 w-4",
            green
              ? "text-emerald-600"
              : "text-slate-400",
          ].join(" ")}
        />

        <p className="text-xs font-medium text-slate-400">
          {label}
        </p>

      </div>

      <p
        className={[
          "mt-2 text-sm font-bold",
          green
            ? "text-emerald-700"
            : "text-slate-800",
        ].join(" ")}
      >
        {value}
      </p>

    </div>
  );
}
