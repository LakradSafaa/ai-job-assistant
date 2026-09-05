"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
  updated_at: string | null;
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

type EnrichedApplication = Application & {
  job?: Job;
  company?: Company;
};

const STATUS_LABELS: Record<string, string> = {
  pending: "En attente",
  preparing: "Préparation",
  ready: "Prête",
  confirmed: "Confirmée",
  submitted: "Soumise",
  applied: "Soumise",
  interview: "Entretien",
  accepted: "Acceptée",
  rejected: "Refusée",
  manual_required: "Action requise",
  failed: "Échec",
};

function normalizeStatus(status?: string | null) {
  return String(status || "pending")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "_");
}

function getStatusLabel(status?: string | null) {
  return (
    STATUS_LABELS[normalizeStatus(status)] ||
    "En attente"
  );
}

function getStatusStyle(status?: string | null) {
  switch (normalizeStatus(status)) {
    case "submitted":
    case "applied":
      return "border-blue-200 bg-blue-50 text-blue-700";

    case "interview":
      return "border-green-200 bg-green-50 text-green-700";

    case "accepted":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";

    case "rejected":
    case "failed":
      return "border-red-200 bg-red-50 text-red-700";

    case "manual_required":
      return "border-orange-200 bg-orange-50 text-orange-700";

    case "ready":
    case "confirmed":
      return "border-green-200 bg-green-50 text-green-700";

    case "preparing":
      return "border-green-200 bg-green-50 text-green-700";

    default:
      return "border-amber-200 bg-amber-50 text-amber-700";
  }
}

