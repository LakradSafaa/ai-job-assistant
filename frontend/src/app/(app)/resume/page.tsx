"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY sont obligatoires."
  );
}

const supabase = createBrowserClient(
  supabaseUrl,
  supabaseAnonKey
);

/* ============================================================
   TYPES
============================================================ */

type Job = {
  id: string;
  title: string | null;
  company: string | null;
  domaine: string | null;
  location: string | null;
  source: string | null;
  url: string | null;
  link: string | null;
  apply_url: string | null;
  created_at: string | null;
};

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

type ResumeDocument = {
  application: Application;
  job: Job | null;
};

type GenerationAction = "cv" | "letter" | "both";

type GenerationState = {
  jobId: string;
  action: GenerationAction;
} | null;

/* ============================================================
   HELPERS
============================================================ */

function normalizeText(value: unknown): string {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function formatDate(value: string | null): string {
  if (!value) {
    return "Date inconnue";
  }

  try {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function getStatusLabel(status: string | null) {
  const normalized = normalizeText(status);

  if (
    normalized.includes("submitted") ||
    normalized.includes("accepted")
  ) {
    return {
      label: status || "Envoyée",
      className:
        "bg-emerald-100 text-emerald-700 border-emerald-200",
    };
  }

  if (
    normalized.includes("failed") ||
    normalized.includes("rejected")
  ) {
    return {
      label: status || "Échec",
      className:
        "bg-red-100 text-red-700 border-red-200",
    };
  }

  if (
    normalized.includes("ready") ||
    normalized.includes("preparing")
  ) {
    return {
      label: status || "Préparation",
      className:
        "bg-blue-100 text-blue-700 border-blue-200",
    };
  }

  return {
    label: status || "Préparée",
    className:
      "bg-gray-100 text-gray-700 border-gray-200",
  };
}

function downloadTextFile(
  content: string,
  filename: string
) {
  const blob = new Blob([content], {
    type: "text/plain;charset=utf-8",
  });

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");

  link.href = url;
  link.download = filename;

  document.body.appendChild(link);

  link.click();

  link.remove();

  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 5000);
}

function openBase64Pdf(
  base64: string,
  filename: string
) {
  if (!base64) {
    throw new Error("Document PDF vide.");
  }

  const cleanBase64 = base64.includes(",")
    ? base64.split(",")[1]
    : base64;

  const byteCharacters = window.atob(
    cleanBase64
  );

  const byteNumbers = new Array(
    byteCharacters.length
  );

  for (
    let i = 0;
    i < byteCharacters.length;
    i++
  ) {
    byteNumbers[i] =
      byteCharacters.charCodeAt(i);
  }

  const byteArray = new Uint8Array(
    byteNumbers
  );

  const blob = new Blob([byteArray], {
    type: "application/pdf",
  });

  const objectUrl =
    window.URL.createObjectURL(blob);

  const link =
    document.createElement("a");

  link.href = objectUrl;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.download = filename;

  document.body.appendChild(link);

  link.click();

  link.remove();

  setTimeout(() => {
    window.URL.revokeObjectURL(objectUrl);
  }, 10000);
}

/* ============================================================
   PAGE
============================================================ */

export default function ResumePage() {
  const [documents, setDocuments] = useState<
    ResumeDocument[]
  >([]);

  const [jobs, setJobs] = useState<Job[]>([]);

  const [profileId, setProfileId] =
    useState<string | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [isGenerating, setIsGenerating] =
    useState<GenerationState>(null);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const [successMessage, setSuccessMessage] =
    useState<string | null>(null);

  const [searchTerm, setSearchTerm] =
    useState("");

  const [activeLetter, setActiveLetter] =
    useState<ResumeDocument | null>(null);

  /* ============================================================
     GET PROFILE ID
  ============================================================ */

  const getProfileId =
    useCallback(async (): Promise<string> => {
      const localProfileId =
        typeof window !== "undefined"
          ? window.localStorage.getItem(
              "profile_id"
            )
          : null;

      if (localProfileId?.trim()) {
        return localProfileId.trim();
      }

      const {
        data: authData,
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) {
        console.warn(
          "AUTH USER ERROR:",
          authError.message
        );
      }

      const userId =
        authData?.user?.id;

      if (userId) {
        const {
          data: profile,
          error: profileError,
        } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", userId)
          .maybeSingle();

        if (profileError) {
          throw new Error(
            profileError.message ||
              "Impossible de récupérer ton profil."
          );
        }

        if (profile?.id) {
          const id = String(profile.id);

          if (
            typeof window !== "undefined"
          ) {
            window.localStorage.setItem(
              "profile_id",
              id
            );
          }

          return id;
        }
      }

      /*
       * Fallback développement.
       */
      const {
        data,
        error,
      } = await supabase
        .from("profiles")
        .select("id")
        .limit(1)
        .maybeSingle();

      if (error) {
        throw new Error(
          error.message ||
            "Impossible de récupérer le profil."
        );
      }

      if (!data?.id) {
        throw new Error(
          "Aucun profil trouvé. Crée d'abord ton profil."
        );
      }

      const id = String(data.id);

      if (
        typeof window !== "undefined"
      ) {
        window.localStorage.setItem(
          "profile_id",
          id
        );
      }

      return id;
    }, []);

  /* ============================================================
     LOAD GENERATED DOCUMENTS
     
     IMPORTANT:
     Cette page ne consulte PAS job_matches.
  ============================================================ */

  const loadDocuments =
    useCallback(async () => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const currentProfileId =
          await getProfileId();

        setProfileId(
          currentProfileId
        );

        /* ======================================================
           1. APPLICATIONS
        ====================================================== */

        const {
          data: applicationsData,
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
          .eq(
            "profile_id",
            currentProfileId
          )
          .order("created_at", {
            ascending: false,
          });

        if (applicationsError) {
          console.error(
            "APPLICATIONS ERROR:",
            applicationsError
          );

          throw new Error(
            applicationsError.message ||
              "Impossible de récupérer les documents générés."
          );
        }

        const applications =
          (applicationsData ??
            []) as Application[];

        /* ======================================================
           2. JOB IDS
        ====================================================== */

        const jobIds = [
          ...new Set(
            applications
              .map((application) =>
                application.job_id
                  ? String(
                      application.job_id
                    )
                  : ""
              )
              .filter(Boolean)
          ),
        ];

        let jobsList: Job[] = [];

        if (jobIds.length > 0) {
          const {
            data: jobsData,
            error: jobsError,
          } = await supabase
            .from("jobs")
            .select(`
              id,
              title,
              company,
              domaine,
              location,
              source,
              url,
              link,
              apply_url,
              created_at
            `)
            .in("id", jobIds);

          if (jobsError) {
            console.error(
              "JOBS ERROR:",
              jobsError
            );

            throw new Error(
              jobsError.message ||
                "Impossible de récupérer les offres."
            );
          }

          jobsList =
            (jobsData ?? []) as Job[];
        }

        setJobs(jobsList);

        /* ======================================================
           3. MAP JOBS
        ====================================================== */

        const jobsById =
          new Map<string, Job>();

        for (const job of jobsList) {
          jobsById.set(
            String(job.id),
            {
              ...job,
              id: String(job.id),
            }
          );
        }

        /* ======================================================
           4. ONLY APPLICATIONS WITH DOCUMENTS
        ====================================================== */

        const generatedDocuments =
          applications
            .filter(
              (application) =>
                Boolean(
                  application.cv_url ||
                    application.cover_letter
                )
            )
            .map((application) => ({
              application,
              job:
                application.job_id
                  ? jobsById.get(
                      String(
                        application.job_id
                      )
                    ) ?? null
                  : null,
            }));

        setDocuments(
          generatedDocuments
        );

        console.log(
          "DOCUMENTS GÉNÉRÉS:",
          generatedDocuments.length
        );

        if (
          generatedDocuments.length === 0
        ) {
          setSuccessMessage(
            "Aucun CV ou lettre de motivation généré pour le moment."
          );
        } else {
          setSuccessMessage(
            `${generatedDocuments.length} document${
              generatedDocuments.length >
              1
                ? "s"
                : ""
            } généré${
              generatedDocuments.length >
              1
                ? "s"
                : ""
            }.`
          );
        }
      } catch (error) {
        console.error(
          "LOAD DOCUMENTS ERROR:",
          error
        );

        setDocuments([]);

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Erreur lors du chargement des documents."
        );
      } finally {
        setIsLoading(false);
      }
    }, [getProfileId]);

  /* ============================================================
     INITIAL LOAD
  ============================================================ */

  useEffect(() => {
    void loadDocuments();
  }, [loadDocuments]);

  /* ============================================================
     FILTER
  ============================================================ */

  const filteredDocuments =
    useMemo(() => {
      const search =
        normalizeText(searchTerm);

      if (!search) {
        return documents;
      }

      return documents.filter(
        ({ application, job }) => {
          const values = [
            job?.title,
            job?.company,
            job?.domaine,
            job?.location,
            job?.source,
            application.status,
            application.cover_letter,
          ];

          return values.some((value) =>
            normalizeText(
              value
            ).includes(search)
          );
        }
      );
    }, [
      documents,
      searchTerm,
    ]);

  /* ============================================================
     STATISTICS
  ============================================================ */

  const statistics =
    useMemo(() => {
      const total =
        documents.length;

      const cvs =
        documents.filter(
          ({ application }) =>
            Boolean(
              application.cv_url
            )
        ).length;

      const letters =
        documents.filter(
          ({ application }) =>
            Boolean(
              application.cover_letter
            )
        ).length;

      const both =
        documents.filter(
          ({ application }) =>
            Boolean(
              application.cv_url &&
                application.cover_letter
            )
        ).length;

      return {
        total,
        cvs,
        letters,
        both,
      };
    }, [documents]);

  /* ============================================================
     GENERATE DOCUMENT
  ============================================================ */

  const handleGenerate =
    async (
      jobId: string,
      action: GenerationAction
    ) => {
      if (!profileId) {
        setErrorMessage(
          "Profil introuvable."
        );

        return;
      }

      if (isGenerating !== null) {
        return;
      }

      setIsGenerating({
        jobId,
        action,
      });

      setErrorMessage(null);
      setSuccessMessage(null);

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
                job_id: jobId,
                action,
              }),

              cache: "no-store",
            }
          );

        const responseText =
          await response.text();

        let data: any = {};

        try {
          data = responseText
            ? JSON.parse(
                responseText
              )
            : {};
        } catch {
          data = {
            raw: responseText,
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
          data?.success === false
        ) {
          throw new Error(
            data?.error ||
              data?.message ||
              "La génération a échoué."
          );
        }

        /* ======================================================
           CV
        ====================================================== */

        if (action === "cv") {
          if (data?.cv_base64) {
            openBase64Pdf(
              data.cv_base64,
              "CV-personnalise.pdf"
            );
          } else if (
            data?.cv_url
          ) {
            window.open(
              data.cv_url,
              "_blank",
              "noopener,noreferrer"
            );
          } else {
            throw new Error(
              "Aucun CV n'a été retourné par n8n."
            );
          }
        }

        /* ======================================================
           LETTER
        ====================================================== */

        if (
          action === "letter"
        ) {
          if (
            data?.cover_letter_base64
          ) {
            openBase64Pdf(
              data.cover_letter_base64,
              "Lettre-de-motivation.pdf"
            );
          } else if (
            data?.cover_letter_url
          ) {
            window.open(
              data.cover_letter_url,
              "_blank",
              "noopener,noreferrer"
            );
          } else if (
            data?.cover_letter
          ) {
            const blob =
              new Blob(
                [
                  String(
                    data.cover_letter
                  ),
                ],
                {
                  type: "text/plain;charset=utf-8",
                }
              );

            const url =
              URL.createObjectURL(
                blob
              );

            window.open(
              url,
              "_blank",
              "noopener,noreferrer"
            );
          } else {
            throw new Error(
              "Aucune lettre de motivation n'a été retournée par n8n."
            );
          }
        }

        /* ======================================================
           BOTH
        ====================================================== */

        if (
          action === "both"
        ) {
          let opened = false;

          if (
            data?.cv_base64
          ) {
            openBase64Pdf(
              data.cv_base64,
              "CV-personnalise.pdf"
            );

            opened = true;
          } else if (
            data?.cv_url
          ) {
            window.open(
              data.cv_url,
              "_blank",
              "noopener,noreferrer"
            );

            opened = true;
          }

          if (
            data?.cover_letter_base64
          ) {
            setTimeout(
              () => {
                try {
                  openBase64Pdf(
                    data.cover_letter_base64,
                    "Lettre-de-motivation.pdf"
                  );
                } catch (
                  error
                ) {
                  console.error(
                    "LETTER ERROR:",
                    error
                  );
                }
              },
              700
            );

            opened = true;
          } else if (
            data?.cover_letter_url
          ) {
            setTimeout(
              () => {
                window.open(
                  data.cover_letter_url,
                  "_blank",
                  "noopener,noreferrer"
                );
              },
              700
            );

            opened = true;
          } else if (
            data?.cover_letter
          ) {
            const blob =
              new Blob(
                [
                  String(
                    data.cover_letter
                  ),
                ],
                {
                  type: "text/plain;charset=utf-8",
                }
              );

            const url =
              URL.createObjectURL(
                blob
              );

            setTimeout(
              () => {
                window.open(
                  url,
                  "_blank",
                  "noopener,noreferrer"
                );
              },
              700
            );

            opened = true;
          }

          if (!opened) {
            throw new Error(
              "Aucun document n'a été retourné par n8n."
            );
          }
        }

        const label =
          action === "cv"
            ? "CV"
            : action ===
              "letter"
            ? "lettre de motivation"
            : "CV et lettre de motivation";

        setSuccessMessage(
          `${label} généré avec succès.`
        );

        /*
         * Recharge les applications afin
         * d'afficher immédiatement le document
         * enregistré par n8n.
         */
        setTimeout(() => {
          void loadDocuments();
        }, 1000);
      } catch (error) {
        console.error(
          "GENERATION ERROR:",
          error
        );

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Erreur pendant la génération."
        );
      } finally {
        setIsGenerating(null);
      }
    };

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="mx-auto max-w-7xl">

        {/* ======================================================
            HEADER
        ====================================================== */}

        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

          <div>
            <div className="flex items-center gap-3">

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100 text-2xl">
                📄
              </div>

              <div>
                <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                  Mes CV & lettres
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                  Retrouve ici tous tes documents
                  générés pour tes candidatures.
                </p>
              </div>

            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              void loadDocuments();
            }}
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="text-base">
              ↻
            </span>

            {isLoading
              ? "Actualisation..."
              : "Actualiser"}
          </button>

        </div>

        {/* ======================================================
            SUCCESS
        ====================================================== */}

        {successMessage && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">

            <span className="text-lg">
              ✓
            </span>

            <div>
              <div className="font-semibold">
                Succès
              </div>

              <div className="mt-1">
                {successMessage}
              </div>
            </div>

          </div>
        )}

        {/* ======================================================
            ERROR
        ====================================================== */}

        {errorMessage && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">

            <div className="flex items-start gap-3">

              <span className="text-lg">
                ⚠
              </span>

              <div className="flex-1">

                <div className="font-semibold">
                  Erreur
                </div>

                <div className="mt-1 break-words">
                  {errorMessage}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    void loadDocuments();
                  }}
                  className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-red-700"
                >
                  Réessayer
                </button>

              </div>

            </div>

          </div>
        )}

        {/* ======================================================
            STATISTICS
        ====================================================== */}

        {!isLoading && (
          <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="text-sm text-gray-500">
                Documents
              </div>

              <div className="mt-2 text-3xl font-bold text-gray-900">
                {statistics.total}
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="text-sm text-gray-500">
                CV générés
              </div>

              <div className="mt-2 text-3xl font-bold text-green-600">
                {statistics.cvs}
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="text-sm text-gray-500">
                Lettres
              </div>

              <div className="mt-2 text-3xl font-bold text-blue-600">
                {statistics.letters}
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="text-sm text-gray-500">
                CV + lettre
              </div>

              <div className="mt-2 text-3xl font-bold text-emerald-600">
                {statistics.both}
              </div>
            </div>

          </div>
        )}

        {/* ======================================================
            GENERATE NEW DOCUMENT
        ====================================================== */}

        {!isLoading &&
          jobs.length > 0 && (
            <section className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

              <div className="mb-5">

                <div className="flex items-center gap-2">

                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-100">
                    ✨
                  </div>

                  <div>
                    <h2 className="font-bold text-gray-900">
                      Générer un nouveau document
                    </h2>

                    <p className="text-xs text-gray-500">
                      Choisis une offre pour créer un CV
                      personnalisé ou une lettre.
                    </p>
                  </div>

                </div>

              </div>

              <div className="grid gap-4 lg:grid-cols-2">

                {jobs.slice(0, 10).map(
                  (job) => {
                    const generating =
                      isGenerating?.jobId ===
                      String(job.id);

                    return (
                      <div
                        key={String(job.id)}
                        className="rounded-xl border border-gray-200 p-4 transition hover:border-green-300 hover:shadow-sm"
                      >

                        <div className="min-w-0">

                          <h3 className="font-semibold text-gray-900">
                            {job.title ||
                              "Poste non spécifié"}
                          </h3>

                          <div className="mt-1 text-sm text-gray-500">
                            {job.company ||
                              "Entreprise non spécifiée"}
                          </div>

                          {job.location && (
                            <div className="mt-1 text-xs text-gray-400">
                              📍 {job.location}
                            </div>
                          )}

                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">

                          <button
                            type="button"
                            disabled={
                              isGenerating !==
                              null
                            }
                            onClick={() =>
                              void handleGenerate(
                                String(
                                  job.id
                                ),
                                "cv"
                              )
                            }
                            className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {generating &&
                            isGenerating?.action ===
                              "cv" ? (
                              <>
                                <span className="animate-spin">
                                  ⟳
                                </span>
                                Génération...
                              </>
                            ) : (
                              <>
                                📄 CV
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            disabled={
                              isGenerating !==
                              null
                            }
                            onClick={() =>
                              void handleGenerate(
                                String(
                                  job.id
                                ),
                                "letter"
                              )
                            }
                            className="inline-flex items-center gap-2 rounded-lg border border-green-600 bg-white px-3 py-2 text-xs font-semibold text-green-700 transition hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {generating &&
                            isGenerating?.action ===
                              "letter" ? (
                              <>
                                <span className="animate-spin">
                                  ⟳
                                </span>
                                Génération...
                              </>
                            ) : (
                              <>
                                ✉️ Lettre
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            disabled={
                              isGenerating !==
                              null
                            }
                            onClick={() =>
                              void handleGenerate(
                                String(
                                  job.id
                                ),
                                "both"
                              )
                            }
                            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {generating &&
                            isGenerating?.action ===
                              "both" ? (
                              <>
                                <span className="animate-spin">
                                  ⟳
                                </span>
                                Génération...
                              </>
                            ) : (
                              <>
                                📄✉️ Les deux
                              </>
                            )}
                          </button>

                        </div>

                      </div>
                    );
                  }
                )}

              </div>

            </section>
          )}

        {/* ======================================================
            SEARCH
        ====================================================== */}

        {!isLoading &&
          documents.length > 0 && (
            <div className="mb-6">

              <div className="relative">

                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  🔎
                </span>

                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) =>
                    setSearchTerm(
                      event.target.value
                    )
                  }
                  placeholder="Rechercher un poste, une entreprise, un domaine..."
                  className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm text-gray-800 shadow-sm outline-none transition placeholder:text-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                />

              </div>

            </div>
          )}

        {/* ======================================================
            LOADING
        ====================================================== */}

        {isLoading && (
          <div className="rounded-2xl border border-gray-200 bg-white py-20 text-center shadow-sm">

            <div className="mx-auto flex h-14 w-14 animate-pulse items-center justify-center rounded-2xl bg-green-100 text-2xl">
              📄
            </div>

            <div className="mt-4 font-semibold text-gray-800">
              Chargement de tes documents...
            </div>

            <div className="mt-1 text-sm text-gray-500">
              Récupération des CV et lettres générés.
            </div>

          </div>
        )}

        {/* ======================================================
            EMPTY
        ====================================================== */}

        {!isLoading &&
          filteredDocuments.length === 0 && (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white py-20 text-center shadow-sm">

              <div className="text-5xl">
                📄
              </div>

              <h2 className="mt-4 text-lg font-semibold text-gray-900">
                {documents.length === 0
                  ? "Aucun document généré"
                  : "Aucun document trouvé"}
              </h2>

              <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-gray-500">
                {documents.length === 0
                  ? "Génère ton premier CV ou ta première lettre de motivation depuis une offre d'emploi."
                  : "Aucun document ne correspond à ta recherche."}
              </p>

              {documents.length === 0 &&
                jobs.length === 0 && (
                  <p className="mx-auto mt-4 max-w-lg rounded-xl bg-amber-50 p-4 text-xs text-amber-700">
                    Aucune offre disponible pour le
                    moment. Va dans la page Offres d'emploi
                    pour vérifier les offres récupérées.
                  </p>
                )}

              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  void loadDocuments();
                }}
                className="mt-5 rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-700"
              >
                Actualiser
              </button>

            </div>
          )}

        {/* ======================================================
            DOCUMENT LIST
        ====================================================== */}

        {!isLoading &&
          filteredDocuments.length > 0 && (
            <div className="space-y-5">

              <div className="flex items-center justify-between">

                <div className="text-sm text-gray-500">
                  <span className="font-semibold text-gray-900">
                    {filteredDocuments.length}
                  </span>{" "}
                  document
                  {filteredDocuments.length >
                  1
                    ? "s"
                    : ""}{" "}
                  généré
                  {filteredDocuments.length >
                  1
                    ? "s"
                    : ""}
                </div>

                <div className="text-xs text-gray-400">
                  Plus récents en premier
                </div>

              </div>

              {filteredDocuments.map(
                ({
                  application,
                  job,
                }) => {
                  const hasCv =
                    Boolean(
                      application.cv_url
                    );

                  const hasLetter =
                    Boolean(
                      application.cover_letter
                    );

                  const statusInfo =
                    getStatusLabel(
                      application.status
                    );

                  return (
                    <article
                      key={String(
                        application.id
                      )}
                      className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:border-green-200 hover:shadow-md"
                    >

                      {/* HEADER */}

                      <div className="p-6">

                        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

                          <div className="min-w-0 flex-1">

                            <div className="mb-3 flex flex-wrap items-center gap-2">

                              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                                Documents générés
                              </span>

                              <span
                                className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusInfo.className}`}
                              >
                                {statusInfo.label}
                              </span>

                            </div>

                            <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
                              {job?.title ||
                                "Candidature"}
                            </h2>

                            <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-500">

                              <span>
                                🏢{" "}
                                {job?.company ||
                                  "Entreprise non spécifiée"}
                              </span>

                              {job?.location && (
                                <span>
                                  📍{" "}
                                  {job.location}
                                </span>
                              )}

                              {job?.domaine && (
                                <span>
                                  💼{" "}
                                  {job.domaine}
                                </span>
                              )}

                            </div>

                            <div className="mt-3 text-xs text-gray-400">
                              Généré le{" "}
                              {formatDate(
                                application.created_at
                              )}
                            </div>

                          </div>

                          {/* DOCUMENT COUNTER */}

                          <div className="flex shrink-0 gap-2">

                            {hasCv && (
                              <div className="rounded-xl bg-green-50 px-4 py-3 text-center">
                                <div className="text-xl">
                                  📄
                                </div>

                                <div className="mt-1 text-xs font-semibold text-green-700">
                                  CV
                                </div>
                              </div>
                            )}

                            {hasLetter && (
                              <div className="rounded-xl bg-blue-50 px-4 py-3 text-center">
                                <div className="text-xl">
                                  ✉️
                                </div>

                                <div className="mt-1 text-xs font-semibold text-blue-700">
                                  Lettre
                                </div>
                              </div>
                            )}

                          </div>

                        </div>

                        {/* DOCUMENT CARDS */}

                        <div className="mt-6 grid gap-4 lg:grid-cols-2">

                          {/* CV */}

                          {hasCv && (
                            <div className="rounded-2xl border border-green-100 bg-green-50/50 p-5">

                              <div className="flex items-start gap-4">

                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-600 text-xl text-white">
                                  📄
                                </div>

                                <div className="min-w-0 flex-1">

                                  <h3 className="font-bold text-gray-900">
                                    CV personnalisé
                                  </h3>

                                  <p className="mt-1 text-xs leading-5 text-gray-500">
                                    CV généré automatiquement
                                    et adapté à cette offre.
                                  </p>

                                </div>

                              </div>

                              <div className="mt-4 flex flex-wrap gap-2">

                                <a
                                  href={
                                    application.cv_url ||
                                    "#"
                                  }
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-green-700"
                                >
                                  👁️ Ouvrir
                                </a>

                                <a
                                  href={
                                    application.cv_url ||
                                    "#"
                                  }
                                  download
                                  className="inline-flex items-center gap-2 rounded-lg border border-green-600 bg-white px-4 py-2.5 text-xs font-semibold text-green-700 transition hover:bg-green-50"
                                >
                                  ⬇️ Télécharger
                                </a>

                              </div>

                            </div>
                          )}

                          {/* LETTER */}

                          {hasLetter && (
                            <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-5">

                              <div className="flex items-start gap-4">

                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-xl text-white">
                                  ✉️
                                </div>

                                <div className="min-w-0 flex-1">

                                  <h3 className="font-bold text-gray-900">
                                    Lettre de motivation
                                  </h3>

                                  <p className="mt-1 text-xs leading-5 text-gray-500">
                                    Lettre personnalisée pour
                                    cette candidature.
                                  </p>

                                </div>

                              </div>

                              <div className="mt-4 flex flex-wrap gap-2">

                                <button
                                  type="button"
                                  onClick={() =>
                                    setActiveLetter(
                                      {
                                        application,
                                        job,
                                      }
                                    )
                                  }
                                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-blue-700"
                                >
                                  👁️ Lire
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    downloadTextFile(
                                      application.cover_letter ||
                                        "",
                                      `Lettre-${(
                                        job?.title ||
                                        "motivation"
                                      )
                                        .replace(
                                          /[^a-zA-Z0-9-_]/g,
                                          "-"
                                        )
                                        .slice(
                                          0,
                                          50
                                        )}.txt`
                                    )
                                  }
                                  className="inline-flex items-center gap-2 rounded-lg border border-blue-600 bg-white px-4 py-2.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-50"
                                >
                                  ⬇️ Télécharger
                                </button>

                              </div>

                            </div>
                          )}

                        </div>

                      </div>

                      {/* FOOTER */}

                      <div className="border-t border-gray-100 bg-gray-50 px-6 py-4">

                        <div className="flex flex-wrap items-center justify-between gap-3">

                          <div className="text-xs text-gray-400">
                            ID candidature :{" "}
                            {String(
                              application.id
                            ).slice(
                              0,
                              12
                            )}
                          </div>

                          <div className="flex flex-wrap gap-2">

                            {(job?.apply_url ||
                              job?.url ||
                              job?.link) && (
                              <a
                                href={
                                  job.apply_url ||
                                  job.url ||
                                  job.link ||
                                  "#"
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-100"
                              >
                                🔗 Voir l'offre
                              </a>
                            )}

                          </div>

                        </div>

                      </div>

                    </article>
                  );
                }
              )}

            </div>
          )}

      </div>

      {/* ========================================================
          LETTER MODAL
      ======================================================== */}

      {activeLetter && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() =>
            setActiveLetter(null)
          }
        >

          <div
            className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* MODAL HEADER */}

            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">

              <div>

                <div className="flex items-center gap-2">

                  <span className="text-xl">
                    ✉️
                  </span>

                  <h2 className="font-bold text-gray-900">
                    Lettre de motivation
                  </h2>

                </div>

                <p className="mt-1 text-xs text-gray-500">
                  {activeLetter.job
                    ?.title ||
                    "Candidature"}{" "}
                  —{" "}
                  {activeLetter.job
                    ?.company ||
                    "Entreprise"}
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  setActiveLetter(null)
                }
                className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
              >
                ✕
              </button>

            </div>

            {/* LETTER CONTENT */}

            <div className="overflow-y-auto p-6">

              <div className="whitespace-pre-wrap rounded-xl border border-gray-200 bg-gray-50 p-6 text-sm leading-7 text-gray-700">
                {
                  activeLetter
                    .application
                    .cover_letter
                }
              </div>

            </div>

            {/* MODAL FOOTER */}

            <div className="flex flex-wrap justify-end gap-3 border-t border-gray-200 px-6 py-4">

              <button
                type="button"
                onClick={() =>
                  downloadTextFile(
                    activeLetter
                      .application
                      .cover_letter ||
                      "",
                    `Lettre-de-motivation.txt`
                  )
                }
                className="inline-flex items-center gap-2 rounded-xl border border-blue-600 bg-white px-4 py-2.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
              >
                ⬇️ Télécharger
              </button>

              <button
                type="button"
                onClick={() =>
                  setActiveLetter(null)
                }
                className="rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
              >
                Fermer
              </button>

            </div>

          </div>

        </div>
      )}
    </div>
  );
}