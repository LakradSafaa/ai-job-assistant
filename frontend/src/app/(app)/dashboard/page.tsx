"use client";

import Link from "next/link";

import {
  ArrowRight,
  BriefcaseBusiness,
  CalendarDays,
  FileText,
  Sparkles,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="page-container">

      {/* HEADER */}
      <section className="mb-8 animate-fade-up">

        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">

          <div>

            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3 py-1.5">

              <span className="relative flex h-2 w-2">
                <span className="absolute h-full w-full animate-ping rounded-full bg-green-400 opacity-60" />
                <span className="relative h-2 w-2 rounded-full bg-green-600" />
              </span>

              <span className="text-[10px] font-extrabold uppercase tracking-[0.13em] text-green-700">
                Votre espace carrière
              </span>

            </div>

            <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 md:text-4xl">
              Bonjour 👋
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Retrouvez vos opportunités, candidatures et recommandations
              intelligentes au même endroit.
            </p>

          </div>

          <Link
            href="/analysis"
            className="green-button"
          >
            <Sparkles className="h-4 w-4" />
            Analyser mon profil
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>

        </div>

      </section>


      {/* KPI */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <Metric
          href="/matches"
          icon={Target}
          label="Correspondances"
          value="—"
          description="Offres compatibles"
        />

        <Metric
          href="/applications"
          icon={BriefcaseBusiness}
          label="Candidatures"
          value="—"
          description="En cours"
        />

        <Metric
          href="/resume"
          icon={FileText}
          label="Documents"
          value="—"
          description="CV disponibles"
        />

        <Metric
          href="/interviews"
          icon={CalendarDays}
          label="Entretiens"
          value="—"
          description="À venir"
        />

      </section>


      {/* MAIN */}
      <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_380px]">

        {/* MATCHING */}
        <div className="premium-card p-6 animate-fade-up">

          <div className="mb-6 flex items-center justify-between">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50">
                <Target className="h-5 w-5 text-green-600" />
              </div>

              <div>

                <h2 className="text-sm font-extrabold text-slate-900">
                  Mes correspondances
                </h2>

                <p className="mt-0.5 text-xs text-slate-400">
                  Les offres correspondant à votre profil
                </p>

              </div>

            </div>

            <Link
              href="/matches"
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold text-green-600 transition hover:bg-green-50"
            >
              Voir tout
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>

          </div>


          <div className="relative overflow-hidden rounded-2xl border border-green-100 bg-gradient-to-br from-green-50 via-white to-green-50 p-12 text-center">

            <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-green-300/20 blur-3xl" />

            <div className="relative">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-lg shadow-green-200/40">

                <Target className="h-7 w-7 text-green-500" />

              </div>

              <h3 className="mt-5 text-sm font-extrabold text-slate-800">
                Votre moteur de matching est prêt
              </h3>

              <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-slate-500">
                L'IA compare vos compétences avec les offres disponibles
                pour identifier les opportunités les plus pertinentes.
              </p>

              <Link
                href="/matches"
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-green-700 shadow-sm ring-1 ring-green-100 transition hover:-translate-y-0.5 hover:shadow-md"
              >
                Voir mes correspondances
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>

            </div>

          </div>

        </div>


        {/* AI COPILOT */}
        <div className="relative overflow-hidden rounded-[22px] bg-gradient-to-br from-[#2e1065] via-[#4c1d95] to-[#4338ca] p-7 text-white shadow-xl shadow-green-900/15 animate-fade-up">

          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-green-400/20 blur-3xl" />

          <div className="absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-green-400/20 blur-3xl" />

          <div className="relative">

            <div className="flex items-center justify-between">

              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/10">

                <Sparkles className="h-5 w-5 text-green-200" />

              </div>

              <span className="rounded-full border border-white/10 bg-white/10 px-2.5 py-1 text-[9px] font-bold tracking-wider text-green-100">
                AI POWERED
              </span>

            </div>

            <p className="mt-7 text-[10px] font-bold uppercase tracking-[0.18em] text-green-300">
              Career Copilot
            </p>

            <h2 className="mt-3 text-2xl font-extrabold leading-tight">
              Votre recherche d'emploi,
              <br />
              assistée par l'IA.
            </h2>

            <p className="mt-4 text-xs leading-6 text-green-100/70">
              Analyse de profil, matching intelligent, optimisation du CV
              et préparation aux entretiens.
            </p>

            <Link
              href="/analysis"
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-xs font-extrabold text-green-900 shadow-lg transition hover:-translate-y-0.5 hover:bg-green-50"
            >
              <Zap className="h-4 w-4" />
              Utiliser l'IA
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>

          </div>

        </div>

      </section>


      {/* QUICK ACTIONS */}
      <section className="mt-6 grid gap-4 md:grid-cols-3">

        <QuickAction
          href="/jobs"
          icon={TrendingUp}
          title="Explorer les offres"
          description="Découvrez les nouvelles opportunités."
        />

        <QuickAction
          href="/resume"
          icon={FileText}
          title="Optimiser mon CV"
          description="Améliorez votre CV avec l'IA."
        />

        <QuickAction
          href="/tracking"
          icon={BriefcaseBusiness}
          title="Suivre mes candidatures"
          description="Visualisez votre progression."
        />

      </section>

    </div>
  );
}


function Metric({
  href,
  icon: Icon,
  label,
  value,
  description,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  value: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="premium-card group p-5 animate-fade-up"
    >

      <div className="flex items-start justify-between">

        <div>

          <p className="text-[11px] font-bold text-slate-500">
            {label}
          </p>

          <p className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950">
            {value}
          </p>

          <p className="mt-1 text-[10px] text-slate-400">
            {description}
          </p>

        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 transition duration-300 group-hover:scale-110 group-hover:bg-green-100">

          <Icon className="h-5 w-5 text-green-600" />

        </div>

      </div>

    </Link>
  );
}


function QuickAction({
  href,
  icon: Icon,
  title,
  description,
}: {
  href: string;
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="premium-card group flex items-center gap-4 p-5"
    >

      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-50 transition duration-300 group-hover:scale-110 group-hover:bg-green-100">

        <Icon className="h-5 w-5 text-green-600" />

      </div>

      <div className="min-w-0">

        <h3 className="text-sm font-extrabold text-slate-800">
          {title}
        </h3>

        <p className="mt-1 text-[11px] leading-5 text-slate-500">
          {description}
        </p>

      </div>

      <ArrowRight className="ml-auto h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-1 group-hover:text-green-500" />

    </Link>
  );
}