"use client";

import {
  Brain,
  Briefcase,
  FileCheck,
  Target,
  UserCheck,
  Clock3,
  Wifi,
  TrendingUp,
  Wallet,
} from "lucide-react";

import KpiCard from "./KpiCard";

interface DashboardStats {
  profileCompletion: string;
  totalJobs: string;
  totalApplications: string;
  averageMatch: string;
  bestMatch: string;
  recommendedJobs: string;
  pendingApplications: string;
  remoteJobs: string;
  averageSalary: string;
}

interface KpiGridProps {
  stats: DashboardStats;
  loading?: boolean;
}

export default function KpiGrid({
  stats,
  loading = false,
}: KpiGridProps) {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
      {/* =====================================================
          1. PROFIL
      ===================================================== */}

      <KpiCard
        title="Profil complété"
        value={stats.profileCompletion}
        subtitle="État de votre profil"
        color="#1F6F5F"
        icon={<UserCheck size={24} />}
        loading={loading}
      />

      {/* =====================================================
          2. OFFRES
      ===================================================== */}

      <KpiCard
        title="Offres disponibles"
        value={stats.totalJobs}
        subtitle="Offres actuellement disponibles"
        color="#4A7C59"
        icon={<Briefcase size={24} />}
        loading={loading}
      />

      {/* =====================================================
          3. CANDIDATURES
      ===================================================== */}

      <KpiCard
        title="Candidatures"
        value={stats.totalApplications}
        subtitle="Candidatures envoyées"
        color="#8B6A4F"
        icon={<FileCheck size={24} />}
        loading={loading}
      />

      {/* =====================================================
          4. MATCHING MOYEN
      ===================================================== */}

      <KpiCard
        title="Matching moyen"
        value={stats.averageMatch}
        subtitle="Compatibilité avec les offres"
        color="#5B8DEF"
        icon={<Brain size={24} />}
        loading={loading}
      />

      {/* =====================================================
          5. MEILLEUR MATCH
      ===================================================== */}

      <KpiCard
        title="Meilleur matching"
        value={stats.bestMatch}
        subtitle="Votre meilleure compatibilité"
        color="#7C5CFC"
        icon={<Target size={24} />}
        loading={loading}
      />

      {/* =====================================================
          6. RECOMMANDATIONS
      ===================================================== */}

      <KpiCard
        title="Offres recommandées"
        value={stats.recommendedJobs}
        subtitle="Matching supérieur à 70%"
        color="#2F855A"
        icon={<TrendingUp size={24} />}
        loading={loading}
      />

      {/* =====================================================
          7. CANDIDATURES EN ATTENTE
      ===================================================== */}

      <KpiCard
        title="En attente"
        value={stats.pendingApplications}
        subtitle="Candidatures en cours"
        color="#D97706"
        icon={<Clock3 size={24} />}
        loading={loading}
      />

      {/* =====================================================
          8. REMOTE
      ===================================================== */}

      <KpiCard
        title="Offres Remote"
        value={stats.remoteJobs}
        subtitle="Opportunités à distance"
        color="#2563EB"
        icon={<Wifi size={24} />}
        loading={loading}
      />

      {/* =====================================================
          9. SALAIRE MOYEN
      ===================================================== */}

      <KpiCard
        title="Salaire moyen"
        value={stats.averageSalary}
        subtitle="Selon les offres disponibles"
        color="#9A6B3F"
        icon={<Wallet size={24} />}
        loading={loading}
      />
    </div>
  );
}