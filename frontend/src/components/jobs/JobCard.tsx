"use client";

import React, { useState } from "react";
import {
  Search,
  MapPin,
  Briefcase,
  ExternalLink,
  Sparkles,
  X,
  Building2,
} from "lucide-react";

export interface Job {
  id: string | number;
  title?: string;
  company?: string;
  location?: string;
  domain?: string;
  domaine?: string;
  source?: string;
  match_score?: number;
  ai_analysis?: string;
  recommendation?: string;
  description?: string;
  requirements?: string[] | string;
  url?: string;
}

interface JobBoardProps {
  jobs?: Job[];
}

export default function JobBoard({ jobs = [] }: JobBoardProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const getScoreStyle = (score?: number) => {
    if (score == null) return { badge: "bg-slate-100 text-slate-700" };
    if (score >= 80) return { badge: "bg-emerald-100 text-emerald-800" };
    if (score >= 60) return { badge: "bg-amber-100 text-amber-800" };
    return { badge: "bg-rose-100 text-rose-800" };
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      (job.title?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (job.company?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (job.description?.toLowerCase() || "").includes(searchTerm.toLowerCase());

    const matchesLocation = (job.location?.toLowerCase() || "").includes(
      locationFilter.toLowerCase()
    );

    return matchesSearch && matchesLocation;
  });

  const handleApply = (job: Job) => {
    if (job.url) {
      window.open(job.url, "_blank", "noopener,noreferrer");
    } else {
      alert("Aucun lien de postulation disponible pour cette offre.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        {/* HEADER & FILTRES */}
        <div className="mb-8 space-y-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
              Offres d'emploi recommandées
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Découvrez les meilleures opportunités analysées par l'IA.
            </p>
          </div>

          <div className="flex flex-col gap-3 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher par titre, entreprise ou mots-clés..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:border-[#005c45] focus:outline-none focus:ring-1 focus:ring-[#005c45]"
              />
            </div>

            <div className="relative md:w-64">
              <MapPin className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Ville ou pays..."
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:border-[#005c45] focus:outline-none focus:ring-1 focus:ring-[#005c45]"
              />
            </div>
          </div>
        </div>

        {/* GRILLE DES OFFRES */}
        {filteredJobs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <Briefcase className="mx-auto h-12 w-12 text-slate-300" />
            <h3 className="mt-4 text-base font-semibold text-slate-900">
              Aucune offre trouvée
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Essayez de modifier vos critères de recherche.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredJobs.map((job) => (
              <div
                key={job.id}
                className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-slate-300 hover:shadow-lg"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="line-clamp-2 font-bold text-slate-900">
                      {job.title || "Titre non spécifié"}
                    </h3>
                    {job.match_score != null && (
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          getScoreStyle(job.match_score).badge
                        }`}
                      >
                        {job.match_score}%
                      </span>
                    )}
                  </div>

                  <div className="mt-2 space-y-1 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{job.company || "Entreprise non spécifiée"}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{job.location || "Localisation non spécifiée"}</span>
                    </div>
                  </div>

                  {job.ai_analysis && (
                    <div className="mt-4 rounded-lg bg-emerald-50/70 p-3 text-xs text-emerald-900">
                      <div className="flex items-center gap-1 font-semibold text-emerald-800">
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>Analyse IA</span>
                      </div>
                      <p className="mt-1 line-clamp-2">{job.ai_analysis}</p>
                    </div>
                  )}
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                  <button
                    type="button"
                    onClick={() => setSelectedJob(job)}
                    className="text-xs font-semibold text-slate-600 hover:text-slate-900"
                  >
                    Voir détails
                  </button>

                  <button
                    type="button"
                    onClick={() => handleApply(job)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#005c45] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#004735]"
                  >
                    Postuler
                    <ExternalLink className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODALE DÉTAILS */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="sticky top-0 flex items-start justify-between border-b border-slate-100 bg-white p-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  {selectedJob.title || "Titre non spécifié"}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  {selectedJob.company || "Entreprise non spécifiée"} •{" "}
                  {selectedJob.location || "Localisation non spécifiée"}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedJob(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6 p-6">
              <div className="flex flex-wrap gap-2">
                {(selectedJob.domain || selectedJob.domaine) && (
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                    {selectedJob.domain || selectedJob.domaine}
                  </span>
                )}
                {selectedJob.source && (
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                    {selectedJob.source}
                  </span>
                )}
                {selectedJob.match_score != null && (
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      getScoreStyle(selectedJob.match_score).badge
                    }`}
                  >
                    Match : {selectedJob.match_score}%
                  </span>
                )}
              </div>

              {selectedJob.ai_analysis && (
                <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-emerald-700" />
                    <p className="text-xs font-bold uppercase tracking-wide text-emerald-800">
                      Analyse de l'IA
                    </p>
                  </div>
                  <p className="mt-2 text-sm text-emerald-950">
                    {selectedJob.ai_analysis}
                  </p>
                  {selectedJob.recommendation && (
                    <p className="mt-2 text-sm font-semibold text-emerald-900">
                      💡 {selectedJob.recommendation}
                    </p>
                  )}
                </div>
              )}

              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Description de l'offre
                </h4>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-600">
                  {selectedJob.description || "Aucune description fournie."}
                </p>
              </div>

              {selectedJob.requirements && (
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Exigences & Compétences
                  </h4>
                  <div className="mt-2">
                    {Array.isArray(selectedJob.requirements) ? (
                      <ul className="list-inside list-disc space-y-1 text-sm text-slate-600">
                        {selectedJob.requirements.map((req, idx) => (
                          <li key={idx}>{req}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="whitespace-pre-line text-sm text-slate-600">
                        {selectedJob.requirements}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50 p-4">
              <button
                type="button"
                onClick={() => setSelectedJob(null)}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Fermer
              </button>

              <button
                type="button"
                onClick={() => handleApply(selectedJob)}
                className="inline-flex items-center gap-2 rounded-lg bg-[#005c45] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#004735]"
              >
                <ExternalLink className="h-4 w-4" />
                Postuler maintenant
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}