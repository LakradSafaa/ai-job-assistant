"use client";

import { useEffect, useState } from "react";

import PageHeader from "@/components/dashboard/PageHeader";
import KpiGrid from "@/components/dashboard/KpiGrid";
import RecommendedJobs, {
  type RecommendedJob,
} from "@/components/dashboard/RecommendedJobs";
import RecentActivity, {
  type ActivityItem,
} from "@/components/dashboard/RecentActivity";

import { createClient } from "@/lib/supabase/client";

interface DashboardStats {
  profileCompletion: string;
  totalJobs: string;
  totalApplications: string;
  averageMatch: string;
  bestMatch: string;
  recommendedJobs: string;
  pendingApplications: string;
  remoteJobs: string;
  averageSalary: string;
}

interface JobRow {
  id: string;
  title: string | null;
  location: string | null;
  remote: boolean | null;
  salary_min: number | null;
  salary_max: number | null;
  currency: string | null;
}

interface MatchRow {
  id: number | string;
  job_id: string | null;
  score: number | null;
  created_at: string;
}

interface ApplicationRow {
  id: string;
  job_id: string | null;
  status: string | null;
  applied_at: string | null;
  created_at: string;
}

function formatSalary(
  min: number | null,
  max: number | null,
  currency: string | null
) {
  if (
    min === null &&
    max === null
  ) {
    return "Salaire non précisé";
  }

  const currencyLabel =
    currency?.trim() || "€";

  if (
    min !== null &&
    max !== null
  ) {
    return `${min.toLocaleString("fr-FR")} – ${max.toLocaleString(
      "fr-FR"
    )} ${currencyLabel}`;
  }

  if (min !== null) {
    return `À partir de ${min.toLocaleString(
      "fr-FR"
    )} ${currencyLabel}`;
  }

  return `Jusqu'à ${max?.toLocaleString(
    "fr-FR"
  )} ${currencyLabel}`;
}

function applicationStatusLabel(
  status: string | null
) {
  if (!status) {
    return "Candidature";
  }

  const normalized =
    status.toLowerCase().trim();

  const labels: Record<string, string> = {
    pending: "En attente",
    submitted: "Envoyée",
    applied: "Envoyée",
    sent: "Envoyée",
    interview: "Entretien",
    accepted: "Acceptée",
    rejected: "Refusée",
    "en cours": "En cours",
    envoyée: "Envoyée",
    envoyee: "Envoyée",
    entretien: "Entretien",
    acceptee: "Acceptée",
    acceptée: "Acceptée",
    refusee: "Refusée",
    refusée: "Refusée",
  };

  return labels[normalized] ?? status;
}

