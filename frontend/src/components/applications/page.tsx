"use client";

import { useEffect, useState } from "react";
import {
  Briefcase,
  Loader2,
  RefreshCw,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

import ApplicationCard, {
  Application,
} from "@/components/applications/ApplicationCard";

interface JobRow {
  id: string;
  title: string | null;
  location: string | null;
  contract_type: string | null;
  remote: boolean | null;
  company_id: string | null;
}

interface CompanyRow {
  id: string;
  name: string | null;
  city: string | null;
  country: string | null;
  logo_url: string | null;
}

interface ApplicationRow {
  id: string;
  status: string | null;
  cv_url: string | null;
  cover_letter: string | null;
  applied_at: string | null;
  job_id: string;
}

export default function ApplicationsPage() {
  const [applications, setApplications] =
    useState<Application[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  async function loadApplications() {
    const supabase = createClient();

    setLoading(true);
    setError("");

    try {
      // --------------------------------------
      // 1. UTILISATEUR CONNECTÉ
      // --------------------------------------

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!user) {
        throw new Error(
          "Aucun utilisateur connecté."
        );
      }

      // --------------------------------------
      // 2. RÉCUPÉRER LES CANDIDATURES
      // --------------------------------------

      const {
        data: applicationRows,
        error: applicationsError,
      } = await supabase
        .from("applications")
        .select(
          "id, status, cv_url, cover_letter, applied_at, job_id"
        )
        .eq("profile_id", user.id)
        .order("applied_at", {
          ascending: false,
        });

      if (applicationsError) {
        throw applicationsError;
      }

      const rows =
        (applicationRows ??
          []) as ApplicationRow[];

      // --------------------------------------
      // AUCUNE CANDIDATURE
      // --------------------------------------

      if (rows.length === 0) {
        setApplications([]);
        return;
      }

      // --------------------------------------
      // 3. IDS DES JOBS
      // --------------------------------------

      const jobIds = Array.from(
        new Set(
          rows
            .map(
              (application) =>
                application.job_id
            )
            .filter(Boolean)
        )
      );

      if (jobIds.length === 0) {
        setApplications(
          rows.map((application) => ({
            id: application.id,
            status: application.status,
            cv_url: application.cv_url,
            cover_letter:
              application.cover_letter,
            applied_at:
              application.applied_at,
            job: null,
            company: null,
          }))
        );

        return;
      }

      // --------------------------------------
      // 4. RÉCUPÉRER LES JOBS
      // --------------------------------------

      const {
        data: jobData,
        error: jobsError,
      } = await supabase
        .from("jobs")
        .select(
          "id, title, location, contract_type, remote, company_id"
        )
        .in("id", jobIds);

      if (jobsError) {
        throw jobsError;
      }

      const jobs =
        (jobData ?? []) as JobRow[];

      // --------------------------------------
      // 5. IDS DES ENTREPRISES
      // --------------------------------------

      const companyIds = Array.from(
        new Set(
          jobs
            .map(
              (job) => job.company_id
            )
            .filter(
              (
                companyId
              ): companyId is string =>
                Boolean(companyId)
            )
        )
      );

      // --------------------------------------
      // 6. RÉCUPÉRER LES ENTREPRISES
      // --------------------------------------

      let companies: CompanyRow[] = [];

      if (companyIds.length > 0) {
        const {
          data: companyData,
          error: companiesError,
        } = await supabase
          .from("companies")
          .select(
            "id, name, city, country, logo_url"
          )
          .in("id", companyIds);

        if (companiesError) {
          throw companiesError;
        }

        companies =
          (companyData ??
            []) as CompanyRow[];
      }

      // --------------------------------------
      // 7. MAPS
      // --------------------------------------

      const jobsMap = new Map<
        string,
        JobRow
      >();

      jobs.forEach((job) => {
        jobsMap.set(job.id, job);
      });

      const companiesMap = new Map<
        string,
        CompanyRow
      >();

      companies.forEach((company) => {
        companiesMap.set(
          company.id,
          company
        );
      });

      // --------------------------------------
      // 8. CONSTRUIRE LES APPLICATIONS
      // --------------------------------------

      const formattedApplications: Application[] =
        rows.map((application) => {
          const job = jobsMap.get(
            application.job_id
          );

          let company:
            | CompanyRow
            | undefined;

          if (job?.company_id) {
            company =
              companiesMap.get(
                job.company_id
              );
          }

          return {
            id: application.id,

            status:
              application.status,

            cv_url:
              application.cv_url,

            cover_letter:
              application.cover_letter,

            applied_at:
              application.applied_at,

            job: job
              ? {
                  id: job.id,

                  title:
                    job.title ??
                    "Offre sans titre",

                  location:
                    job.location,

                  contract_type:
                    job.contract_type,

                  remote:
                    job.remote,
                }
              : null,

            company: company
              ? {
                  id: company.id,

                  name:
                    company.name,

                  city:
                    company.city,

                  country:
                    company.country,

                  logo_url:
                    company.logo_url,
                }
              : null,
          };
        });

      setApplications(
        formattedApplications
      );
    } catch (err) {
      console.error(
        "Erreur récupération candidatures :",
        err
      );

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(
          "Impossible de récupérer vos candidatures."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  // --------------------------------------
  // CHARGEMENT INITIAL
  // --------------------------------------

  useEffect(() => {
    loadApplications();
  }, []);

  // --------------------------------------
  // LOADING
  // --------------------------------------

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-stone-500">
          <Loader2
            size={20}
            className="animate-spin text-[#1F6F5F]"
          />

          <span>
            Chargement de vos candidatures...
          </span>
        </div>
      </div>
    );
  }

  // --------------------------------------
  // ERREUR
  // --------------------------------------

  if (error) {
    return (
      <div className="mx-auto max-w-3xl rounded-3xl border border-red-200 bg-red-50 p-8">
        <h2 className="text-lg font-bold text-red-800">
          Impossible de charger vos
          candidatures
        </h2>

        <p className="mt-2 text-sm text-red-700">
          {error}
        </p>

        <button
          type="button"
          onClick={loadApplications}
          className="mt-5 flex items-center gap-2 rounded-xl bg-red-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-800"
        >
          <RefreshCw size={16} />

          Réessayer
        </button>
      </div>
    );
  }

  // --------------------------------------
  // STATISTIQUES
  // --------------------------------------

  const totalApplications =
    applications.length;

  const pendingApplications =
    applications.filter(
      (application) => {
        const status = (
          application.status ??
          "En attente"
        ).toLowerCase();

        return (
          !status.includes("accept") &&
          !status.includes("refus") &&
          !status.includes("entretien") &&
          !status.includes("interview")
        );
      }
    ).length;

  const interviewApplications =
    applications.filter(
      (application) => {
        const status = (
          application.status ?? ""
        ).toLowerCase();

        return (
          status.includes("entretien") ||
          status.includes("interview")
        );
      }
    ).length;

  // --------------------------------------
  // PAGE
  // --------------------------------------

  return (
    <div className="space-y-8">
      {/* HEADER */}

      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold text-[#1F6F5F]">
            Emploi
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#1F2937]">
            Mes candidatures
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-500">
            Retrouvez toutes vos candidatures
            et suivez leur évolution au même
            endroit.
          </p>
        </div>

        <button
          type="button"
          onClick={loadApplications}
          className="flex items-center gap-2 self-start rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-semibold text-stone-600 transition hover:bg-stone-50 hover:text-[#1F6F5F] sm:self-auto"
        >
          <RefreshCw size={16} />

          Actualiser
        </button>
      </div>

      {/* STATISTIQUES */}

      <div className="grid gap-4 sm:grid-cols-3">
        {/* TOTAL */}

        <div className="rounded-2xl border border-stone-200 bg-white p-5">
          <p className="text-sm text-stone-500">
            Total
          </p>

          <p className="mt-2 text-3xl font-bold text-[#1F2937]">
            {totalApplications}
          </p>

          <p className="mt-1 text-xs text-stone-400">
            candidature
            {totalApplications > 1
              ? "s"
              : ""}
          </p>
        </div>

        {/* EN ATTENTE */}

        <div className="rounded-2xl border border-stone-200 bg-white p-5">
          <p className="text-sm text-stone-500">
            En attente
          </p>

          <p className="mt-2 text-3xl font-bold text-amber-600">
            {pendingApplications}
          </p>

          <p className="mt-1 text-xs text-stone-400">
            en cours
          </p>
        </div>

        {/* ENTRETIENS */}

        <div className="rounded-2xl border border-stone-200 bg-white p-5">
          <p className="text-sm text-stone-500">
            Entretiens
          </p>

          <p className="mt-2 text-3xl font-bold text-blue-600">
            {interviewApplications}
          </p>

          <p className="mt-1 text-xs text-stone-400">
            à suivre
          </p>
        </div>
      </div>

      {/* LISTE */}

      {applications.length === 0 ? (
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-3xl border border-dashed border-stone-300 bg-white p-8 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1F6F5F]/10 text-[#1F6F5F]">
            <Briefcase size={28} />
          </div>

          <h2 className="mt-5 text-xl font-bold text-[#1F2937]">
            Aucune candidature
          </h2>

          <p className="mt-2 max-w-md text-sm leading-6 text-stone-500">
            Vous n&apos;avez pas encore
            envoyé de candidature. Consultez
            les offres disponibles et postulez
            directement.
          </p>

          <a
            href="/jobs"
            className="mt-6 rounded-xl bg-[#1F6F5F] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#155443]"
          >
            Voir les offres
          </a>
        </div>
      ) : (
        <div className="grid gap-5">
          {applications.map(
            (application) => (
              <ApplicationCard
                key={application.id}
                application={application}
              />
            )
          )}
        </div>
      )}
    </div>
  );
}