"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";

type Application = {
  id: string | number;
  profile_id: string | null;
  job_id: string | null;
  status: string | null;
  cv_url: string | null;
  cover_letter: string | null;
  applied_at: string | null;
  created_at: string | null;
};

type Job = {
  id: string;
  title: string | null;
  company_id: string | null;
  location: string | null;
  contract_type: string | null;
  remote: boolean | null;
  url: string | null;
  source: string | null;
  domaine: string | null;
};

type Company = {
  id: string;
  name: string | null;
};

type TimelineStep = {
  key: string;
  label: string;
  description: string;
};

const TIMELINE: TimelineStep[] = [
  {
    key: "created",
    label: "Candidature créée",
    description: "Votre candidature a été préparée.",
  },
  {
    key: "preparing",
    label: "Préparation",
    description: "Les documents sont en cours de préparation.",
  },
  {
    key: "ready",
    label: "Prête",
    description: "Votre CV et votre lettre sont prêts.",
  },
  {
    key: "confirmed",
    label: "Validation",
    description: "La candidature est prête à être soumise.",
  },
  {
    key: "submitted",
    label: "Soumise",
    description: "La candidature a été envoyée.",
  },
  {
    key: "interview",
    label: "Entretien",
    description: "Un entretien a été proposé ou programmé.",
  },
  {
    key: "accepted",
    label: "Acceptée",
    description: "La candidature a été acceptée.",
  },
];

const STATUS_LABELS: Record<string, string> = {
  pending: "En attente",
  preparing: "Préparation",
  ready: "Prête",
  confirmed: "Validée",
  submitted: "Soumise",
  interview: "Entretien",
  accepted: "Acceptée",
  rejected: "Refusée",
  manual_required: "Action manuelle",
  failed: "Échec",
};

function normalizeStatus(status: string | null) {
  return String(status || "pending").toLowerCase().trim();
}

function getStatusLabel(status: string | null) {
  const normalized = normalizeStatus(status);
  return STATUS_LABELS[normalized] || normalized;
}

function getStatusStyle(status: string | null) {
  const normalized = normalizeStatus(status);

  switch (normalized) {
    case "accepted":
      return "bg-green-100 text-green-700 border-green-200";

    case "submitted":
    case "interview":
      return "bg-green-50 text-green-700 border-green-200";

    case "ready":
    case "confirmed":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";

    case "preparing":
      return "bg-blue-50 text-blue-700 border-blue-200";

    case "manual_required":
      return "bg-orange-50 text-orange-700 border-orange-200";

    case "failed":
    case "rejected":
      return "bg-red-50 text-red-700 border-red-200";

    default:
      return "bg-slate-100 text-slate-700 border-slate-200";
  }
}

function getTimelineIndex(status: string | null) {
  const normalized = normalizeStatus(status);

  switch (normalized) {
    case "created":
    case "pending":
      return 0;

    case "preparing":
      return 1;

    case "ready":
      return 2;

    case "confirmed":
    case "manual_required":
      return 3;

    case "submitted":
      return 4;

    case "interview":
      return 5;

    case "accepted":
      return 6;

    case "failed":
      return 1;

    case "rejected":
      return -1;

    default:
      return 0;
  }
}

