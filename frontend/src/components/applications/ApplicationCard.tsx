"use client";

import React from "react";
import { 
  Building2, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  MessageSquare, 
  Send,
  FileText 
} from "lucide-react";

export interface Application {
  id: string;
  status: string | null;
  cv_url: string | null;
  cover_letter: string | null;
  applied_at: string | null;
  job?: {
    id: string;
    title: string;
    location: string | null;
    contract_type: string | null;
    remote: boolean | null;
  } | null;
  company?: {
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

const STAGES = [
  { key: "préparée", label: "Préparée", icon: FileText },
  { key: "confirmée", label: "Confirmée", icon: CheckCircle2 },
  { key: "soumise", label: "Soumise", icon: Send },
  { key: "entretien", label: "Entretien", icon: MessageSquare },
  { key: "acceptée", label: "Acceptée", icon: CheckCircle2 },
  { key: "refusée", label: "Refusée", icon: XCircle },
];

function getStatusBadge(status: string | null) {
  const norm = (status ?? "en attente").toLowerCase();

  if (norm.includes("accept")) {
    return "bg-emerald-50 text-emerald-700 border-emerald-200/80";
  }
  if (norm.includes("refus") || norm.includes("reject")) {
    return "bg-rose-50 text-rose-700 border-rose-200/80";
  }
  if (norm.includes("entretien") || norm.includes("interview")) {
    return "bg-sky-50 text-sky-700 border-sky-200/80";
  }
  return "bg-amber-50 text-amber-700 border-amber-200/80";
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "N/A";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "N/A";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default function ApplicationCard({ application }: ApplicationCardProps) {
  const { status, applied_at, job, company } = application;
  const statusClass = getStatusBadge(status);
  
  // Index d'étape actif (0 par défaut)
  const currentStageIndex = 0; 

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-stone-200/90 bg-white p-6 shadow-sm transition-all duration-300 hover:border-[#1F6F5F]/40 hover:shadow-xl hover:shadow-[#1F6F5F]/5">
      {/* HEADER CARD */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#1F6F5F]/10 font-bold text-[#1F6F5F] ring-1 ring-[#1F6F5F]/20">
            {company?.logo_url ? (
              <img
                src={company.logo_url}
                alt={company.name ?? "Entreprise"}
                className="h-full w-full object-cover"
              />
            ) : (
              <Building2 className="h-5 w-5 text-[#1F6F5F]" />
            )}
          </div>

          <div>
            <h3 className="text-base font-bold text-stone-900 transition-colors group-hover:text-[#1F6F5F]">
              {job?.title ?? "Candidature"}
            </h3>
            <p className="text-sm font-medium text-stone-500">
              {company?.name ?? "Entreprise non renseignée"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold capitalize tracking-wide ${statusClass}`}>
            <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
            {status ?? "En attente"}
          </span>
        </div>
      </div>

      {/* TIMELINE / PROGRESS STEPPER */}
      <div className="mt-8 border-t border-stone-100 pt-6">
        <div className="relative flex items-center justify-between">
          {/* Ligne de fond */}
          <div className="absolute left-0 top-1/2 h-0.5 w-full -translate-y-1/2 bg-stone-100" />
          
          {/* Ligne de progression dynamique */}
          <div 
            className="absolute left-0 top-1/2 h-0.5 -translate-y-1/2 bg-[#1F6F5F] transition-all duration-500" 
            style={{ width: `${(currentStageIndex / (STAGES.length - 1)) * 100}%` }}
          />

          {STAGES.map((stage, idx) => {
            const isCompleted = idx <= currentStageIndex;
            const isCurrent = idx === currentStageIndex;

            return (
              <div key={stage.key} className="relative z-10 flex flex-col items-center">
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full border-2 text-xs font-semibold transition-all duration-300 ${
                    isCurrent
                      ? "border-[#1F6F5F] bg-[#1F6F5F] text-white ring-4 ring-[#1F6F5F]/15 shadow-sm scale-105"
                      : isCompleted
                      ? "border-[#1F6F5F] bg-[#1F6F5F] text-white"
                      : "border-stone-200 bg-white text-stone-400"
                  }`}
                >
                  {isCompleted && !isCurrent ? (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </div>

                <span
                  className={`mt-2 text-[11px] font-medium transition-colors ${
                    isCurrent
                      ? "font-semibold text-[#1F6F5F]"
                      : isCompleted
                      ? "text-stone-700"
                      : "text-stone-400"
                  }`}
                >
                  {stage.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* FOOTER METADATA */}
      <div className="mt-6 flex items-center justify-between border-t border-stone-100/80 pt-4 text-xs font-medium text-stone-400">
        <div className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-stone-400" />
          <span>Créé le : {formatDate(applied_at)}</span>
        </div>
      </div>
    </article>
  );
}