export default function DashboardPage() {
  const [name, setName] =
    useState("Utilisateur");

  const [stats, setStats] =
    useState<DashboardStats>({
      profileCompletion: "0%",
      totalJobs: "0",
      totalApplications: "0",
      averageMatch: "0%",
      bestMatch: "0%",
      recommendedJobs: "0",
      pendingApplications: "0",
      remoteJobs: "0",
      averageSalary: "—",
    });

  const [recommendedJobs, setRecommendedJobs] =
    useState<RecommendedJob[]>([]);

  const [activities, setActivities] =
    useState<ActivityItem[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    async function loadDashboard() {
      const supabase = createClient();

      try {
        // =====================================================
        // 1. UTILISATEUR
        // =====================================================

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          console.error(
            "Erreur utilisateur :",
            userError
          );

          return;
        }

        if (!user) {
          return;
        }

        const profileId = user.id;

        // =====================================================
        // 2. PROFILE
        // =====================================================

        const {
          data: profile,
          error: profileError,
        } = await supabase
          .from("profiles")
          .select(
            `
              name,
              email,
              phone,
              country,
              city,
              address,
              date_of_birth,
              skills
            `
          )
          .eq("id", profileId)
          .maybeSingle();

        if (profileError) {
          console.error(
            "Erreur récupération profil :",
            profileError
          );
        }

        if (profile?.name) {
          setName(profile.name);
        }

        // =====================================================
        // 3. NOMBRE D'OFFRES
        // =====================================================

        const {
          count: jobsCount,
          error: jobsCountError,
        } = await supabase
          .from("jobs")
          .select("id", {
            count: "exact",
            head: true,
          });

        if (jobsCountError) {
          console.error(
            "Erreur nombre offres :",
            jobsCountError
          );
        }

        // =====================================================
        // 4. APPLICATIONS
        // =====================================================

        const {
          data: applications,
          count: applicationsCount,
          error: applicationsError,
        } = await supabase
          .from("applications")
          .select(
            "id, job_id, status, applied_at, created_at",
            {
              count: "exact",
            }
          )
          .eq("profile_id", profileId)
          .order("created_at", {
            ascending: false,
          })
          .limit(10);

        if (applicationsError) {
          console.error(
            "Erreur récupération candidatures :",
            applicationsError
          );
        }

        // =====================================================
        // 5. MATCHES
        // =====================================================

        const {
          data: matches,
          error: matchesError,
        } = await supabase
          .from("job_matches")
          .select(
            "id, job_id, score, created_at"
          )
          .eq("profile_id", profileId)
          .order("score", {
            ascending: false,
          })
          .limit(20);

        if (matchesError) {
          console.error(
            "Erreur récupération matching :",
            matchesError
          );
        }

        // =====================================================
        // 6. OFFRES REMOTE
        // =====================================================

        const {
          count: remoteJobsCount,
          error: remoteJobsError,
        } = await supabase
          .from("jobs")
          .select("id", {
            count: "exact",
            head: true,
          })
          .eq("remote", true);

        if (remoteJobsError) {
          console.error(
            "Erreur offres remote :",
            remoteJobsError
          );
        }

        // =====================================================
        // 7. SALAIRES
        // =====================================================

        const {
          data: salaryJobs,
          error: salaryError,
        } = await supabase
          .from("jobs")
          .select(
            "salary_min, salary_max"
          )
          .not("salary_min", "is", null)
          .not("salary_max", "is", null);

        if (salaryError) {
          console.error(
            "Erreur salaires :",
            salaryError
          );
        }

        // =====================================================
        // 8. CALCUL MATCHING
        // =====================================================

        const matchRows =
          (matches as MatchRow[] | null) ?? [];

        const scores =
          matchRows
            .map((match) =>
              Number(match.score)
            )
            .filter(
              (score) =>
                !Number.isNaN(score)
            );

        let averageMatch = 0;
        let bestMatch = 0;

        if (scores.length > 0) {
          averageMatch =
            scores.reduce(
              (total, score) =>
                total + score,
              0
            ) / scores.length;

          bestMatch =
            Math.max(...scores);
        }

        const recommendedCount =
          scores.filter(
            (score) => score >= 70
          ).length;

        // =====================================================
        // 9. CANDIDATURES EN ATTENTE
        // =====================================================

        const applicationRows =
          (applications as ApplicationRow[] | null) ??
          [];

        const pendingApplications =
          applicationRows.filter(
            (application) => {
              const status =
                application.status
                  ?.toLowerCase()
                  .trim();

              return (
                status === "pending" ||
                status === "en cours" ||
                status === "submitted" ||
                status === "sent" ||
                status === "envoyée" ||
                status === "envoyee"
              );
            }
          ).length;

        // =====================================================
        // 10. SALAIRE MOYEN
        // =====================================================

        const salaries: number[] = [];

        salaryJobs?.forEach((job) => {
          const min =
            Number(job.salary_min);

          const max =
            Number(job.salary_max);

          if (
            !Number.isNaN(min) &&
            !Number.isNaN(max)
          ) {
            salaries.push(
              (min + max) / 2
            );
          }
        });

        let averageSalary = "—";

        if (salaries.length > 0) {
          const average =
            salaries.reduce(
              (total, salary) =>
                total + salary,
              0
            ) / salaries.length;

          averageSalary =
            `${Math.round(
              average
            ).toLocaleString("fr-FR")} €`;
        }

        // =====================================================
        // 11. PROFIL
        // =====================================================

        const profileFields = [
          profile?.name,
          profile?.email,
          profile?.phone,
          profile?.country,
          profile?.city,
          profile?.address,
          profile?.date_of_birth,
          profile?.skills,
        ];

        const completedFields =
          profileFields.filter(
            (value) =>
              value !== null &&
              value !== undefined &&
              String(value).trim() !== ""
          ).length;

        const profileCompletion =
          Math.round(
            (completedFields /
              profileFields.length) *
              100
          );

        // =====================================================
        // 12. RÉCUPÉRER LES JOBS DES MATCHES
        // =====================================================

        const matchJobIds =
          matchRows
            .map(
              (match) =>
                match.job_id
            )
            .filter(
              (
                id
              ): id is string =>
                Boolean(id)
            );

        const uniqueMatchJobIds =
          [...new Set(matchJobIds)];

        let matchedJobs: JobRow[] = [];

        if (
          uniqueMatchJobIds.length > 0
        ) {
          const {
            data: jobsData,
            error: matchedJobsError,
          } = await supabase
            .from("jobs")
            .select(
              `
                id,
                title,
                location,
                remote,
                salary_min,
                salary_max,
                currency
              `
            )
            .in(
              "id",
              uniqueMatchJobIds
            );

          if (matchedJobsError) {
            console.error(
              "Erreur offres matching :",
              matchedJobsError
            );
          }

          matchedJobs =
            (jobsData as JobRow[] | null) ??
            [];
        }

        // =====================================================
        // 13. CONSTRUIRE OFFRES RECOMMANDÉES
        // =====================================================

        const jobsById =
          new Map<string, JobRow>();

        matchedJobs.forEach((job) => {
          jobsById.set(job.id, job);
        });

        const recommendationList: RecommendedJob[] =
          matchRows
            .filter(
              (match) =>
                match.job_id &&
                Number(match.score) >= 70
            )
            .slice(0, 5)
            .map((match) => {
              const job =
                match.job_id
                  ? jobsById.get(
                      match.job_id
                    )
                  : undefined;

              if (!job) {
                return null;
              }

              return {
                id: job.id,
                title:
                  job.title ||
                  "Offre sans titre",
                location:
                  job.location ||
                  "Localisation non précisée",
                remote:
                  Boolean(job.remote),
                score:
                  Number(match.score) || 0,
                salary:
                  formatSalary(
                    job.salary_min,
                    job.salary_max,
                    job.currency
                  ),
              };
            })
            .filter(
              (
                job
              ): job is RecommendedJob =>
                job !== null
            );

        setRecommendedJobs(
          recommendationList
        );

        // =====================================================
        // 14. ACTIVITÉ RÉCENTE
        // =====================================================

        const activityItems: ActivityItem[] =
          [];

        // Candidatures
        const applicationJobIds =
          applicationRows
            .map(
              (application) =>
                application.job_id
            )
            .filter(
              (
                id
              ): id is string =>
                Boolean(id)
            );

        const uniqueApplicationJobIds =
          [
            ...new Set(
              applicationJobIds
            ),
          ];

        let applicationJobs: JobRow[] =
          [];

        if (
          uniqueApplicationJobIds.length >
          0
        ) {
          const {
            data: applicationJobsData,
            error: applicationJobsError,
          } = await supabase
            .from("jobs")
            .select(
              `
                id,
                title,
                location,
                remote,
                salary_min,
                salary_max,
                currency
              `
            )
            .in(
              "id",
              uniqueApplicationJobIds
            );

          if (applicationJobsError) {
            console.error(
              "Erreur offres candidatures :",
              applicationJobsError
            );
          }

          applicationJobs =
            (applicationJobsData as JobRow[] | null) ??
            [];
        }

        const applicationJobsById =
          new Map<string, JobRow>();

        applicationJobs.forEach((job) => {
          applicationJobsById.set(
            job.id,
            job
          );
        });

        applicationRows
          .slice(0, 5)
          .forEach((application) => {
            const job =
              application.job_id
                ? applicationJobsById.get(
                    application.job_id
                  )
                : undefined;

            const date =
              application.applied_at ||
              application.created_at;

            activityItems.push({
              id: `application-${application.id}`,
              type: "application",
              title:
                "Candidature envoyée",
              description:
                job?.title
                  ? `Vous avez candidaté à « ${job.title} ».`
                  : "Une nouvelle candidature a été enregistrée.",
              date,
              status:
                applicationStatusLabel(
                  application.status
                ),
            });
          });

        // Matching
        matchRows
          .slice(0, 5)
          .forEach((match) => {
            const job =
              match.job_id
                ? jobsById.get(
                    match.job_id
                  )
                : undefined;

            activityItems.push({
              id: `match-${match.id}`,
              type: "match",
              title:
                "Nouveau matching IA",
              description:
                job?.title
                  ? `Votre profil correspond à « ${job.title} » à ${Math.round(
                      Number(match.score) || 0
                    )}%.`
                  : `Une nouvelle offre correspond à ${Math.round(
                      Number(match.score) || 0
                    )}% à votre profil.`,
              date: match.created_at,
              status: "Analyse IA",
            });
          });

        activityItems.sort(
          (a, b) =>
            new Date(b.date).getTime() -
            new Date(a.date).getTime()
        );

        setActivities(
          activityItems.slice(0, 8)
        );

        // =====================================================
        // 15. METTRE À JOUR LES KPI
        // =====================================================

        setStats({
          profileCompletion:
            `${profileCompletion}%`,

          totalJobs:
            String(jobsCount ?? 0),

          totalApplications:
            String(
              applicationsCount ?? 0
            ),

          averageMatch:
            `${Math.round(
              averageMatch
            )}%`,

          bestMatch:
            `${Math.round(
              bestMatch
            )}%`,

          recommendedJobs:
            String(
              recommendedCount
            ),

          pendingApplications:
            String(
              pendingApplications
            ),

          remoteJobs:
            String(
              remoteJobsCount ?? 0
            ),

          averageSalary,
        });
      } catch (error) {
        console.error(
          "Erreur Dashboard :",
          error
        );
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Bonjour, ${name} 👋`}
        subtitle="Voici votre tableau de bord IA."
      />

      {/* =====================================================
          KPI 3 × 3
      ===================================================== */}

      <KpiGrid
        stats={stats}
        loading={loading}
      />

      {/* =====================================================
          OFFRES + ACTIVITÉ
      ===================================================== */}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <RecommendedJobs
          jobs={recommendedJobs}
          loading={loading}
        />

        <RecentActivity
          activities={activities}
          loading={loading}
        />
      </div>
    </div>
  );
}