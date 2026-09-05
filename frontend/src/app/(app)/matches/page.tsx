// src/app/(app)/matches/page.tsx

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

import {
  ExternalLink,
  FileText,
  Mail,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Send,
  MapPin,
  Building2,
  BriefcaseBusiness,
} from "lucide-react";

/* ============================================================
   TYPES
============================================================ */

type Job = {
  id: string;
  created_at?: string | null;

  company_id?: string | null;

  title?: string | null;
  description?: string | null;
  location?: string | null;

  contract_type?: string | null;
  remote?: boolean | null;

  salary_min?: number | null;
  salary_max?: number | null;
  currency?: string | null;

  experience_level?: string | null;

  skills?: string | null;

  published_at?: string | null;
  source?: string | null;
  external_id?: string | null;

  url?: string | null;

  domaine?: string | null;
  sous_domaine?: string | null;

  classification_score?: number | null;

  /* Résultats n8n */
  score?: number | null;
  match_score?: number | null;

  matched_skills?: string | string[] | null;
  missing_skills?: string | string[] | null;

  ai_summary?: string | null;
  recommendation?: string | null;
};

type Company = {
  id: string;
  name: string | null;
};

type MatchItem = {
  job: Job;
  company: Company | null;
};

type GenerationAction = {
  jobId: string;
  action: "cv" | "letter" | "both";
} | null;

type ApplyState = {
  jobId: string;
} | null;

/* ============================================================
   SUPABASE ENV
============================================================ */

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL;

const SUPABASE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/* ============================================================
   PAGE
============================================================ */