function formatDate(date: string | null) {
  if (!date) return "Date inconnue";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "Date inconnue";
  }

  return parsed.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatDateTime(date: string | null) {
  if (!date) return "Date inconnue";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "Date inconnue";
  }

  return parsed.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function TrackingPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [jobs, setJobs] = useState<Record<string, Job>>({});
  const [companies, setCompanies] = useState<Record<string, Company>>({});

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState<string | number | null>(
    null
  );

  const loadApplications = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const {
        data: { user },
      } = await supabase.auth.getUser();

      let profileId = user?.id ?? null;

      if (!profileId && typeof window !== "undefined") {
        profileId = localStorage.getItem("profile_id");
      }

      if (!profileId) {
        throw new Error(
          "Impossible d'identifier votre profil. Connectez-vous ou configurez votre profile_id."
        );
      }

      /*
       * IMPORTANT :
       * applications.updated_at n'existe pas dans votre base.
       * On ne le sélectionne donc PAS.
       */
      const {
        data: applicationsData,
        error: applicationsError,
      } = await supabase
        .from("applications")
        .select(
          `
            id,
            profile_id,
            job_id,
            status,
            cv_url,
            cover_letter,
            applied_at,
            created_at
          `
        )
        .eq("profile_id", profileId)
        .order("created_at", {
          ascending: false,
        });

      if (applicationsError) {
        throw new Error(applicationsError.message);
      }

      const applicationRows = (applicationsData ||
        []) as Application[];

      setApplications(applicationRows);

      const jobIds = Array.from(
        new Set(
          applicationRows
            .map((application) => application.job_id)
            .filter((id): id is string => Boolean(id))
        )
      );

      if (jobIds.length === 0) {
        setJobs({});
        setCompanies({});
        return;
      }

      const {
        data: jobsData,
        error: jobsError,
      } = await supabase
        .from("jobs")
        .select(
          `
            id,
            title,
            company_id,
            location,
            contract_type,
            remote,
            url,
            source,
            domaine
          `
        )
        .in("id", jobIds);

      if (jobsError) {
        throw new Error(jobsError.message);
      }

      const jobMap: Record<string, Job> = {};

      ((jobsData || []) as Job[]).forEach((job) => {
        jobMap[String(job.id)] = job;
      });

      setJobs(jobMap);

      const companyIds = Array.from(
        new Set(
          (jobsData || [])
            .map((job: Job) => job.company_id)
            .filter((id): id is string => Boolean(id))
        )
      );

      if (companyIds.length === 0) {
        setCompanies({});
        return;
      }

      const {
        data: companiesData,
        error: companiesError,
      } = await supabase
        .from("companies")
        .select("id, name")
        .in("id", companyIds);

      if (companiesError) {
        throw new Error(companiesError.message);
      }

      const companyMap: Record<string, Company> = {};

      ((companiesData || []) as Company[]).forEach((company) => {
        companyMap[String(company.id)] = company;
      });

      setCompanies(companyMap);
    } catch (err) {
      console.error("TRACKING LOAD ERROR:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Impossible de charger le suivi des candidatures."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  const selectedApplication = useMemo(() => {
    if (selectedId === null) return null;

    return (
      applications.find(
        (application) =>
          String(application.id) === String(selectedId)
      ) || null
    );
  }, [applications, selectedId]);

  const stats = useMemo(() => {
    const total = applications.length;

    const submitted = applications.filter(
      (application) =>
        normalizeStatus(application.status) === "submitted"
    ).length;

    const interviews = applications.filter(
      (application) =>
        normalizeStatus(application.status) === "interview"
    ).length;

    const accepted = applications.filter(
      (application) =>
        normalizeStatus(application.status) === "accepted"
    ).length;

    const rejected = applications.filter(
      (application) =>
        normalizeStatus(application.status) === "rejected"
    ).length;

    return {
      total,
      submitted,
      interviews,
      accepted,
      rejected,
    };
  }, [applications]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 p-6 md:p-10">
        <div className="mx-auto max-w-7xl">
          <div className="animate-pulse space-y-6">
            <div className="h-10 w-72 rounded-xl bg-slate-200" />

            <div className="grid gap-4 md:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="h-28 rounded-2xl bg-white shadow-sm"
                />
              ))}
            </div>

            <div className="h-96 rounded-2xl bg-white shadow-sm" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8 lg:px-10">
        {/* HEADER */}
        <section className="mb-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-sm font-medium text-green-700">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                Suivi des candidatures
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
                Suivi
              </h1>

              <p className="mt-2 max-w-2xl text-slate-500">
                Suivez l'évolution de vos candidatures, de la
                préparation jusqu'à la réponse de l'entreprise.
              </p>
            </div>

            <div className="flex gap-3">
              <Link
                href="/applications"
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-green-300 hover:text-green-700"
              >
                Mes candidatures
              </Link>

              <Link
                href="/submissions"
                className="rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700"
              >
                Soumissions
              </Link>
            </div>
          </div>
        </section>

        {/* ERROR */}
        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <div className="font-semibold">
              Impossible de charger le suivi
            </div>

            <div className="mt-1">{error}</div>

            <button
              type="button"
              onClick={loadApplications}
              className="mt-3 rounded-lg bg-red-600 px-4 py-2 font-semibold text-white transition hover:bg-red-700"
            >
              Réessayer
            </button>
          </div>
        )}

        {/* STATS */}
        <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Total
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {stats.total}
            </p>
          </div>

          <div className="rounded-2xl border border-green-200 bg-green-50 p-5 shadow-sm">
            <p className="text-sm font-medium text-green-700">
              Soumises
            </p>

            <p className="mt-2 text-3xl font-bold text-green-700">
              {stats.submitted}
            </p>
          </div>

          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 shadow-sm">
            <p className="text-sm font-medium text-blue-700">
              Entretiens
            </p>

            <p className="mt-2 text-3xl font-bold text-blue-700">
              {stats.interviews}
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
            <p className="text-sm font-medium text-emerald-700">
              Acceptées
            </p>

            <p className="mt-2 text-3xl font-bold text-emerald-700">
              {stats.accepted}
            </p>
          </div>

          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 shadow-sm">
            <p className="text-sm font-medium text-red-700">
              Refusées
            </p>

            <p className="mt-2 text-3xl font-bold text-red-700">
              {stats.rejected}
            </p>
          </div>
        </section>

        {/* EMPTY */}
        {applications.length === 0 ? (
          <section className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50 text-2xl">
              📋
            </div>

            <h2 className="mt-5 text-xl font-bold text-slate-900">
              Aucune candidature
            </h2>

            <p className="mx-auto mt-2 max-w-md text-slate-500">
              Vos candidatures apparaîtront ici dès que vous
              commencerez à préparer ou envoyer des candidatures.
            </p>

            <Link
              href="/jobs"
              className="mt-6 inline-flex rounded-xl bg-green-600 px-5 py-3 font-semibold text-white transition hover:bg-green-700"
            >
              Voir les offres
            </Link>
          </section>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            {/* APPLICATIONS */}
            <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 p-5">
                <h2 className="text-lg font-bold text-slate-900">
                  Mes candidatures
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Sélectionnez une candidature pour voir son
                  évolution.
                </p>
              </div>

              <div className="divide-y divide-slate-100">
                {applications.map((application) => {
                  const job = application.job_id
                    ? jobs[String(application.job_id)]
                    : undefined;

                  const company = job?.company_id
                    ? companies[String(job.company_id)]
                    : undefined;

                  const isSelected =
                    String(selectedId) ===
                    String(application.id);

                  return (
                    <button
                      key={String(application.id)}
                      type="button"
                      onClick={() =>
                        setSelectedId(application.id)
                      }
                      className={`w-full p-5 text-left transition ${
                        isSelected
                          ? "bg-green-50"
                          : "hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <h3 className="truncate font-bold text-slate-900">
                            {job?.title ||
                              "Offre sans titre"}
                          </h3>

                          <p className="mt-1 text-sm text-slate-500">
                            {company?.name ||
                              "Entreprise non spécifiée"}
                          </p>

                          <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                            {job?.location && (
                              <span className="rounded-lg bg-slate-100 px-2 py-1">
                                📍 {job.location}
                              </span>
                            )}

                            {job?.domaine && (
                              <span className="rounded-lg bg-slate-100 px-2 py-1">
                                {job.domaine}
                              </span>
                            )}
                          </div>
                        </div>

                        <span
                          className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusStyle(
                            application.status
                          )}`}
                        >
                          {getStatusLabel(
                            application.status
                          )}
                        </span>
                      </div>

                      <p className="mt-4 text-xs text-slate-400">
                        Créée le{" "}
                        {formatDate(
                          application.created_at
                        )}
                      </p>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* DETAILS */}
            <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
              {!selectedApplication ? (
                <div className="flex min-h-[500px] items-center justify-center p-10 text-center">
                  <div>
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50 text-2xl">
                      👈
                    </div>

                    <h2 className="mt-5 text-xl font-bold text-slate-900">
                      Sélectionnez une candidature
                    </h2>

                    <p className="mt-2 max-w-sm text-sm text-slate-500">
                      Choisissez une candidature à gauche pour
                      afficher son parcours.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {(() => {
                    const job = selectedApplication.job_id
                      ? jobs[
                          String(
                            selectedApplication.job_id
                          )
                        ]
                      : undefined;

                    const company = job?.company_id
                      ? companies[
                          String(job.company_id)
                        ]
                      : undefined;

                    const currentIndex = getTimelineIndex(
                      selectedApplication.status
                    );

                    const normalizedStatus =
                      normalizeStatus(
                        selectedApplication.status
                      );

                    return (
                      <>
                        {/* DETAIL HEADER */}
                        <div className="border-b border-slate-100 p-6">
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <span className="text-xs font-semibold uppercase tracking-wider text-green-600">
                                Candidature
                              </span>

                              <h2 className="mt-1 text-2xl font-bold text-slate-900">
                                {job?.title ||
                                  "Offre sans titre"}
                              </h2>

                              <p className="mt-1 text-slate-500">
                                {company?.name ||
                                  "Entreprise non spécifiée"}
                              </p>
                            </div>

                            <span
                              className={`inline-flex w-fit rounded-full border px-3 py-1.5 text-sm font-semibold ${getStatusStyle(
                                selectedApplication.status
                              )}`}
                            >
                              {getStatusLabel(
                                selectedApplication.status
                              )}
                            </span>
                          </div>

                          <div className="mt-5 flex flex-wrap gap-2">
                            {job?.location && (
                              <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm text-slate-600">
                                📍 {job.location}
                              </span>
                            )}

                            {job?.domaine && (
                              <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm text-slate-600">
                                {job.domaine}
                              </span>
                            )}

                            {job?.contract_type && (
                              <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm text-slate-600">
                                {job.contract_type}
                              </span>
                            )}

                            {job?.remote && (
                              <span className="rounded-lg bg-green-50 px-3 py-1.5 text-sm font-medium text-green-700">
                                Télétravail
                              </span>
                            )}
                          </div>
                        </div>

                        {/* SPECIAL STATUS */}
                        {(normalizedStatus ===
                          "rejected" ||
                          normalizedStatus ===
                            "failed" ||
                          normalizedStatus ===
                            "manual_required") && (
                          <div className="mx-6 mt-6 rounded-2xl border p-4">
                            {normalizedStatus ===
                              "rejected" && (
                              <div className="text-red-700">
                                <p className="font-bold">
                                  Candidature refusée
                                </p>
                                <p className="mt-1 text-sm">
                                  Cette candidature n'est plus
                                  dans le processus actif.
                                </p>
                              </div>
                            )}

                            {normalizedStatus ===
                              "failed" && (
                              <div className="text-red-700">
                                <p className="font-bold">
                                  Échec de soumission
                                </p>
                                <p className="mt-1 text-sm">
                                  Une action est nécessaire pour
                                  poursuivre la candidature.
                                </p>
                              </div>
                            )}

                            {normalizedStatus ===
                              "manual_required" && (
                              <div className="text-orange-700">
                                <p className="font-bold">
                                  Action manuelle requise
                                </p>
                                <p className="mt-1 text-sm">
                                  Cette candidature nécessite une
                                  intervention manuelle.
                                </p>
                              </div>
                            )}
                          </div>
                        )}

                        {/* TIMELINE */}
                        <div className="p-6">
                          <h3 className="mb-6 text-lg font-bold text-slate-900">
                            Progression
                          </h3>

                          <div className="space-y-0">
                            {TIMELINE.map(
                              (step, index) => {
                                const completed =
                                  currentIndex >= index &&
                                  normalizedStatus !==
                                    "rejected";

                                const active =
                                  currentIndex === index;

                                return (
                                  <div
                                    key={step.key}
                                    className="relative flex gap-4"
                                  >
                                    {index <
                                      TIMELINE.length -
                                        1 && (
                                      <div
                                        className={`absolute left-[15px] top-8 h-[calc(100%-8px)] w-0.5 ${
                                          currentIndex >
                                          index
                                            ? "bg-green-500"
                                            : "bg-slate-200"
                                        }`}
                                      />
                                    )}

                                    <div
                                      className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold ${
                                        completed
                                          ? "border-green-600 bg-green-600 text-white"
                                          : "border-slate-200 bg-white text-slate-400"
                                      }`}
                                    >
                                      {completed
                                        ? "✓"
                                        : index + 1}
                                    </div>

                                    <div className="pb-8">
                                      <div
                                        className={`font-semibold ${
                                          active
                                            ? "text-green-700"
                                            : completed
                                            ? "text-slate-900"
                                            : "text-slate-400"
                                        }`}
                                      >
                                        {step.label}
                                      </div>

                                      <p className="mt-1 text-sm text-slate-500">
                                        {step.description}
                                      </p>

                                      {active && (
                                        <span className="mt-2 inline-flex rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
                                          Étape actuelle
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                );
                              }
                            )}
                          </div>
                        </div>

                        {/* DATES */}
                        <div className="grid gap-4 border-t border-slate-100 p-6 sm:grid-cols-2">
                          <div className="rounded-2xl bg-slate-50 p-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                              Création
                            </p>

                            <p className="mt-1 font-semibold text-slate-800">
                              {formatDateTime(
                                selectedApplication.created_at
                              )}
                            </p>
                          </div>

                          <div className="rounded-2xl bg-slate-50 p-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                              Soumission
                            </p>

                            <p className="mt-1 font-semibold text-slate-800">
                              {selectedApplication.applied_at
                                ? formatDateTime(
                                    selectedApplication.applied_at
                                  )
                                : "Pas encore soumise"}
                            </p>
                          </div>
                        </div>

                        {/* ACTIONS */}
                        <div className="flex flex-wrap gap-3 border-t border-slate-100 p-6">
                          {job?.url && (
                            <a
                              href={job.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-green-300 hover:text-green-700"
                            >
                              Voir l'offre
                            </a>
                          )}

                          <Link
                            href="/applications"
                            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-green-300 hover:text-green-700"
                          >
                            Candidature
                          </Link>

                          <Link
                            href="/submissions"
                            className="rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700"
                          >
                            Gérer la soumission
                          </Link>
                        </div>
                      </>
                    );
                  })()}
                </>
              )}
            </section>
          </div>
        )}
      </div>
    </main>
  );
}