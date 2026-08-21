"use client";

import {
  Briefcase,
  FileText,
  LayoutDashboard,
  Search,
  Settings,
  User,
  BrainCircuit,
} from "lucide-react";

import SidebarLogo from "./SidebarLogo";
import SidebarSection from "./SidebarSection";
import NavItem from "./NavItem";

export default function AppSidebar() {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-stone-200 bg-white lg:flex lg:min-h-screen lg:flex-col">
      <div className="p-6">
        <SidebarLogo />
      </div>

      <div className="flex-1 space-y-8 px-4 pb-6">
        <SidebarSection title="Workspace">
          <NavItem
            href="/dashboard"
            label="Dashboard"
            icon={LayoutDashboard}
          />

          <NavItem
            href="/cv"
            label="Mes CV"
            icon={FileText}
          />

          <NavItem
            href="/analysis"
            label="Analyse IA"
            icon={BrainCircuit}
          />
        </SidebarSection>

        <SidebarSection title="Emploi">
          <NavItem
            href="/jobs"
            label="Offres"
            icon={Search}
          />

          <NavItem
            href="/applications"
            label="Candidatures"
            icon={Briefcase}
          />
        </SidebarSection>

        <SidebarSection title="Compte">
          <NavItem
            href="/profile"
            label="Profil"
            icon={User}
          />

          <NavItem
            href="/settings"
            label="Paramètres"
            icon={Settings}
          />
        </SidebarSection>
      </div>
    </aside>
  );
}