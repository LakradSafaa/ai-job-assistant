"use client";

import {
  LayoutDashboard,
  User,
  Search,
  Target,
  BriefcaseBusiness,
  Bookmark,
  FileText,
  CalendarDays,
  GitBranch,
  Send,
  Bell,
  BrainCircuit,
  Settings,
  ChevronRight,
  Sparkles,
} from "lucide-react";

import SidebarSection from "./SidebarSection";
import NavItem from "./NavItem";
import SidebarLogo from "./SidebarLogo";

export default function AppSidebar() {
  return (
    <aside className="hidden h-screen w-[260px] shrink-0 flex-col border-r border-slate-200/80 bg-white lg:flex">
      
      {/* ================================================= */}
      {/* LOGO */}
      {/* ================================================= */}

      <div className="border-b border-slate-100 px-5 py-5">
        <SidebarLogo />
      </div>

      {/* ================================================= */}
      {/* NAVIGATION */}
      {/* ================================================= */}

      <div className="flex-1 overflow-y-auto px-3 py-6">

        <SidebarSection title="MON ESPACE">

          <NavItem
            href="/dashboard"
            label="Dashboard"
            icon={LayoutDashboard}
          />

          <NavItem
            href="/profile"
            label="Mon profil"
            icon={User}
          />

          <NavItem
            href="/jobs"
            label="Offres d'emploi"
            icon={Search}
          />

          <NavItem
            href="/matches"
            label="Mes correspondances"
            icon={Target}
          />

          <NavItem
            href="/applications"
            label="Candidatures"
            icon={BriefcaseBusiness}
          />

          <NavItem
            href="/saved"
            label="Offres sauvegardées"
            icon={Bookmark}
          />

          <NavItem
            href="/resume"
            label="Mon CV"
            icon={FileText}
          />

          <NavItem
            href="/interviews"
            label="Entretiens"
            icon={CalendarDays}
          />

        </SidebarSection>

        <SidebarSection title="SUIVI">

          <NavItem
            href="/tracking"
            label="Suivi des candidatures"
            icon={GitBranch}
          />

          <NavItem
            href="/submissions"
            label="Soumission automatique"
            icon={Send}
          />

          <NavItem
            href="/notifications"
            label="Notifications"
            icon={Bell}
          />

        </SidebarSection>

        <SidebarSection title="INTELLIGENCE">

          <NavItem
            href="/analysis"
            label="Analyse IA"
            icon={BrainCircuit}
          />

        </SidebarSection>

        <SidebarSection title="COMPTE">

          <NavItem
            href="/settings"
            label="Paramètres"
            icon={Settings}
          />

        </SidebarSection>

      </div>

      {/* ================================================= */}
      {/* AI CARD */}
      {/* ================================================= */}

      <div className="p-3">

        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-600 p-4 text-white shadow-lg shadow-emerald-600/15">

          <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/10 blur-2xl" />

          <div className="relative">

            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
              <Sparkles className="h-4 w-4 text-white" />
            </div>

            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-100">
              AI Career Copilot
            </p>

            <h3 className="mt-1 text-sm font-bold">
              Optimisez votre recherche
            </h3>

            <p className="mt-1.5 text-[11px] leading-5 text-emerald-50/80">
              Analysez votre profil et découvrez les opportunités les plus
              pertinentes.
            </p>

            <a
              href="/analysis"
              className="mt-3 flex items-center justify-between rounded-lg bg-white/10 px-3 py-2 text-[11px] font-semibold transition hover:bg-white/20"
            >
              <span>Analyser mon profil</span>

              <ChevronRight className="h-3.5 w-3.5" />
            </a>

          </div>
        </div>

      </div>

    </aside>
  );
}