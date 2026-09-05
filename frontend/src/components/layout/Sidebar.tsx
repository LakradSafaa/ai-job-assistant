"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  User, 
  Briefcase, 
  Sparkles, 
  CheckCircle2, 
  Bookmark, 
  FileText, 
  Calendar, 
  LogOut 
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);

  // Résout l'erreur d'hydratation (mismatch SSR/Client)
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleLogout = async () => {
    // Insérez ici votre logique de déconnexion (ex: Supabase, NextAuth)
    window.location.href = "/login";
  };

  if (!isMounted) {
    return null;
  }

  const menuItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Mon profil", href: "/profile", icon: User },
    { label: "Offres d'emploi", href: "/jobs", icon: Briefcase },
    { label: "Mes correspondances", href: "/matches", icon: Sparkles },
    { label: "Candidatures", href: "/applications", icon: CheckCircle2 },
    { label: "Offres sauvegardées", href: "/saved", icon: Bookmark },
    { label: "Mon CV", href: "/resume", icon: FileText },
    { label: "Entretiens", href: "/interviews", icon: Calendar },
  ];

  return (
    <aside className="fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 flex flex-col justify-between h-screen">
      <div>
        {/* Logo & Header */}
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
            AI
          </div>
          <div>
            <h1 className="font-bold text-slate-900 text-sm leading-none">AI Job Assistant</h1>
            <p className="text-xs text-slate-400 mt-1">Copilote carrière</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            MON ESPACE
          </p>

          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Section COMPTE avec bouton de déconnexion */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <p className="px-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
          COMPTE
        </p>

        <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-semibold text-xs shrink-0">
              N
            </div>
            <div className="text-xs truncate">
              <p className="font-semibold text-slate-800 truncate">Mon espace</p>
              <p className="text-slate-400 truncate text-[11px]">Profil candidat</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            title="Se déconnecter"
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}