function formatDate(date?: string | null) {
  if (!date) return "—";

  const value = new Date(date);

  if (Number.isNaN(value.getTime())) {
    return "—";
  }

  return value.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function getJobTitle(application: EnrichedApplication) {
  return application.job?.title || "Poste non renseigné";
}

function getCompanyName(application: EnrichedApplication) {
  return (
    application.company?.name ||
    "Entreprise non renseignée"
  );
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<
    EnrichedApplication[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("Toutes");

  const loadApplications = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw new Error(userError.message);
      }

      const profileId =
        user?.id ||
        localStorage.getItem("profile_id");

      if (!profileId) {
        setApplications([]);
        return;
      }

      // =====================================================
      // APPLICATIONS
      // =====================================================

      const {
        data: applicationData,
        error: applicationsError,
      } = await supabase
        .from("applications")
        .select(`
          id,
          profile_id,
          job_id,
          status,
          cv_url,
          cover_letter,
          applied_at,
          created_at,
          updated_at
        `)
        .eq("profile_id", profileId)
        .order("created_at", {
          ascending: false,
        });

      if (applicationsError) {
        throw new Error(
          applicationsError.message
        );
      }

      const apps =
        (applicationData || []) as Application[];

      if (apps.length === 0) {
        setApplications([]);
        return;
      }

      // =====================================================
      // JOBS
      // =====================================================

      const jobIds = [
        ...new Set(
          apps
            .map((item) => item.job_id)
            .filter(Boolean) as string[]
        ),
      ];

      let jobs: Job[] = [];

      if (jobIds.length > 0) {
        const {
          data: jobData,
          error: jobsError,
        } = await supabase
          .from("jobs")
          .select(`
            id,
            title,
            company_id,
            location,
            contract_type,
            remote,
            url,
            source,
            domaine
          `)
          .in("id", jobIds);

        if (jobsError) {
          console.warn(
            "Erreur récupération jobs:",
            jobsError.message
          );
        } else {
          jobs = (jobData || []) as Job[];
        }
      }

      // =====================================================
      // COMPANIES
      // =====================================================

      const companyIds = [
        ...new Set(
          jobs
            .map((job) => job.company_id)
            .filter(Boolean) as string[]
        ),
      ];

      let companies: Company[] = [];

      if (companyIds.length > 0) {
        const {
          data: companyData,
          error: companiesError,
        } = await supabase
          .from("companies")
          .select("id, name")
          .in("id", companyIds);

        if (companiesError) {
          console.warn(
            "Erreur récupération entreprises:",
            companiesError.message
          );
        } else {
          companies =
            (companyData || []) as Company[];
        }
      }

      // =====================================================
      // MAPS
      // =====================================================

      const jobMap = new Map(
        jobs.map((job) => [job.id, job])
      );

      const companyMap = new Map(
        companies.map((company) => [
          company.id,
          company,
        ])
      );

      // =====================================================
      // ENRICHISSEMENT
      // =====================================================

      const enriched = apps.map((application) => {
        const job = application.job_id
          ? jobMap.get(application.job_id)
          : undefined;

        const company = job?.company_id
          ? companyMap.get(job.company_id)
          : undefined;

        return {
          ...application,
          job,
          company,
        };
      });

      setApplications(enriched);
    } catch (err) {
      console.error(
        "ERREUR CHARGEMENT CANDIDATURES:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Impossible de charger les candidatures."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  const filteredApplications = useMemo(() => {
    if (filter === "Toutes") {
      return applications;
    }

    return applications.filter(
      (application) =>
        getStatusLabel(application.status) ===
        filter
    );
  }, [applications, filter]);

  const total = applications.length;

  const pending = applications.filter((application) =>
    [
      "pending",
      "preparing",
      "ready",
      "confirmed",
    ].includes(
      normalizeStatus(application.status)
    )
  ).length;

  const interviews = applications.filter(
    (application) =>
      normalizeStatus(application.status) ===
      "interview"
  ).length;

  const accepted = applications.filter(
    (application) =>
      normalizeStatus(application.status) ===
      "accepted"
  ).length;

  return (
    <main className="min-h-screen bg-[#f7f7fb] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}
        <header className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-bold text-green-700">
              <span>✦</span>
              Gestion des candidatures
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Mes candidatures
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Retrouvez toutes vos candidatures,
              vos documents et leur état
              d'avancement.
            </p>
          </div>

          <button
            type="button"
            onClick={loadApplications}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span>↻</span>
            {loading
              ? "Actualisation..."
              : "Actualiser"}
          </button>
        </header>

        {/* STATS */}
        <div className="mb-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total"
            value={total}
            icon="▣"
            description="Toutes les candidatures"
          />

          <StatCard
            label="En cours"
            value={pending}
            icon="◷"
            description="Candidatures actives"
          />

          <StatCard
            label="Entretiens"
            value={interviews}
            icon="◎"
            description="Entretiens obtenus"
          />

          <StatCard
            label="Acceptées"
            value={accepted}
            icon="✓"
            description="Opportunités acceptées"
          />
        </div>

        {/* MAIN */}
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

          {/* TOOLBAR */}
          <div className="flex flex-col gap-4 border-b border-slate-100 p-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Toutes mes candidatures
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {filteredApplications.length} candidature
                {filteredApplications.length > 1
                  ? "s"
                  : ""}{" "}
                affichée
                {filteredApplications.length > 1
                  ? "s"
                  : ""}
              </p>
            </div>

            <select
              value={filter}
              onChange={(event) =>
                setFilter(event.target.value)
              }
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 outline-none transition focus:border-green-400 focus:ring-4 focus:ring-green-100"
            >
              <option value="Toutes">Toutes</option>
              <option value="En attente">
                En attente
              </option>
              <option value="Préparation">
                Préparation
              </option>
              <option value="Prête">Prêtes</option>
              <option value="Confirmée">
                Confirmées
              </option>
              <option value="Soumise">
                Soumises
              </option>
              <option value="Entretien">
                Entretiens
              </option>
              <option value="Acceptée">
                Acceptées
              </option>
              <option value="Refusée">
                Refusées
              </option>
              <option value="Action requise">
                Action requise
              </option>
              <option value="Échec">
                Échecs
              </option>
            </select>
          </div>

          {/* LOADING */}
          {loading && (
            <div className="space-y-4 p-6">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="animate-pulse rounded-2xl border border-slate-100 p-5"
                >
                  <div className="h-5 w-2/5 rounded bg-slate-100" />
                  <div className="mt-3 h-4 w-1/4 rounded bg-slate-100" />
                  <div className="mt-6 h-20 rounded bg-slate-100" />
                </div>
              ))}
            </div>
          )}

          {/* ERROR */}
          {!loading && error && (
            <div className="m-6 rounded-2xl border border-red-200 bg-red-50 p-6">
              <div className="flex gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-100 font-bold text-red-600">
                  !
                </div>

                <div>
                  <h3 className="font-bold text-red-900">
                    Impossible de charger vos candidatures
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-red-700">
                    {error}
                  </p>

                  <button
                    type="button"
                    onClick={loadApplications}
                    className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700"
                  >
                    Réessayer
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* EMPTY */}
          {!loading &&
            !error &&
            filteredApplications.length === 0 && (
              <div className="p-16 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50 text-3xl text-green-600">
                  ◫
                </div>

                <h3 className="mt-5 text-lg font-bold text-slate-900">
                  {applications.length === 0
                    ? "Aucune candidature"
                    : "Aucun résultat"}
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                  {applications.length === 0
                    ? "Vos candidatures apparaîtront ici lorsque vous postulerez à une offre."
                    : "Aucune candidature ne correspond au filtre sélectionné."}
                </p>

                {applications.length === 0 && (
                  <a
                    href="/jobs"
                    className="mt-6 inline-flex rounded-xl bg-green-600 px-5 py-3 text-sm font-bold text-white hover:bg-green-700"
                  >
                    Découvrir les offres
                  </a>
                )}
              </div>
            )}

          {/* LIST */}
          {!loading &&
            !error &&
            filteredApplications.length > 0 && (
              <div className="divide-y divide-slate-100">
                {filteredApplications.map(
                  (application) => {
                    const status =
                      normalizeStatus(
                        application.status
                      );

                    return (
                      <article
                        key={String(application.id)}
                        className="p-6 transition hover:bg-slate-50/70"
                      >
                        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                          <div className="flex min-w-0 gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-green-100 text-lg font-bold text-green-700">
                              {getJobTitle(
                                application
                              )
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <div className="min-w-0">
                              <h3 className="truncate text-base font-bold text-slate-900">
                                {getJobTitle(
                                  application
                                )}
                              </h3>

                              <p className="mt-1 text-sm font-medium text-slate-600">
                                {getCompanyName(
                                  application
                                )}
                              </p>

                              <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
                                {application.job
                                  ?.domaine && (
                                  <span className="rounded-full bg-green-50 px-2.5 py-1 text-green-700">
                                    {
                                      application.job
                                        .domaine
                                    }
                                  </span>
                                )}

                                {application.job
                                  ?.location && (
                                  <span>
                                    📍{" "}
                                    {
                                      application
                                        .job
                                        .location
                                    }
                                  </span>
                                )}

                                {application.job
                                  ?.contract_type && (
                                  <span>
                                    ·{" "}
                                    {
                                      application
                                        .job
                                        .contract_type
                                    }
                                  </span>
                                )}

                                {application.job
                                  ?.remote && (
                                  <span className="rounded-full bg-emerald-50 px-2 py-1 font-semibold text-emerald-700">
                                    Télétravail
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <span
                            className={`w-fit rounded-full border px-3 py-1.5 text-xs font-bold ${getStatusStyle(
                              application.status
                            )}`}
                          >
                            {getStatusLabel(
                              application.status
                            )}
                          </span>
                        </div>

                        {/* DOCUMENTS */}
                        <div className="mt-5 grid gap-3 md:grid-cols-3">
                          <DocumentCard
                            title="CV personnalisé"
                            available={
                              !!application.cv_url
                            }
                            href={
                              application.cv_url ||
                              undefined
                            }
                            availableText="CV disponible"
                            unavailableText="À préparer"
                          />

                          <DocumentCard
                            title="Lettre de motivation"
                            available={
                              !!application.cover_letter
                            }
                            availableText="Lettre disponible"
                            unavailableText="À préparer"
                          />

                          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                              Candidature
                            </p>

                            <p className="mt-2 text-sm font-bold text-slate-700">
                              {formatDate(
                                application.applied_at ||
                                  application.created_at
                              )}
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              Référence :{" "}
                              {String(
                                application.id
                              ).slice(0, 8)}
                              ...
                            </p>
                          </div>
                        </div>

                        {/* ACTIONS */}
                        <div className="mt-5 flex flex-wrap gap-3">
                          {application.job?.url && (
                            <a
                              href={
                                application.job.url
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:border-green-300 hover:text-green-700"
                            >
                              Voir l'offre
                            </a>
                          )}

                          <a
                            href="/tracking"
                            className="rounded-xl bg-green-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-green-700"
                          >
                            Voir le suivi
                          </a>

                          {![
                            "submitted",
                            "applied",
                            "interview",
                            "accepted",
                          ].includes(status) && (
                            <a
                              href="/submissions"
                              className="rounded-xl border border-green-200 bg-green-50 px-4 py-2.5 text-sm font-bold text-green-700 hover:bg-green-100"
                            >
                              Préparer
                            </a>
                          )}
                        </div>
                      </article>
                    );
                  }
                )}
              </div>
            )}
        </section>
      </div>
    </main>
  );
}

function StatCard({
  label,
  value,
  icon,
  description,
}: {
  label: string;
  value: number;
  icon: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {label}
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {value}
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 font-bold text-green-600">
          {icon}
        </div>
      </div>

      <p className="mt-3 text-xs text-slate-400">
        {description}
      </p>
    </div>
  );
}

function DocumentCard({
  title,
  available,
  href,
  availableText,
  unavailableText,
}: {
  title: string;
  available: boolean;
  href?: string;
  availableText: string;
  unavailableText: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
        {title}
      </p>

      <div className="mt-2 flex items-center justify-between gap-3">
        <span
          className={`text-sm font-bold ${
            available
              ? "text-emerald-700"
              : "text-slate-500"
          }`}
        >
          {available ? "✓" : "○"}{" "}
          {available
            ? availableText
            : unavailableText}
        </span>

        {available && href && (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold text-green-600 hover:underline"
          >
            Ouvrir →
          </a>
        )}
      </div>
    </div>
  );
}