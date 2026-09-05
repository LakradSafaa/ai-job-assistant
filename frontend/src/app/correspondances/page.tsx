"use client";

import { useMemo, useState } from "react";
import NotificationCenter, {
  AppNotification,
} from "@/components/NotificationCenter";
import WorkflowModal, { MatchItem } from "@/components/WorkflowModal";
import {
  Sparkles,
  FileText,
  Mail,
  ArrowRight,
  TrendingUp,
  Bot,
  Building2,
  MapPin,
  Search,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";

export default function CorrespondancesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<
    "all" | "high_match" | "in_progress"
  >("all");
  const [selectedMatch, setSelectedMatch] = useState<MatchItem | null>(null);
  const [activeWorkflowModal, setActiveWorkflowModal] = useState<
    "cv" | "cover_letter" | "interview" | null
  >(null);

  const [notifications, setNotifications] = useState<AppNotification[]>([
    {
      id: "1",
      title: "Nouvelle correspondance à 95%",
      message:
        "Un poste de Responsable Sécurité Environnement correspond parfaitement à votre profil.",
      time: "Il y a 10 min",
      type: "match",
      read: false,
    },
    {
      id: "2",
      title: "Rappel d'entretien",
      message:
        "Votre simulation d'entretien pour le poste Ingénieur Énergies est prête.",
      time: "Il y a 2h",
      type: "interview",
      read: false,
    },
    {
      id: "3",
      title: "CV optimisé",
      message:
        "La version sur-mesure de votre CV pour Schneider Electric a été générée.",
      time: "Hier",
      type: "status",
      read: true,
    },
  ]);

  const [matches] = useState<MatchItem[]>([
    {
      id: "m1",
      job_id: "j1",
      job_title: "Responsable Sécurité Environnement F/H",
      company: "Fed Ingénierie",
      location: "Paris 01 - 75",
      match_score: 95,
      status: "new",
      created_at: "2026-08-31",
      matched_skills: ["Gestion HSE", "Audit ISO 14001", "Analyse de risques"],
      missing_skills: ["Anglais courant"],
    },
    {
      id: "m2",
      job_id: "j2",
      job_title: "Ingénieur Énergies Renouvelables F/H",
      company: "GreenTech Energy",
      location: "Paris 04 - 75",
      match_score: 88,
      status: "cv_generated",
      created_at: "2026-08-30",
      matched_skills: ["Gestion de projet", "Bilan Carbone", "Python"],
      missing_skills: ["Solaire Thermique"],
    },
    {
      id: "m3",
      job_id: "j3",
      job_title: "Consultant Data & IA - Agroalimentaire",
      company: "AgroData Solutions",
      location: "Île-de-France",
      match_score: 82,
      status: "interview_scheduled",
      created_at: "2026-08-28",
      matched_skills: ["Python", "Machine Learning", "SQL", "n8n"],
      missing_skills: ["PowerBI"],
    },
  ]);

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const filteredMatches = useMemo(() => {
    return matches.filter((item) => {
      const matchSearch =
        item.job_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.company.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchSearch) return false;

      if (activeTab === "high_match") return item.match_score >= 85;
      if (activeTab === "in_progress") return item.status !== "new";
      return true;
    });
  }, [matches, searchTerm, activeTab]);

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* EN-TÊTE PRINCIPAL */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded-md bg-[#005c45]/10 px-2.5 py-1 text-xs font-semibold text-[#005c45]">
                IA Copilote Carrière
              </span>
            </div>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Mes Correspondances & Workflow
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Générez vos CV sur-mesure, vos lettres de motivation et préparez vos
              entretiens pour chaque offre.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-3 px-4 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-[#005c45]">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Score Moyen</p>
                <p className="text-lg font-bold text-slate-900">88%</p>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION NOTIFICATIONS */}
        <NotificationCenter
          notifications={notifications}
          onMarkAllAsRead={markAllNotificationsAsRead}
        />

        {/* SECTION FILTRES ET RECHERCHE */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 rounded-xl bg-slate-200/50 p-1">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
                activeTab === "all"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Toutes ({matches.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("high_match")}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
                activeTab === "high_match"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Top Match (+85%)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("in_progress")}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
                activeTab === "in_progress"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              En cours de traitement
            </button>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher un poste..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-4 text-xs font-medium text-slate-800 shadow-sm outline-none transition focus:border-[#005c45] focus:ring-1 focus:ring-[#005c45]"
            />
          </div>
        </div>

        {/* LISTE DES CORRESPONDANCES & WORKFLOW */}
        <div className="space-y-4">
          {filteredMatches.map((item) => (
            <div
              key={item.id}
              className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-200 hover:shadow-md"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-800">
                      <Sparkles className="h-3 w-3" />
                      {item.match_score}% Match
                    </span>
                    <span className="text-xs text-slate-400">
                      Ajouté le {item.created_at}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 transition group-hover:text-[#005c45]">
                    {item.job_title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <Building2 className="h-3.5 w-3.5 text-slate-400" />
                      {item.company}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" />
                      {item.location}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {item.matched_skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-800"
                      >
                        ✓ {skill}
                      </span>
                    ))}
                    {item.missing_skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500"
                      >
                        + {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* WORKFLOW ACTIONS */}
                <div className="flex flex-col items-stretch gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:items-center lg:border-t-0 lg:pt-0">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedMatch(item);
                      setActiveWorkflowModal("cv");
                    }}
                    className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs font-semibold text-slate-700 transition hover:border-[#005c45]/30 hover:bg-[#005c45]/5 hover:text-[#005c45] sm:justify-start"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-[#005c45]" />
                      <span>CV Sur-Mesure</span>
                    </div>
                    {item.status !== "new" ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-slate-400" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedMatch(item);
                      setActiveWorkflowModal("cover_letter");
                    }}
                    className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs font-semibold text-slate-700 transition hover:border-[#005c45]/30 hover:bg-[#005c45]/5 hover:text-[#005c45] sm:justify-start"
                  >
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-[#005c45]" />
                      <span>Lettre Motivation</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedMatch(item);
                      setActiveWorkflowModal("interview");
                    }}
                    className="flex items-center justify-between gap-2 rounded-xl bg-[#005c45] px-3.5 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#004735] sm:justify-start"
                  >
                    <div className="flex items-center gap-2">
                      <Bot className="h-4 w-4" />
                      <span>Prep. Entretien</span>
                    </div>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* WORKFLOW MODAL */}
        {activeWorkflowModal && selectedMatch && (
          <WorkflowModal
            type={activeWorkflowModal}
            match={selectedMatch}
            onClose={() => setActiveWorkflowModal(null)}
            onConfirm={() => {
              alert(`Génération lancée pour ${selectedMatch.job_title}`);
              setActiveWorkflowModal(null);
            }}
          />
        )}
      </div>
    </div>
  );
}