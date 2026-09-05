"use client";

import { useCallback, useEffect, useState } from "react";
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
  domaine: string | null;
};

type Company = {
  id: string;
  name: string | null;
};

const STATUS_LABELS: Record<string, string> = {
  pending: "En attente",
  preparing: "Préparation",
  ready: "Prête à soumettre",
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

    case "accepted":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";

    case "interview":
      return "border-green-200 bg-green-50 text-green-700";

    case "failed":
    case "rejected":
      return "border-red-200 bg-red-50 text-red-700";

    case "manual_required":
      return "border-orange-200 bg-orange-50 text-orange-700";

    default:
      return "border-green-200 bg-green-50 text-green-700";
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

export default function SubmissionsPage() {
  const [items, setItems] = useState<Application[]>([]);
  const [jobs, setJobs] = useState<Record<string, Job>>({});
  const [companies, setCompanies] = useState<
    Record<string, Company>
  >({});

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] =
    useState<string | null>(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

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
        throw new Error("Profil introuvable.");
      }

      const {
        data,
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
          created_at
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

      const applications =
        (data || []) as Application[];

      setItems(applications);

      const jobIds = [
        ...new Set(
          applications
            .map((item) => item.job_id)
            .filter(Boolean) as string[]
        ),
      ];

      if (jobIds.length === 0) {
        setJobs({});
        setCompanies({});
        return;
      }

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
          domaine
        `)
        .in("id", jobIds);

      if (jobsError) {
        throw new Error(jobsError.message);
      }

      const jobMap: Record<string, Job> = {};

      (jobData || []).forEach((job) => {
        jobMap[job.id] = job as Job;
      });

      setJobs(jobMap);

      const companyIds = [
        ...new Set(
          (jobData || [])
            .map((job) => job.company_id)
            .filter(Boolean) as string[]
        ),
      ];

      if (companyIds.length === 0) {
        setCompanies({});
        return;
      }

      const {
        data: companyData,
        error: companiesError,
      } = await supabase
        .from("companies")
        .select("id, name")
        .in("id", companyIds);

      if (companiesError) {
        throw new Error(
          companiesError.message
        );
      }

      const companyMap: Record<string, Company> = {};

      (companyData || []).forEach((company) => {
        companyMap[company.id] =
          company as Company;
      });

      setCompanies(companyMap);
    } catch (err) {
      console.error(
        "ERREUR SOUMISSIONS:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Erreur récupération des candidatures."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  async function submitApplication(
    application: Application
  ) {
    try {
      setSubmitting(String(application.id));
      setError("");
      setMessage("");

      if (!application.job_id) {
        throw new Error(
          "Cette candidature n'est associée à aucune offre."
        );
      }

      if (
        !application.cv_url ||
        !application.cover_letter
      ) {
        throw new Error(
          "Le CV et la lettre de motivation doivent être prêts avant la soumission."
        );
      }

      const response = await fetch(
        "/api/applications/submit",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            application_id:
              application.id,
            profile_id:
              application.profile_id,
            job_id:
              application.job_id,
          }),
        }
      );

      const text = await response.text();

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

      setMessage(
        data?.message ||
          "La candidature a été envoyée au système de soumission."
      );

      await loadApplications();
    } catch (err) {
      console.error(
        "ERREUR SOUMISSION:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Erreur pendant la soumission."
      );
    } finally {
      setSubmitting(null);
    }
  }

  const readyCount = items.filter(
    (item) =>
      !!item.cv_url &&
      !!item.cover_letter
  ).length;

  const pendingCount = items.filter((item) =>
    [
      "pending",
      "preparing",
      "ready",
      "confirmed",
    ].includes(
      normalizeStatus(item.status)
    )
  ).length;

  return (
    <main className="min-h-screen bg-[#f7f7fb] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">

        {/* HEADER */}
        <header className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-bold text-green-700">
              <span>⚡</span>
              Automatisation
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Soumission des candidatures
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Vérifiez vos documents puis lancez
              la soumission automatisée de vos
              candidatures.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <MiniStat
              label="À traiter"
              value={pendingCount}
            />

            <MiniStat
              label="Prêtes"
              value={readyCount}
            />
          </div>
        </header>

        {/* SUCCESS */}
        {message && (
          <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-700">
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 font-bold">
                ✓
              </div>

              <div>
                <p className="font-bold">
                  Succès
                </p>

                <p className="mt-1">
                  {message}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ERROR */}
        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100 font-bold">
                !
              </div>

              <div>
                <p className="font-bold">
                  Une erreur est survenue
                </p>

                <p className="mt-1">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* LOADING */}
        {loading ? (
          <div className="space-y-5">
            {[1, 2].map((item) => (
              <div
                key={item}
                className="animate-pulse rounded-3xl border border-slate-200 bg-white p-7"
              >
                <div className="h-5 w-1/3 rounded bg-slate-100" />
                <div className="mt-3 h-4 w-1/5 rounded bg-slate-100" />
                <div className="mt-8 grid gap-4 md:grid-cols-2">
                  <div className="h-24 rounded-2xl bg-slate-100" />
                  <div className="h-24 rounded-2xl bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-5">
            {items.map((application) => {
              const job = application.job_id
                ? jobs[application.job_id]
                : undefined;

              const company = job?.company_id
                ? companies[job.company_id]
                : undefined;

              const status =
                normalizeStatus(
                  application.status
                );

              const alreadySubmitted = [
                "submitted",
                "applied",
                "interview",
                "accepted",
              ].includes(status);

              const failed =
                status === "failed";

              const manual =
                status ===
                "manual_required";

              const documentsReady =
                !!application.cv_url &&
                !!application.cover_letter;

              return (
                <article
                  key={String(application.id)}
                  className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
                >
                  {/* HEADER CARD */}
                  <div className="border-b border-slate-100 p-6">
                    <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                      <div className="flex min-w-0 gap-4">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-green-100 text-xl font-bold text-green-700">
                          {(job?.title || "C")
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div className="min-w-0">
                          <h2 className="text-lg font-bold text-slate-900">
                            {job?.title ||
                              "Poste non renseigné"}
                          </h2>

                          <p className="mt-1 text-sm font-medium text-slate-600">
                            {company?.name ||
                              "Entreprise non renseignée"}
                          </p>

                          <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
                            {job?.domaine && (
                              <span className="rounded-full bg-green-50 px-2.5 py-1 font-semibold text-green-700">
                                {job.domaine}
                              </span>
                            )}

                            {job?.location && (
                              <span>
                                📍 {job.location}
                              </span>
                            )}

                            {job?.contract_type && (
                              <span>
                                ·{" "}
                                {job.contract_type}
                              </span>
                            )}

                            {job?.remote && (
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
                  </div>

                  {/* BODY */}
                  <div className="p-6">

                    <div className="mb-5">
                      <h3 className="text-sm font-bold text-slate-900">
                        Préparation de la candidature
                      </h3>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        Vérifiez les documents
                        avant de lancer la
                        soumission.
                      </p>
                    </div>

                    {/* DOCUMENTS */}
                    <div className="grid gap-4 md:grid-cols-2">
                      <DocumentStatus
                        title="CV personnalisé"
                        description={
                          application.cv_url
                            ? "Votre CV personnalisé est prêt."
                            : "Le CV n'est pas encore disponible."
                        }
                        available={
                          !!application.cv_url
                        }
                        href={
                          application.cv_url ||
                          undefined
                        }
                      />

                      <DocumentStatus
                        title="Lettre de motivation"
                        description={
                          application.cover_letter
                            ? "Votre lettre est prête."
                            : "La lettre n'est pas encore disponible."
                        }
                        available={
                          !!application.cover_letter
                        }
                      />
                    </div>

                    {/* PROGRESS */}
                    <div className="mt-6 rounded-2xl bg-slate-50 p-5">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-slate-700">
                          État de préparation
                        </span>

                        <span
                          className={`text-xs font-bold ${
                            documentsReady
                              ? "text-emerald-600"
                              : "text-green-600"
                          }`}
                        >
                          {documentsReady
                            ? "100%"
                            : "À préparer"}
                        </span>
                      </div>

                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                        <div
                          className={`h-full rounded-full transition-all ${
                            documentsReady
                              ? "w-full bg-emerald-500"
                              : "w-1/3 bg-green-500"
                          }`}
                        />
                      </div>
                    </div>

                    {/* ACTIONS */}
                    <div className="mt-6 flex flex-wrap gap-3">
                      {job?.url && (
                        <a
                          href={job.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:border-green-300 hover:text-green-700"
                        >
                          Voir l'offre
                        </a>
                      )}

                      {!alreadySubmitted &&
                        !failed &&
                        !manual &&
                        documentsReady && (
                          <button
                            type="button"
                            disabled={
                              submitting !== null
                            }
                            onClick={() =>
                              submitApplication(
                                application
                              )
                            }
                            className="rounded-xl bg-green-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {submitting ===
                            String(
                              application.id
                            )
                              ? "Soumission..."
                              : "⚡ Soumettre la candidature"}
                          </button>
                        )}

                      {!documentsReady &&
                        !alreadySubmitted && (
                          <a
                            href="/resume"
                            className="rounded-xl bg-green-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-green-700"
                          >
                            Préparer les documents
                          </a>
                        )}

                      {alreadySubmitted && (
                        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-bold text-emerald-700">
                          ✓ Candidature soumise
                        </div>
                      )}

                      {manual && (
                        <div className="rounded-xl border border-orange-200 bg-orange-50 px-4 py-2.5 text-sm font-bold text-orange-700">
                          ⚠ Action manuelle requise
                        </div>
                      )}

                      {failed && (
                        <button
                          type="button"
                          onClick={() =>
                            submitApplication(
                              application
                            )
                          }
                          disabled={
                            submitting !== null
                          }
                          className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50"
                        >
                          Réessayer
                        </button>
                      )}
                    </div>

                    {/* FOOTER */}
                    <div className="mt-5 flex flex-wrap justify-between gap-2 border-t border-slate-100 pt-4 text-xs text-slate-400">
                      <span>
                        Créée le{" "}
                        {formatDate(
                          application.created_at
                        )}
                      </span>

                      <span>
                        Référence :{" "}
                        {String(
                          application.id
                        ).slice(0, 8)}
                        ...
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

function MiniStat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-5 py-3 shadow-sm">
      <p className="text-xs font-medium text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-xl font-bold text-slate-900">
        {value}
      </p>
    </div>
  );
}

function DocumentStatus({
  title,
  description,
  available,
  href,
}: {
  title: string;
  description: string;
  available: boolean;
  href?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-start gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold ${
            available
              ? "bg-emerald-50 text-emerald-600"
              : "bg-amber-50 text-amber-600"
          }`}
        >
          {available ? "✓" : "○"}
        </div>

        <div className="min-w-0">
          <h4 className="text-sm font-bold text-slate-900">
            {title}
          </h4>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            {description}
          </p>

          {available && href && (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block text-xs font-bold text-green-600 hover:underline"
            >
              Ouvrir le document →
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-16 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50 text-3xl text-green-600">
        ⚡
      </div>

      <h2 className="mt-5 text-lg font-bold text-slate-900">
        Aucune candidature à soumettre
      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        Lorsque vous préparerez une candidature,
        elle apparaîtra automatiquement ici.
      </p>

      <a
        href="/matches"
        className="mt-6 inline-flex rounded-xl bg-green-600 px-5 py-3 text-sm font-bold text-white hover:bg-green-700"
      >
        Voir mes correspondances
      </a>
    </div>
  );
}