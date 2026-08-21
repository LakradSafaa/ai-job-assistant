"use client";

import {
  CalendarDays,
  ExternalLink,
  FileText,
  MapPin,
} from "lucide-react";

export interface Application {
  id: string;
  status: string | null;
  cv_url: string | null;
  cover_letter: string | null;
  applied_at: string | null;

  job: {
    id: string;
    title: string;
    location: string | null;
    contract_type: string | null;
    remote: boolean | null;
  } | null;

  company: {
    id: string;
    name: string | null;
    city: string | null;
    country: string | null;
    logo_url: string | null;
  } | null;
}

interface ApplicationCardProps {
  application: Application;
}

function getStatusStyle(status: string | null) {
  const normalized = (
    status ?? "En attente"
  ).toLowerCase();

  if (
    normalized.includes("accept") ||
    normalized.includes("accepted")
  ) {
    return {
      label: "Acceptée",
      className:
        "bg-green-50 text-green-700 border-green-200",
    };
  }

  if (
    normalized.includes("refus") ||
    normalized.includes("reject")
  ) {
    return {
      label: "Refusée",
      className:
        "bg-red-50 text-red-700 border-red-200",
    };
  }

  if (
    normalized.includes("entretien") ||
    normalized.includes("interview")
  ) {
    return {
      label: "Entretien",
      className:
        "bg-blue-50 text-blue-700 border-blue-200",
    };
  }

  return {
    label: "En attente",
    className:
      "bg-amber-50 text-amber-700 border-amber-200",
  };
}

function formatDate(date: string | null) {
  if (!date) {
    return "Date inconnue";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Date inconnue";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(parsedDate);
}

export default function ApplicationCard({
  application,
}: ApplicationCardProps) {
  const status = getStatusStyle(
    application.status
  );

  const job = application.job;
  const company = application.company;

  return (
    <article className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm transition hover:shadow-md">
      {/* HEADER */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-4">
          {/* COMPANY LOGO */}
          <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#1F6F5F]/10 text-sm font-bold text-[#1F6F5F]">
            {company?.logo_url ? (
              <img
                src={company.logo_url}
                alt={
                  company.name ??
                  "Entreprise"
                }
                className="h-full w-full object-cover"
              />
            ) : (
              (
                company?.name ??
                "E"
              )
                .charAt(0)
                .toUpperCase()
            )}
          </div>

          {/* JOB */}
          <div className="min-w-0">
            <h2 className="truncate text-lg font-bold text-[#1F2937]">
              {job?.title ??
                "Offre supprimée"}
            </h2>

            <p className="mt-1 text-sm font-medium text-stone-500">
              {company?.name ??
                "Entreprise inconnue"}
            </p>

            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-sm text-stone-400">
              {job?.location && (
                <span className="flex items-center gap-1.5">
                  <MapPin size={14} />
                  {job.location}
                </span>
              )}

              {job?.remote && (
                <span className="text-[#1F6F5F]">
                  Télétravail
                </span>
              )}
            </div>
          </div>
        </div>

        {/* STATUS */}
        <span
          className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold ${status.className}`}
        >
          {status.label}
        </span>
      </div>

      {/* INFORMATIONS */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-stone-50 p-4">
          <div className="flex items-center gap-2 text-xs font-medium text-stone-400">
            <CalendarDays size={15} />
            Candidature envoyée
          </div>

          <p className="mt-2 text-sm font-semibold text-[#1F2937]">
            {formatDate(
              application.applied_at
            )}
          </p>
        </div>

        <div className="rounded-2xl bg-stone-50 p-4">
          <div className="flex items-center gap-2 text-xs font-medium text-stone-400">
            <FileText size={15} />
            CV utilisé
          </div>

          <p className="mt-2 truncate text-sm font-semibold text-[#1F2937]">
            {application.cv_url
              ? "CV sélectionné"
              : "Aucun CV enregistré"}
          </p>
        </div>
      </div>

      {/* COVER LETTER */}
      {application.cover_letter && (
        <div className="mt-5 rounded-2xl border border-stone-100 bg-stone-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">
            Lettre de motivation
          </p>

          <p className="mt-2 line-clamp-3 text-sm leading-6 text-stone-600">
            {application.cover_letter}
          </p>
        </div>
      )}

      {/* FOOTER */}
      <div className="mt-5 flex items-center justify-between border-t border-stone-100 pt-5">
        <div className="flex flex-wrap gap-2">
          {job?.contract_type && (
            <span className="rounded-lg bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-500">
              {job.contract_type}
            </span>
          )}

          {company?.city && (
            <span className="rounded-lg bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-500">
              {company.city}
            </span>
          )}
        </div>

        {application.cv_url && (
          <a
            href={application.cv_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-xl border border-stone-200 px-4 py-2.5 text-sm font-semibold text-stone-600 transition hover:bg-stone-50 hover:text-[#1F6F5F]"
          >
            <FileText size={16} />
            Voir le CV
            <ExternalLink size={14} />
          </a>
        )}
      </div>
    </article>
  );
}