"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase/client";

type Application = {
  id: string;
  status: string | null;
  cv_url: string | null;
  cover_letter: string | null;
  applied_at: string | null;
  created_at: string | null;
  job_id: string | null;
};

const statusLabels: Record<string, string> = {
  pending: "En attente",
  applied: "En attente",
  interview: "Entretien",
  accepted: "Acceptée",
  rejected: "Refusée",
};

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("Toutes");

  useEffect(() => {
    loadApplications();
  }, []);

  async function loadApplications() {
    try {
      setLoading(true);
      setError(null);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error("AUTH ERROR", {
          message: userError.message,
          details: userError,
          code: userError.status,
        });

        throw new Error(userError.message);
      }

      if (!user) {
        setApplications([]);
        return;
      }

      /*
       * On récupère d'abord les candidatures.
       * On ne fait PAS encore de jointure avec jobs.
       * Cela permet d'éviter une erreur si la relation SQL
       * entre applications et jobs n'est pas encore définie.
       */
      const { data, error: applicationsError } = await supabase
        .from("applications")
        .select(
          `
            id,
            status,
            cv_url,
            cover_letter,
            applied_at,
            created_at,
            job_id
          `
        )
        .eq("profile_id", user.id)
        .order("created_at", { ascending: false });

      if (applicationsError) {
        console.error("SUPABASE APPLICATIONS ERROR", {
          message: applicationsError.message,
          details: applicationsError.details,
          hint: applicationsError.hint,
          code: applicationsError.code,
        });

        throw new Error(
          [
            applicationsError.message,
            applicationsError.details,
            applicationsError.hint,
            applicationsError.code
              ? `Code: ${applicationsError.code}`
              : null,
          ]
            .filter(Boolean)
            .join(" | ")
        );
      }

      setApplications((data ?? []) as Application[]);
    } catch (err) {
      console.error("ERREUR CHARGEMENT CANDIDATURES:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Une erreur inconnue est survenue."
      );
    } finally {
      setLoading(false);
    }
  }

  const filteredApplications = useMemo(() => {
    if (filter === "Toutes") {
      return applications;
    }

    return applications.filter((application) => {
      const status =
        statusLabels[application.status ?? ""] ??
        application.status ??
        "En attente";

      return status === filter;
    });
  }, [applications, filter]);

  const total = applications.length;

  const pending = applications.filter((application) =>
    ["pending", "applied"].includes(application.status ?? "")
  ).length;

  const interviews = applications.filter(
    (application) => application.status === "interview"
  ).length;

  const accepted = applications.filter(
    (application) => application.status === "accepted"
  ).length;

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl">
        {/* HEADER */}
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Mes candidatures
            </h1>

            <p className="mt-2 text-slate-500">
              Suivez toutes vos candidatures depuis un seul espace.
            </p>
          </div>

          <button
            onClick={loadApplications}
            disabled={loading}
            className="rounded-xl bg-slate-900 px-5 py-3 font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Actualisation..." : "Actualiser"}
          </button>
        </div>

        {/* STATISTIQUES */}
        <div className="mb-6 grid gap-4 md:grid-cols-4">
          <StatCard label="Total" value={total} />

          <StatCard label="En attente" value={pending} />

          <StatCard label="Entretiens" value={interviews} />

          <StatCard label="Acceptées" value={accepted} />
        </div>

        {/* TABLEAU */}
        <section className="overflow-hidden rounded-2xl border bg-white shadow-sm">
          {/* TOOLBAR */}
          <div className="flex flex-col justify-between gap-4 border-b p-6 md:flex-row md:items-center">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                Suivi des candidatures
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Vos candidatures enregistrées dans Supabase.
              </p>
            </div>

            <select
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 outline-none focus:border-slate-900"
            >
              <option value="Toutes">Toutes</option>
              <option value="En attente">En attente</option>
              <option value="Entretien">Entretien</option>
              <option value="Acceptée">Acceptées</option>
              <option value="Refusée">Refusées</option>
            </select>
          </div>

          {/* LOADING */}
          {loading && (
            <div className="p-12 text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />

              <p className="mt-4 text-sm text-slate-500">
                Chargement de vos candidatures...
              </p>
            </div>
          )}

          {/* ERROR */}
          {!loading && error && (
            <div className="m-6 rounded-2xl border border-red-200 bg-red-50 p-6">
              <h3 className="font-semibold text-red-800">
                Impossible de charger les candidatures
              </h3>

              <p className="mt-3 break-words text-sm leading-6 text-red-700">
                {error}
              </p>

              <button
                onClick={loadApplications}
                className="mt-5 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-700"
              >
                Réessayer
              </button>
            </div>
          )}

          {/* DATA */}
          {!loading && !error && (
            <>
              {filteredApplications.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[850px] text-left">
                    <thead className="bg-slate-50 text-sm text-slate-500">
                      <tr>
                        <th className="px-6 py-4">Candidature</th>

                        <th className="px-6 py-4">Job ID</th>

                        <th className="px-6 py-4">Statut</th>

                        <th className="px-6 py-4">Date</th>

                        <th className="px-6 py-4">CV</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y">
                      {filteredApplications.map((application) => {
                        const status =
                          statusLabels[application.status ?? ""] ??
                          application.status ??
                          "En attente";

                        const date = application.applied_at
                          ? new Date(
                              application.applied_at
                            ).toLocaleDateString("fr-FR")
                          : application.created_at
                            ? new Date(
                                application.created_at
                              ).toLocaleDateString("fr-FR")
                            : "-";

                        return (
                          <tr
                            key={application.id}
                            className="transition hover:bg-slate-50"
                          >
                            <td className="px-6 py-5">
                              <p className="font-semibold text-slate-900">
                                Candidature
                              </p>

                              <p className="mt-1 text-xs text-slate-400">
                                ID : {application.id}
                              </p>
                            </td>

                            <td className="px-6 py-5">
                              <span className="rounded-lg bg-slate-100 px-3 py-1 font-mono text-xs text-slate-600">
                                {application.job_id ?? "-"}
                              </span>
                            </td>

                            <td className="px-6 py-5">
                              <StatusBadge status={status} />
                            </td>

                            <td className="px-6 py-5 text-sm text-slate-500">
                              {date}
                            </td>

                            <td className="px-6 py-5">
                              {application.cv_url ? (
                                <a
                                  href={application.cv_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm font-medium text-slate-900 hover:underline"
                                >
                                  Voir le CV
                                </a>
                              ) : (
                                <span className="text-sm text-slate-400">
                                  Aucun CV
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-14 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                    <span className="text-2xl">📄</span>
                  </div>

                  <h3 className="mt-5 font-semibold text-slate-900">
                    Aucune candidature trouvée
                  </h3>

                  <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                    Vos candidatures apparaîtront ici après votre première
                    candidature.
                  </p>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  );
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>

      <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    "En attente": "bg-amber-100 text-amber-700",
    Entretien: "bg-blue-100 text-blue-700",
    Acceptée: "bg-green-100 text-green-700",
    Refusée: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-medium ${
        styles[status] ?? "bg-slate-100 text-slate-700"
      }`}
    >
      {status}
    </span>
  );
}