export default function MatchesPage() {
  const [matches, setMatches] = useState<MatchItem[]>([]);

  const [profileId, setProfileId] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [generating, setGenerating] =
    useState<GenerationAction>(null);

  const [applying, setApplying] =
    useState<ApplyState>(null);

  const [error, setError] =
    useState<string | null>(null);

  const [success, setSuccess] =
    useState<string | null>(null);

  /* ==========================================================
     SUPABASE
  ========================================================== */

  const supabase = useMemo(() => {
    if (!SUPABASE_URL || !SUPABASE_KEY) {
      throw new Error(
        "Variables Supabase manquantes dans .env.local."
      );
    }

    return createBrowserClient(
      SUPABASE_URL,
      SUPABASE_KEY
    );
  }, []);

  /* ==========================================================
     PROFILE ID
  ========================================================== */

  const getProfileId = useCallback(async () => {
    /* --------------------------------------------------------
       1. localStorage
    -------------------------------------------------------- */

    if (typeof window !== "undefined") {
      const localId =
        window.localStorage.getItem("profile_id");

      if (localId) {
        return localId;
      }
    }

    /* --------------------------------------------------------
       2. Supabase Auth
    -------------------------------------------------------- */

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user?.id) {
      const id = String(user.id);

      if (typeof window !== "undefined") {
        window.localStorage.setItem(
          "profile_id",
          id
        );
      }

      return id;
    }

    /* --------------------------------------------------------
       3. Premier profil
    -------------------------------------------------------- */

    const {
      data: profile,
      error: profileError,
    } = await supabase
      .from("profiles")
      .select("id")
      .limit(1)
      .maybeSingle();

    if (profileError) {
      throw new Error(
        profileError.message ||
          "Impossible de récupérer le profil."
      );
    }

    if (!profile?.id) {
      throw new Error(
        "Aucun profil trouvé. Crée d'abord ton profil."
      );
    }

    const id = String(profile.id);

    if (typeof window !== "undefined") {
      window.localStorage.setItem(
        "profile_id",
        id
      );
    }

    return id;
  }, [supabase]);

  /* ==========================================================
     NORMALIZE ARRAY
  ========================================================== */

  const normalizeArray = (
    value: any
  ): any[] => {
    if (Array.isArray(value)) {
      return value;
    }

    if (
      value &&
      typeof value === "object" &&
      Array.isArray(value.jobs)
    ) {
      return value.jobs;
    }

    if (
      value &&
      typeof value === "object" &&
      Array.isArray(value.matches)
    ) {
      return value.matches;
    }

    return [];
  };

  /* ==========================================================
     LOAD MATCHING
  ========================================================== */

  const loadMatches = useCallback(async () => {
    setError(null);

    try {
      /* ------------------------------------------------------
         PROFILE
      ------------------------------------------------------ */

      const currentProfileId =
        await getProfileId();

      setProfileId(currentProfileId);

      /* ------------------------------------------------------
         CALL MATCHING API
      ------------------------------------------------------ */

      const response = await fetch(
        "/api/jobs/match",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            profile_id: currentProfileId,
          }),
          cache: "no-store",
        }
      );

      const raw = await response.text();

      let data: any = {};

      try {
        data = raw
          ? JSON.parse(raw)
          : {};
      } catch {
        throw new Error(
          "La réponse du matching n'est pas un JSON valide."
        );
      }

      if (!response.ok) {
        throw new Error(
          data?.error ||
            data?.message ||
            data?.details ||
            `Erreur HTTP ${response.status}`
        );
      }

      if (data?.success === false) {
        throw new Error(
          data?.error ||
            data?.message ||
            "Le matching a échoué."
        );
      }

      /* ------------------------------------------------------
         GET JOBS
      ------------------------------------------------------ */

      let returnedJobs: any[] =
        normalizeArray(data?.jobs);

      if (returnedJobs.length === 0) {
        returnedJobs =
          normalizeArray(data?.matches);
      }

      if (
        returnedJobs.length === 0 &&
        Array.isArray(data)
      ) {
        returnedJobs = data;
      }

      /* ------------------------------------------------------
         SUPPORT STRUCTURES
      ------------------------------------------------------ */

      returnedJobs = returnedJobs.map(
        (item: any) => {
          if (
            item?.job &&
            typeof item.job === "object"
          ) {
            return {
              ...item.job,

              score:
                item.score ??
                item.match_score ??
                item.job.score ??
                item.job.match_score ??
                null,

              match_score:
                item.score ??
                item.match_score ??
                item.job.score ??
                item.job.match_score ??
                null,

              matched_skills:
                item.matched_skills ??
                item.job.matched_skills ??
                null,

              missing_skills:
                item.missing_skills ??
                item.job.missing_skills ??
                null,

              ai_summary:
                item.ai_summary ??
                item.job.ai_summary ??
                null,

              recommendation:
                item.recommendation ??
                item.job.recommendation ??
                null,
            };
          }

          return item;
        }
      );

      /* ------------------------------------------------------
         VALIDATE
      ------------------------------------------------------ */

      const validJobs =
        returnedJobs.filter(
          (job: any) =>
            job &&
            job.id
        );

      /* ------------------------------------------------------
         SORT
      ------------------------------------------------------ */

      validJobs.sort(
        (a: any, b: any) => {
          const scoreA = Number(
            a.score ??
              a.match_score ??
              a.classification_score ??
              0
          );

          const scoreB = Number(
            b.score ??
              b.match_score ??
              b.classification_score ??
              0
          );

          return scoreB - scoreA;
        }
      );

      /* ------------------------------------------------------
         COMPANIES
      ------------------------------------------------------ */

      const companyIds = [
        ...new Set(
          validJobs
            .map(
              (job: any) =>
                job.company_id
            )
            .filter(Boolean)
            .map(String)
        ),
      ];

      let companies: Company[] = [];

      if (companyIds.length > 0) {
        const {
          data: companyData,
          error: companyError,
        } = await supabase
          .from("companies")
          .select("id, name")
          .in(
            "id",
            companyIds
          );

        if (companyError) {
          console.warn(
            "⚠️ Erreur chargement entreprises:",
            companyError.message
          );
        }

        companies =
          (companyData || []) as Company[];
      }

      /* ------------------------------------------------------
         MERGE
      ------------------------------------------------------ */

      const result: MatchItem[] =
        validJobs.map(
          (job: any) => {
            const company =
              job.company_id
                ? companies.find(
                    (item) =>
                      String(item.id) ===
                      String(job.company_id)
                  ) || null
                : null;

            return {
              job: {
                ...job,

                score:
                  job.score ??
                  job.match_score ??
                  null,

                match_score:
                  job.match_score ??
                  job.score ??
                  null,
              } as Job,

              company,
            };
          }
        );

      setMatches(result);

      console.log(
        "✅ MATCHING RESULT:",
        {
          total: result.length,
          data,
        }
      );

      if (result.length === 0) {
        setSuccess(
          "Le matching est terminé, mais aucune offre n'atteint le seuil de compatibilité."
        );
      }
    } catch (err) {
      console.error(
        "❌ Erreur loadMatches:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Erreur lors du chargement des correspondances."
      );
    }
  }, [
    getProfileId,
    supabase,
  ]);

  /* ==========================================================
     INITIAL LOAD
  ========================================================== */

  useEffect(() => {
    async function init() {
      setLoading(true);

      try {
        await loadMatches();
      } finally {
        setLoading(false);
      }
    }

    init();
  }, [loadMatches]);

  /* ==========================================================
     REFRESH
  ========================================================== */

  const handleRefresh = async () => {
    setRefreshing(true);
    setError(null);
    setSuccess(null);

    try {
      await loadMatches();

      setSuccess(
        "Les correspondances ont été actualisées."
      );
    } finally {
      setRefreshing(false);
    }
  };

  /* ==========================================================
     PARSE SKILLS
  ========================================================== */

  const parseSkills = (
    value:
      | string
      | string[]
      | null
      | undefined
  ): string[] => {
    if (!value) {
      return [];
    }

    if (Array.isArray(value)) {
      return value
        .map(String)
        .map((item) => item.trim())
        .filter(Boolean);
    }

    try {
      const parsed =
        JSON.parse(value);

      if (Array.isArray(parsed)) {
        return parsed
          .map(String)
          .map((item) => item.trim())
          .filter(Boolean);
      }
    } catch {
      // valeur texte normale
    }

    return String(value)
      .split(/[,;|\n]/)
      .map((item) => item.trim())
      .filter(Boolean);
  };

  /* ==========================================================
     GENERATE CV / LETTER
  ========================================================== */

  const handleGenerate = async (
    jobId: string,
    action:
      | "cv"
      | "letter"
      | "both"
  ) => {
    if (!profileId) {
      setError(
        "Profil introuvable."
      );
      return;
    }

    if (generating) {
      return;
    }

    setGenerating({
      jobId,
      action,
    });

    setError(null);
    setSuccess(null);

    try {
      const response =
        await fetch(
          "/api/resume/generate",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              profile_id:
                profileId,
              job_id:
                jobId,
              action,
            }),
            cache: "no-store",
          }
        );

      const text =
        await response.text();

      let data: any = {};

      try {
        data = text
          ? JSON.parse(text)
          : {};
      } catch {
        data = {
          raw: text,
        };
      }

      if (!response.ok) {
        throw new Error(
          data?.error ||
            data?.message ||
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
            "La génération a échoué."
        );
      }

      /* ------------------------------------------------------
         OPEN BASE64 PDF
      ------------------------------------------------------ */

      const openBase64Pdf = (
        base64: string,
        filename: string
      ) => {
        try {
          const cleanBase64 =
            base64.includes(",")
              ? base64.split(",")[1]
              : base64;

          const byteCharacters =
            atob(cleanBase64);

          const byteNumbers =
            new Array(
              byteCharacters.length
            );

          for (
            let i = 0;
            i <
            byteCharacters.length;
            i++
          ) {
            byteNumbers[i] =
              byteCharacters.charCodeAt(
                i
              );
          }

          const byteArray =
            new Uint8Array(
              byteNumbers
            );

          const blob =
            new Blob(
              [byteArray],
              {
                type: "application/pdf",
              }
            );

          const url =
            window.URL.createObjectURL(
              blob
            );

          const link =
            document.createElement(
              "a"
            );

          link.href = url;
          link.target =
            "_blank";
          link.rel =
            "noopener noreferrer";
          link.download =
            filename;

          document.body.appendChild(
            link
          );

          link.click();

          link.remove();

          setTimeout(() => {
            window.URL.revokeObjectURL(
              url
            );
          }, 10000);
        } catch {
          throw new Error(
            "Impossible d'ouvrir le PDF généré."
          );
        }
      };

      /* ------------------------------------------------------
         CV
      ------------------------------------------------------ */

      if (action === "cv") {
        if (data.cv_base64) {
          openBase64Pdf(
            data.cv_base64,
            "CV-personnalise.pdf"
          );
        } else if (data.cv_url) {
          window.open(
            data.cv_url,
            "_blank",
            "noopener,noreferrer"
          );
        }
      }

      /* ------------------------------------------------------
         LETTER
      ------------------------------------------------------ */

      if (action === "letter") {
        if (
          data.cover_letter_base64
        ) {
          openBase64Pdf(
            data.cover_letter_base64,
            "Lettre-de-motivation.pdf"
          );
        } else if (
          data.cover_letter_url
        ) {
          window.open(
            data.cover_letter_url,
            "_blank",
            "noopener,noreferrer"
          );
        }
      }

      /* ------------------------------------------------------
         BOTH
      ------------------------------------------------------ */

      if (action === "both") {
        if (data.cv_base64) {
          openBase64Pdf(
            data.cv_base64,
            "CV-personnalise.pdf"
          );
        } else if (data.cv_url) {
          window.open(
            data.cv_url,
            "_blank",
            "noopener,noreferrer"
          );
        }

        if (
          data.cover_letter_base64
        ) {
          setTimeout(() => {
            openBase64Pdf(
              data.cover_letter_base64,
              "Lettre-de-motivation.pdf"
            );
          }, 500);
        } else if (
          data.cover_letter_url
        ) {
          setTimeout(() => {
            window.open(
              data.cover_letter_url,
              "_blank",
              "noopener,noreferrer"
            );
          }, 500);
        }
      }

      const label =
        action === "cv"
          ? "CV"
          : action === "letter"
          ? "lettre de motivation"
          : "CV et lettre de motivation";

      setSuccess(
        `${label} généré(e) avec succès.`
      );
    } catch (err) {
      console.error(
        "❌ Erreur génération:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Erreur pendant la génération."
      );
    } finally {
      setGenerating(null);
    }
  };

  /* ==========================================================
     APPLY
  ========================================================== */

  const handleApply = async (
    jobId: string
  ) => {
    if (!profileId) {
      setError(
        "Profil introuvable."
      );
      return;
    }

    if (applying) {
      return;
    }

    setApplying({
      jobId,
    });

    setError(null);
    setSuccess(null);

    try {
      /* ======================================================
         ÉTAPE 1
         CRÉER LA CANDIDATURE
      ====================================================== */

      console.log(
        "========================================"
      );

      console.log(
        "🚀 DÉBUT CANDIDATURE"
      );

      console.log({
        profile_id: profileId,
        job_id: jobId,
      });

      console.log(
        "========================================"
      );

      const applicationResponse =
        await fetch(
          "/api/jobs/apply",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              profile_id:
                profileId,
              job_id:
                jobId,
            }),

            cache: "no-store",
          }
        );

      /* ------------------------------------------------------
         READ RESPONSE
      ------------------------------------------------------ */

      const applicationText =
        await applicationResponse.text();

      let applicationData: any =
        {};

      try {
        applicationData =
          applicationText
            ? JSON.parse(
                applicationText
              )
            : {};
      } catch {
        applicationData = {
          raw:
            applicationText,
        };
      }

      console.log(
        "📥 /api/jobs/apply:",
        applicationData
      );

      /* ------------------------------------------------------
         HTTP ERROR
      ------------------------------------------------------ */

      if (
        !applicationResponse.ok
      ) {
        throw new Error(
          applicationData?.error ||
            applicationData?.message ||
            `Erreur création candidature HTTP ${applicationResponse.status}`
        );
      }

      /* ------------------------------------------------------
         API ERROR
      ------------------------------------------------------ */

      if (
        applicationData?.success ===
        false
      ) {
        throw new Error(
          applicationData?.error ||
            applicationData?.message ||
            "Impossible de créer la candidature."
        );
      }

      /* ======================================================
         ÉTAPE 2
         APPLICATION ID
      ====================================================== */

      const applicationId =
        applicationData?.application_id ||
        applicationData?.application?.id ||
        applicationData?.data?.application_id ||
        applicationData?.data?.id;

      console.log(
        "🆔 application_id:",
        applicationId
      );

      if (!applicationId) {
        throw new Error(
          "La candidature a été créée, mais aucun application_id n'a été retourné par /api/jobs/apply."
        );
      }

      /* ======================================================
         ÉTAPE 3
         IMPORTANT :
         SI /api/jobs/apply A DÉJÀ APPELÉ N8N,
         NE PAS APPELER N8N UNE DEUXIÈME FOIS.
      ====================================================== */

      if (applicationData?.n8n) {
        console.log(
          "✅ /api/jobs/apply a déjà envoyé la candidature à n8n."
        );

        const n8nResult =
          applicationData.n8n;

        /* ----------------------------------------------------
           MANUAL REQUIRED
        ---------------------------------------------------- */

        if (
          n8nResult?.status ===
            "manual_required" ||
          n8nResult?.data?.status ===
            "manual_required"
        ) {
          setSuccess(
            n8nResult?.message ||
              n8nResult?.data?.message ||
              "La candidature nécessite une action manuelle."
          );
        } else {
          setSuccess(
            applicationData?.message ||
              n8nResult?.message ||
              "La candidature a été envoyée au workflow avec succès."
          );
        }

        await loadMatches();

        return;
      }

      /* ======================================================
         ÉTAPE 4
         FALLBACK :
         APPEL /api/applications/submit
      ====================================================== */

      console.log(
        "📨 Appel /api/applications/submit..."
      );

      const submissionResponse =
        await fetch(
          "/api/applications/submit",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              application_id:
                applicationId,

              profile_id:
                profileId,

              job_id:
                jobId,
            }),

            cache: "no-store",
          }
        );

      const submissionText =
        await submissionResponse.text();

      let submissionData: any =
        {};

      try {
        submissionData =
          submissionText
            ? JSON.parse(
                submissionText
              )
            : {};
      } catch {
        submissionData = {
          raw:
            submissionText,
        };
      }

      console.log(
        "📤 /api/applications/submit:",
        submissionData
      );

      /* ------------------------------------------------------
         HTTP ERROR
      ------------------------------------------------------ */

      if (
        !submissionResponse.ok
      ) {
        throw new Error(
          submissionData?.error ||
            submissionData?.message ||
            `Erreur soumission HTTP ${submissionResponse.status}`
        );
      }

      /* ------------------------------------------------------
         API ERROR
      ------------------------------------------------------ */

      if (
        submissionData?.success ===
        false
      ) {
        throw new Error(
          submissionData?.error ||
            submissionData?.message ||
            "Le workflow de candidature a échoué."
        );
      }

      /* ======================================================
         ÉTAPE 5
         RESULTAT N8N
      ====================================================== */

      const n8nResult =
        submissionData?.n8n ||
        submissionData;

      const n8nStatus =
        n8nResult?.status ||
        n8nResult?.data?.status ||
        null;

      const n8nMessage =
        n8nResult?.message ||
        n8nResult?.data?.message ||
        submissionData?.message ||
        null;

      if (
        n8nStatus ===
        "manual_required"
      ) {
        setSuccess(
          n8nMessage ||
            "Les documents sont prêts. Une action manuelle est nécessaire pour finaliser la candidature."
        );
      } else {
        setSuccess(
          n8nMessage ||
            "La candidature a été envoyée au workflow avec succès."
        );
      }

      /* ======================================================
         ÉTAPE 6
         REFRESH
      ====================================================== */

      await loadMatches();

      console.log(
        "========================================"
      );

      console.log(
        "🎉 CANDIDATURE TERMINÉE"
      );

      console.log(
        "Application ID:",
        applicationId
      );

      console.log(
        "========================================"
      );
    } catch (err) {
      console.error(
        "❌ Erreur candidature:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Erreur pendant la candidature."
      );
    } finally {
      setApplying(null);
    }
  };

  /* ==========================================================
     STATISTICS
  ========================================================== */

  const statistics = useMemo(() => {
    const scores =
      matches
        .map(
          ({ job }) =>
            Number(
              job.score ??
                job.match_score ??
                0
            )
        )
        .filter(
          (score) =>
            !Number.isNaN(score)
        );

    const excellent =
      scores.filter(
        (score) =>
          score >= 80
      ).length;

    const good =
      scores.filter(
        (score) =>
          score >= 60 &&
          score < 80
      ).length;

    const average =
      scores.length > 0
        ? Math.round(
            scores.reduce(
              (
                sum,
                score
              ) =>
                sum + score,
              0
            ) /
              scores.length
          )
        : 0;

    return {
      total: matches.length,
      excellent,
      good,
      average,
    };
  }, [matches]);

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <main className="min-h-screen bg-[#f8faf9] p-6">
      <div className="mx-auto max-w-7xl">

        {/* ====================================================
            HEADER
        ==================================================== */}

        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

          <div>
            <div className="mb-2 flex items-center gap-2">

              <Sparkles
                className="text-[#005c45]"
                size={22}
              />

              <span className="text-sm font-semibold uppercase tracking-wide text-[#005c45]">
                Intelligence artificielle
              </span>

            </div>

            <h1 className="text-3xl font-bold text-slate-900">
              Mes correspondances
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Les offres d'emploi les plus
              compatibles avec ton profil.
            </p>
          </div>

          <button
            type="button"
            onClick={
              handleRefresh
            }
            disabled={
              refreshing
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#005c45] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#004735] disabled:cursor-not-allowed disabled:opacity-60"
          >

            <RefreshCw
              size={17}
              className={
                refreshing
                  ? "animate-spin"
                  : ""
              }
            />

            {refreshing
              ? "Actualisation..."
              : "Actualiser"}

          </button>

        </div>

        {/* ====================================================
            ERROR
        ==================================================== */}

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">

            <XCircle
              size={20}
              className="mt-0.5 shrink-0"
            />

            <div>

              <p className="font-semibold">
                Erreur
              </p>

              <p className="mt-1 text-sm">
                {error}
              </p>

            </div>

          </div>
        )}

        {/* ====================================================
            SUCCESS
        ==================================================== */}

        {success && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-700">

            <CheckCircle2
              size={20}
              className="mt-0.5 shrink-0"
            />

            <div>

              <p className="font-semibold">
                Succès
              </p>

              <p className="mt-1 text-sm">
                {success}
              </p>

            </div>

          </div>
        )}

        {/* ====================================================
            STATS
        ==================================================== */}

        {!loading &&
          matches.length > 0 && (
            <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

              <StatCard
                label="Correspondances"
                value={
                  statistics.total
                }
              />

              <StatCard
                label="Score moyen"
                value={`${statistics.average}%`}
                green
              />

              <StatCard
                label="Excellent match"
                value={
                  statistics.excellent
                }
                green
              />

              <StatCard
                label="Bon match"
                value={
                  statistics.good
                }
              />

            </div>
          )}

        {/* ====================================================
            LOADING
        ==================================================== */}

        {loading && (
          <div className="rounded-2xl border border-slate-200 bg-white p-16 text-center shadow-sm">

            <RefreshCw
              size={30}
              className="mx-auto animate-spin text-[#005c45]"
            />

            <p className="mt-4 text-sm text-slate-500">
              Analyse des offres en cours...
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Recherche parmi les offres disponibles
            </p>

          </div>
        )}

        {/* ====================================================
            EMPTY
        ==================================================== */}

        {!loading &&
          matches.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-16 text-center shadow-sm">

              <Sparkles
                size={40}
                className="mx-auto text-slate-300"
              />

              <h2 className="mt-4 text-xl font-bold text-slate-900">
                Aucune correspondance
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                Aucune offre ne correspond
                actuellement suffisamment à ton
                profil.
              </p>

              <button
                type="button"
                onClick={
                  handleRefresh
                }
                className="mt-6 rounded-xl bg-[#005c45] px-5 py-3 text-sm font-semibold text-white hover:bg-[#004735]"
              >
                Relancer le matching
              </button>

            </div>
          )}

        {/* ====================================================
            MATCHES
        ==================================================== */}

        {!loading &&
          matches.length > 0 && (
            <div className="space-y-5">

              {matches.map(
                ({
                  job,
                  company,
                }) => {

                  const score =
                    Number(
                      job.score ??
                        job.match_score ??
                        0
                    );

                  const matchedSkills =
                    parseSkills(
                      job.matched_skills
                    );

                  const missingSkills =
                    parseSkills(
                      job.missing_skills
                    );

                  const companyName =
                    company?.name ||
                    "Entreprise non spécifiée";

                  const generatingCv =
                    generating?.jobId ===
                      String(job.id) &&
                    generating.action ===
                      "cv";

                  const generatingLetter =
                    generating?.jobId ===
                      String(job.id) &&
                    generating.action ===
                      "letter";

                  const generatingBoth =
                    generating?.jobId ===
                      String(job.id) &&
                    generating.action ===
                      "both";

                  const applyingJob =
                    applying?.jobId ===
                    String(job.id);

                  return (
                    <article
                      key={String(
                        job.id
                      )}
                      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                    >

                      <div className="p-6">

                        {/* ==================================================
                            TOP
                        ================================================== */}

                        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">

                          <div className="min-w-0 flex-1">

                            <div className="mb-3 flex flex-wrap items-center gap-2">

                              {job.domaine && (
                                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-[#005c45]">
                                  {job.domaine}
                                </span>
                              )}

                              {job.sous_domaine && (
                                <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                                  {job.sous_domaine}
                                </span>
                              )}

                              {job.source && (
                                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500">
                                  {job.source}
                                </span>
                              )}

                            </div>

                            <h2 className="text-xl font-bold text-slate-900">
                              {job.title ||
                                "Poste non spécifié"}
                            </h2>

                            <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-500">

                              <span className="inline-flex items-center gap-1.5">
                                <Building2
                                  size={16}
                                />

                                {companyName}
                              </span>

                              {job.location && (
                                <span className="inline-flex items-center gap-1.5">
                                  <MapPin
                                    size={16}
                                  />

                                  {job.location}
                                </span>
                              )}

                              {job.contract_type && (
                                <span className="inline-flex items-center gap-1.5">
                                  <BriefcaseBusiness
                                    size={16}
                                  />

                                  {
                                    job.contract_type
                                  }
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

                          <div
                            className={`shrink-0 rounded-2xl px-6 py-4 text-center ${
                              score >= 80
                                ? "bg-emerald-50"
                                : score >= 60
                                ? "bg-amber-50"
                                : "bg-slate-100"
                            }`}
                          >

                            <div
                              className={`text-3xl font-bold ${
                                score >= 80
                                  ? "text-emerald-700"
                                  : score >= 60
                                  ? "text-amber-700"
                                  : "text-slate-700"
                              }`}
                            >
                              {score}%
                            </div>

                            <div className="mt-1 text-xs font-semibold text-slate-500">
                              COMPATIBILITÉ
                            </div>

                          </div>

                        </div>

                        {/* ==================================================
                            SCORE BAR
                        ================================================== */}

                        <div className="mt-6">

                          <div className="mb-2 flex justify-between">

                            <span className="text-xs font-semibold text-slate-400">
                              Compatibilité avec ton profil
                            </span>

                            <span className="text-xs font-bold text-slate-500">
                              {score}%
                            </span>

                          </div>

                          <div className="h-2 overflow-hidden rounded-full bg-slate-100">

                            <div
                              className={`h-full rounded-full ${
                                score >= 80
                                  ? "bg-emerald-500"
                                  : score >= 60
                                  ? "bg-amber-500"
                                  : "bg-slate-400"
                              }`}
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

                        {/* ==================================================
                            DESCRIPTION
                        ================================================== */}

                        {job.description && (
                          <div className="mt-5">

                            <p className="line-clamp-4 text-sm leading-6 text-slate-600">
                              {
                                job.description
                              }
                            </p>

                          </div>
                        )}

                        {/* ==================================================
                            SALARY
                        ================================================== */}

                        {(job.salary_min !=
                          null ||
                          job.salary_max !=
                            null) && (
                          <div className="mt-4">

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

                        {/* ==================================================
                            SKILLS
                        ================================================== */}

                        {(matchedSkills.length >
                          0 ||
                          missingSkills.length >
                            0) && (
                          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">

                            {/* MATCHED */}

                            <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">

                              <div className="mb-3 flex items-center gap-2">

                                <CheckCircle2
                                  size={17}
                                  className="text-emerald-600"
                                />

                                <h3 className="text-sm font-semibold text-emerald-800">
                                  Compétences correspondantes
                                </h3>

                              </div>

                              {matchedSkills.length >
                              0 ? (
                                <div className="flex flex-wrap gap-2">

                                  {matchedSkills.map(
                                    (
                                      skill,
                                      index
                                    ) => (
                                      <span
                                        key={`${skill}-${index}`}
                                        className="rounded-lg bg-white px-2.5 py-1.5 text-xs font-semibold text-emerald-700 shadow-sm"
                                      >
                                        {
                                          skill
                                        }
                                      </span>
                                    )
                                  )}

                                </div>
                              ) : (
                                <p className="text-sm text-emerald-800">
                                  Correspondance détectée par le système.
                                </p>
                              )}

                            </div>

                            {/* MISSING */}

                            <div className="rounded-xl border border-red-100 bg-red-50 p-4">

                              <div className="mb-3 flex items-center gap-2">

                                <XCircle
                                  size={17}
                                  className="text-red-500"
                                />

                                <h3 className="text-sm font-semibold text-red-800">
                                  Compétences manquantes
                                </h3>

                              </div>

                              {missingSkills.length >
                              0 ? (
                                <div className="flex flex-wrap gap-2">

                                  {missingSkills.map(
                                    (
                                      skill,
                                      index
                                    ) => (
                                      <span
                                        key={`${skill}-${index}`}
                                        className="rounded-lg bg-white px-2.5 py-1.5 text-xs font-semibold text-red-700 shadow-sm"
                                      >
                                        {
                                          skill
                                        }
                                      </span>
                                    )
                                  )}

                                </div>
                              ) : (
                                <p className="text-sm text-red-800">
                                  Aucune compétence manquante importante.
                                </p>
                              )}

                            </div>

                          </div>
                        )}

                        {/* ==================================================
                            AI SUMMARY
                        ================================================== */}

                        {(job.ai_summary ||
                          job.recommendation) && (
                          <div className="mt-5 rounded-xl border border-[#005c45]/10 bg-[#005c45]/5 p-4">

                            <div className="mb-2 flex items-center gap-2">

                              <Sparkles
                                size={17}
                                className="text-[#005c45]"
                              />

                              <h3 className="text-sm font-bold text-[#005c45]">
                                Analyse IA
                              </h3>

                            </div>

                            {job.ai_summary && (
                              <p className="text-sm leading-6 text-slate-700">
                                {
                                  job.ai_summary
                                }
                              </p>
                            )}

                            {job.recommendation && (
                              <p className="mt-3 text-sm font-semibold text-[#005c45]">
                                💡{" "}
                                {
                                  job.recommendation
                                }
                              </p>
                            )}

                          </div>
                        )}

                        {/* ==================================================
                            ACTIONS
                        ================================================== */}

                        <div className="mt-6 flex flex-wrap gap-3 border-t border-slate-100 pt-5">

                          {/* VIEW */}

                          {job.url && (
                            <a
                              href={
                                job.url
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                            >

                              <ExternalLink
                                size={16}
                              />

                              Voir l'offre

                            </a>
                          )}

                          {/* APPLY */}

                          <button
                            type="button"
                            disabled={
                              applying !== null ||
                              generating !== null
                            }
                            onClick={() =>
                              handleApply(
                                String(
                                  job.id
                                )
                              )
                            }
                            className="inline-flex items-center gap-2 rounded-xl bg-[#005c45] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#004735] disabled:cursor-not-allowed disabled:opacity-50"
                          >

                            {applyingJob ? (
                              <>
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                                Préparation...
                              </>
                            ) : (
                              <>
                                <Send
                                  size={16}
                                />

                                Préparer & candidater
                              </>
                            )}

                          </button>

                          {/* CV */}

                          <button
                            type="button"
                            disabled={
                              generating !== null ||
                              applying !== null
                            }
                            onClick={() =>
                              handleGenerate(
                                String(
                                  job.id
                                ),
                                "cv"
                              )
                            }
                            className="inline-flex items-center gap-2 rounded-xl border border-[#005c45] px-4 py-2.5 text-sm font-semibold text-[#005c45] hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >

                            <FileText
                              size={16}
                            />

                            {generatingCv
                              ? "Génération..."
                              : "Générer CV"}

                          </button>

                          {/* LETTER */}

                          <button
                            type="button"
                            disabled={
                              generating !== null ||
                              applying !== null
                            }
                            onClick={() =>
                              handleGenerate(
                                String(
                                  job.id
                                ),
                                "letter"
                              )
                            }
                            className="inline-flex items-center gap-2 rounded-xl border border-[#005c45] px-4 py-2.5 text-sm font-semibold text-[#005c45] hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >

                            <Mail
                              size={16}
                            />

                            {generatingLetter
                              ? "Génération..."
                              : "Générer lettre"}

                          </button>

                          {/* BOTH */}

                          <button
                            type="button"
                            disabled={
                              generating !== null ||
                              applying !== null
                            }
                            onClick={() =>
                              handleGenerate(
                                String(
                                  job.id
                                ),
                                "both"
                              )
                            }
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >

                            <FileText
                              size={16}
                            />

                            {generatingBoth
                              ? "Génération..."
                              : "Générer CV + lettre"}

                          </button>

                        </div>

                      </div>

                    </article>
                  );
                }
              )}

            </div>
          )}

      </div>
    </main>
  );
}

/* ============================================================
   STAT CARD
============================================================ */

function StatCard({
  label,
  value,
  green = false,
}: {
  label: string;
  value: number | string;
  green?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

      <p className="text-sm text-slate-500">
        {label}
      </p>

      <p
        className={`mt-2 text-3xl font-bold ${
          green
            ? "text-[#005c45]"
            : "text-slate-900"
        }`}
      >
        {value}
      </p>

    </div>
  );
}