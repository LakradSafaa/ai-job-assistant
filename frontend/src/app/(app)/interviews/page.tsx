"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

type Interview = {
  id: string | number;
  profile_id?: string;
  application_id?: string;
  job_id?: string;
  title?: string;
  company?: string;
  position?: string;
  date?: string;
  interview_date?: string;
  time?: string;
  interview_time?: string;
  status?: string;
  type?: string;
  meeting_url?: string;
  notes?: string;
  created_at?: string;
};

export default function InterviewsPage() {
  const [items, setItems] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    loadInterviews();
  }, []);

  async function loadInterviews() {
    try {
      setLoading(true);
      setError("");

      const profileId =
        localStorage.getItem("profile_id");

      if (!profileId) {
        throw new Error("Profil introuvable.");
      }

      const { data, error } = await supabase
        .from("interviews")
        .select("*")
        .eq("profile_id", profileId)
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        throw new Error(error.message);
      }

      setItems((data || []) as Interview[]);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible de rÃ©cupÃ©rer les entretiens."
      );
    } finally {
      setLoading(false);
    }
  }

  function getDate(item: Interview) {
    return (
      item.interview_date ||
      item.date ||
      "Date non dÃ©finie"
    );
  }

  function getTime(item: Interview) {
    return (
      item.interview_time ||
      item.time ||
      "Heure non dÃ©finie"
    );
  }

  function getTitle(item: Interview) {
    return (
      item.position ||
      item.title ||
      "Entretien"
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-6xl">

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Mes entretiens
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Retrouvez ici vos entretiens programmÃ©s et leur statut.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-xl bg-white p-12 text-center text-gray-500">
            Chargement des entretiens...
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
            <div className="text-4xl">ðŸ“…</div>

            <h2 className="mt-4 text-lg font-semibold text-gray-800">
              Aucun entretien
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Aucun entretien programmÃ© pour le moment.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">

            {items.map((item) => (
              <div
                key={String(item.id)}
                className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">

                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {getTitle(item)}
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                      {item.company ||
                        "Entreprise non renseignÃ©e"}
                    </p>
                  </div>

                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    {item.status || "ProgrammÃ©"}
                  </span>
                </div>

                <div className="mt-5 space-y-3 text-sm text-gray-600">

                  <div>
                    ðŸ“…{" "}
                    <strong>
                      {getDate(item)}
                    </strong>
                  </div>

                  <div>
                    ðŸ•{" "}
                    <strong>
                      {getTime(item)}
                    </strong>
                  </div>

                  {item.type && (
                    <div>
                      ðŸŽ¯ Type : {item.type}
                    </div>
                  )}

                  {item.notes && (
                    <div className="rounded-lg bg-gray-50 p-3">
                      <strong>Notes :</strong>
                      <p className="mt-1">
                        {item.notes}
                      </p>
                    </div>
                  )}
                </div>

                {item.meeting_url && (
                  <a
                    href={item.meeting_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 inline-block rounded-lg bg-[#005c45] px-4 py-2 text-sm font-medium text-white hover:bg-[#004735]"
                  >
                    Rejoindre l'entretien
                  </a>
                )}
              </div>
            ))}

          </div>
        )}
      </div>
    </div>
  );
}
