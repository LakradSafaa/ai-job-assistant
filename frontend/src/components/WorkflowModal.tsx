"use client";

import { Sparkles, Bot, X } from "lucide-react";

export type MatchItem = {
  id: string;
  job_id: string;
  job_title: string;
  company: string;
  location: string;
  match_score: number;
  status: "new" | "cv_generated" | "applied" | "interview_scheduled";
  created_at: string;
  matched_skills: string[];
  missing_skills: string[];
};

interface WorkflowModalProps {
  type: "cv" | "cover_letter" | "interview";
  match: MatchItem;
  onClose: () => void;
  onConfirm: () => void;
}

export default function WorkflowModal({
  type,
  match,
  onClose,
  onConfirm,
}: WorkflowModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 p-5">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#005c45]/10 text-[#005c45]">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Générateur IA - {type === "cv" && "CV Adapté"}
                {type === "cover_letter" && "Lettre de Motivation"}
                {type === "interview" && "Questions d'Entretien"}
              </h3>
              <p className="text-xs text-slate-500">{match.job_title}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="space-y-4 p-6">
          <div className="space-y-2 rounded-xl bg-slate-50 p-4 text-xs text-slate-600">
            <p className="font-semibold text-slate-900">
              L'assistant IA va adapter votre profil spécifiquement pour{" "}
              {match.company}.
            </p>
            <ul className="list-disc space-y-1 pl-4">
              <li>Optimisation des mots-clés ATS</li>
              <li>
                Mise en valeur des compétences requises (
                {match.matched_skills.join(", ")})
              </li>
              <li>Alignement sur la description du poste</li>
            </ul>
          </div>

          <div className="space-y-3 rounded-xl border border-dashed border-slate-300 p-6 text-center">
            <Bot className="mx-auto h-8 w-8 animate-bounce text-[#005c45]" />
            <p className="text-xs font-semibold text-slate-700">
              Prêt à générer le document sur-mesure ?
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 rounded-b-2xl border-t border-slate-100 bg-slate-50/50 p-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/50"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex items-center gap-2 rounded-xl bg-[#005c45] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#004735]"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Lancer la génération
          </button>
        </div>
      </div>
    </div>
  );
}