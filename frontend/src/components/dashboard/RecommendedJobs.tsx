"use client";

import {
  ArrowRight,
  Briefcase,
  MapPin,
  Wifi,
} from "lucide-react";

export interface RecommendedJob {
  id: string;
  title: string;
  location: string;
  remote: boolean;
  score: number;
  salary: string;
}

interface RecommendedJobsProps {
  jobs: RecommendedJob[];
  loading?: boolean;
}

export default function RecommendedJobs({
  jobs,
  loading = false,
}: RecommendedJobsProps) {
  return (
    <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-[#1F6F5F]">
            IA Job Matching
          </p>

          <h2 className="mt-1 text-xl font-bold text-[#1F2937]">
            Offres recommandées
          </h2>

          <p className="mt-1 text-sm text-stone-500">
            Les offres les plus compatibles avec votre profil.
          </p>
        </div>

        <a
          href="/jobs"
          className="hidden items-center gap-2 text-sm font-medium text-[#1F6F5F] transition hover:text-[#155443] sm:flex"
        >
          Voir toutes
          <ArrowRight size={16} />
        </a>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-24 animate-pulse rounded-2xl bg-stone-50"
            />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-200 bg-stone-50 p-8 text-center">
          <Briefcase
            size={32}
            className="mx-auto text-stone-400"
          />

          <p className="mt-3 font-medium text-stone-700">
            Aucune offre recommandée pour le moment.
          </p>

          <p className="mt-1 text-sm text-stone-500">
            Les recommandations apparaîtront lorsque le matching IA
            sera disponible.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="group rounded-2xl border border-stone-100 bg-stone-50/60 p-4 transition hover:border-stone-200 hover:bg-white hover:shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1F6F5F]/10 text-[#1F6F5F]">
                      <Briefcase size={19} />
                    </div>

                    <div className="min-w-0">
                      <h3 className="truncate font-semibold text-[#1F2937]">
                        {job.title}
                      </h3>

                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-stone-500">
                        <span className="flex items-center gap-1">
                          <MapPin size={13} />
                          {job.location || "Localisation non précisée"}
                        </span>

                        {job.remote && (
                          <span className="flex items-center gap-1 text-[#1F6F5F]">
                            <Wifi size={13} />
                            Remote
                          </span>
                        )}
                      </div>

                      <p className="mt-2 text-xs font-medium text-stone-500">
                        {job.salary}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <div className="inline-flex rounded-full bg-[#1F6F5F]/10 px-3 py-1.5">
                    <span className="text-sm font-bold text-[#1F6F5F]">
                      {Math.round(job.score)}%
                    </span>
                  </div>

                  <p className="mt-1 text-[11px] text-stone-400">
                    matching
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <a
        href="/jobs"
        className="mt-5 flex items-center justify-center gap-2 rounded-2xl border border-stone-200 px-4 py-3 text-sm font-medium text-stone-600 transition hover:bg-stone-50 sm:hidden"
      >
        Voir toutes les offres
        <ArrowRight size={16} />
      </a>
    </section>
  );
}