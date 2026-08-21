"use client";

import { useState } from "react";
import {
  MapPin,
  Building2,
  Sparkles,
} from "lucide-react";

import { ApplyModal } from "./ApplyModal";

type Company = {
  id: string;
  name: string | null;
  city: string | null;
  country: string | null;
  industry: string | null;
  logo_url: string | null;
  website: string | null;
};

type Job = {
  id: string;
  title: string | null;
  location: string | null;
  company_id: string | null;
  company: Company | null;
};

type JobMatch = {
  id: number;
  score: number | null;
  matched_skills: string[] | string | null;
  missing_skills: string[] | string | null;
  ai_summary: string | null;
  profile_id: string | null;
  job_id: string | null;
  jobs: Job | null;
};

interface JobCardProps {
  match: JobMatch;
}

export function JobCard({
  match,
}: JobCardProps) {
  const [isModalOpen, setIsModalOpen] =
    useState(false);

  const [isPrepared, setIsPrepared] =
    useState(false);

  const job = match.jobs;
  const company = job?.company;

  const score = match.score ?? 0;

  const title =
    job?.title || "Offre sans titre";

  const companyName =
    company?.name ||
    "Entreprise non spécifiée";

  const location =
    job?.location ||
    (company?.city
      ? `${company.city}${
          company.country
            ? `, ${company.country}`
            : ""
        }`
      : "Lieu non spécifié");

  // ==========================================
  // MATCHED SKILLS
  // ==========================================

  const matchedSkills = Array.isArray(
    match.matched_skills
  )
    ? match.matched_skills
    : typeof match.matched_skills ===
        "string"
      ? match.matched_skills
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean)
      : [];

  // ==========================================
  // CARD
  // ==========================================

  return (
    <>
      <div className="flex flex-col justify-between gap-5 rounded-2xl border border-slate-800 bg-slate-900 p-5 text-white shadow-lg transition hover:border-slate-700">

        {/* HEADER */}

        <div>
          <div className="flex items-start justify-between gap-3">

            <div className="min-w-0">

              <h3 className="truncate text-lg font-semibold text-white">
                {title}
              </h3>

              {/* COMPANY */}

              <div className="mt-2 flex items-center gap-2 text-sm text-slate-400">
                <Building2 size={15} />

                <span className="truncate">
                  {companyName}
                </span>
              </div>

              {/* LOCATION */}

              <div className="mt-1 flex items-center gap-2 text-sm text-slate-400">
                <MapPin size={15} />

                <span className="truncate">
                  {location}
                </span>
              </div>

            </div>

            {/* SCORE */}

            <span className="shrink-0 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-400">
              {score}% Match
            </span>

          </div>
        </div>

        {/* AI SUMMARY */}

        {match.ai_summary && (
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">

            <div className="mb-1 flex items-center gap-2 text-xs font-semibold text-emerald-400">
              <Sparkles size={14} />

              <span>
                Analyse IA
              </span>
            </div>

            <p className="line-clamp-3 text-sm leading-5 text-slate-400">
              {match.ai_summary}
            </p>

          </div>
        )}

        {/* SKILLS */}

        {matchedSkills.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Compétences correspondantes
            </p>

            <div className="flex flex-wrap gap-2">
              {matchedSkills
                .slice(0, 6)
                .map((skill, index) => (
                  <span
                    key={`${skill}-${index}`}
                    className="rounded-md bg-slate-800 px-2 py-1 text-xs text-slate-300"
                  >
                    {skill}
                  </span>
                ))}
            </div>
          </div>
        )}

        {/* BUTTON */}

        <div className="border-t border-slate-800 pt-4">

          <button
            type="button"
            onClick={() =>
              setIsModalOpen(true)
            }
            disabled={isPrepared}
            className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-emerald-600/20 disabled:text-emerald-400"
          >
            {isPrepared
              ? "✓ Candidature en préparation"
              : "🚀 Postuler"}
          </button>

        </div>

      </div>

      {/* MODAL */}

      <ApplyModal
        isOpen={isModalOpen}
        onClose={() =>
          setIsModalOpen(false)
        }
        jobMatchId={String(match.id)}
        jobTitle={title}
        companyName={
          companyName !==
          "Entreprise non spécifiée"
            ? companyName
            : undefined
        }
        onSuccess={() =>
          setIsPrepared(true)
        }
      />
    </>
  );
}

export default JobCard;