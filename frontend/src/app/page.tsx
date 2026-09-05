"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  FileCheck2,
  BrainCircuit,
  Target,
  ShieldCheck,
  Menu,
  X,
} from "lucide-react";

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          
          {/* LOGO */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-700 text-white shadow-md">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-slate-900">
                AI Job Assistant
              </span>
              <span className="block text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
                Copilote Carrière
              </span>
            </div>
          </div>

          {/* MENU DESKTOP */}
          <nav className="hidden items-center gap-8 text-sm font-semibold text-slate-600 md:flex">
            <a href="#fonctionnalites" className="transition hover:text-emerald-700">
              Fonctionnalités
            </a>
            <a href="#comment-ca-marche" className="transition hover:text-emerald-700">
              Comment ça marche
            </a>
            <a href="#impact" className="transition hover:text-emerald-700">
              Notre Impact
            </a>
          </nav>

          {/* BOUTONS DESKTOP */}
          <div className="hidden items-center gap-4 md:flex">
            <Link
              href="/login"
              className="text-sm font-semibold text-slate-700 transition hover:text-emerald-700"
            >
              Se connecter
            </Link>
            <Link
              href="/register"
              className="flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800"
            >
              <span>Commencer gratuitement</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* BOUTON BURGER MOBILE */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-700 md:hidden hover:bg-slate-100"
            aria-label="Ouvrir le menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>

        </div>

        {/* MENU MOBILE DÉROULANT */}
        {mobileMenuOpen && (
          <div className="border-b border-slate-200 bg-white px-6 pt-4 pb-6 md:hidden">
            <nav className="flex flex-col gap-4 text-base font-semibold text-slate-700">
              <a
                href="#fonctionnalites"
                onClick={() => setMobileMenuOpen(false)}
                className="transition hover:text-emerald-700"
              >
                Fonctionnalités
              </a>
              <a
                href="#comment-ca-marche"
                onClick={() => setMobileMenuOpen(false)}
                className="transition hover:text-emerald-700"
              >
                Comment ça marche
              </a>
              <a
                href="#impact"
                onClick={() => setMobileMenuOpen(false)}
                className="transition hover:text-emerald-700"
              >
                Notre Impact
              </a>
              <hr className="my-2 border-slate-200" />
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-slate-700 transition hover:text-emerald-700"
              >
                Se connecter
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800"
              >
                <span>Commencer gratuitement</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
            
            {/* Texte Gauche */}
            <div className="space-y-6 lg:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1.5 text-xs font-semibold text-emerald-800">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>Propulsez votre recherche d'emploi</span>
              </div>

              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl leading-[1.15]">
                Ne laissez plus les filtres ATS bloquer vos opportunités.
              </h1>

              <p className="max-w-2xl text-base text-slate-600 sm:text-lg leading-relaxed">
                Optimisez votre CV en temps réel, découvrez les offres correspondant exactement à vos compétences et préparez vos entretiens avec un copilote IA sur-mesure.
              </p>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center pt-2">
                <Link
                  href="/register"
                  className="flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-7 py-3.5 text-base font-bold text-white shadow-lg transition hover:bg-emerald-800"
                >
                  <span>Optimiser mon CV maintenant</span>
                  <ArrowRight className="h-5 w-5" />
                </Link>

                <a
                  href="#comment-ca-marche"
                  className="flex items-center justify-center rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-base font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                >
                  Découvrir le fonctionnement
                </a>
              </div>

              <div className="flex items-center gap-6 pt-4 text-xs font-medium text-slate-500">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Sans carte de crédit
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Analyse immédiate
                </span>
              </div>
            </div>

            {/* Visualisation Droite */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl border border-slate-800 bg-[#0b1120] p-6 text-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <span className="text-xs text-slate-400">Score de Match IA</span>
                    <h3 className="text-2xl font-bold text-emerald-400">92 / 100</h3>
                  </div>
                  <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/20">
                    Profil Optimisé
                  </span>
                </div>

                <div className="mt-6 space-y-4">
                  <div className="rounded-xl border border-slate-800 bg-[#030712] p-4">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span>Développeur Fullstack</span>
                      <span className="text-emerald-400">95% Match</span>
                    </div>
                    <div className="mt-2 h-1.5 w-full rounded-full bg-slate-800">
                      <div className="h-full rounded-full bg-emerald-500 w-[95%]" />
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-[#030712] p-4">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span>Ingénieur Cloud & Data</span>
                      <span className="text-emerald-400">88% Match</span>
                    </div>
                    <div className="mt-2 h-1.5 w-full rounded-full bg-slate-800">
                      <div className="h-full rounded-full bg-emerald-500 w-[88%]" />
                    </div>
                  </div>
                </div>

                <div className="mt-6 rounded-xl bg-slate-900 p-4 text-xs text-slate-300 border border-slate-800">
                  <p className="font-semibold text-white mb-1">💡 Conseil IA :</p>
                  "Ajoutez 2 projets clés liés à Next.js et Docker pour augmenter le score ATS de 15%."
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* STATISTIQUES */}
      <section className="border-y border-slate-200 bg-white py-10">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-2 gap-8 text-center md:grid-cols-4">
            <div>
              <p className="text-3xl font-extrabold text-emerald-700">+85%</p>
              <p className="mt-1 text-xs font-semibold text-slate-600">De taux de passage ATS</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-emerald-700">3x Plus</p>
              <p className="mt-1 text-xs font-semibold text-slate-600">D'invitations en entretien</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-emerald-700">&lt; 2 min</p>
              <p className="mt-1 text-xs font-semibold text-slate-600">Pour analyser un CV</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-emerald-700">100%</p>
              <p className="mt-1 text-xs font-semibold text-slate-600">Recommandations personnalisées</p>
            </div>
          </div>
        </div>
      </section>

      {/* FONCTIONNALITÉS */}
      <section id="fonctionnalites" className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Une suite complète pour réussir votre carrière
            </h2>
            <p className="text-sm text-slate-600">
              Des outils conçus pour maximiser vos chances à chaque étape du processus de recrutement.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition hover:shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                <FileCheck2 className="h-6 w-6" />
              </div>
              <h3 className="mt-6 text-lg font-bold text-slate-900">
                Analyse CV & Score ATS
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Identifiez les mots-clés manquants, corrigez les erreurs de formatage et adaptez votre CV aux critères des recruteurs.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition hover:shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                <Target className="h-6 w-6" />
              </div>
              <h3 className="mt-6 text-lg font-bold text-slate-900">
                Matching d'Offres Intelligent
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Accédez aux opportunités les plus pertinentes selon vos compétences réelles et découvrez votre pourcentage de compatibilité.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition hover:shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                <BrainCircuit className="h-6 w-6" />
              </div>
              <h3 className="mt-6 text-lg font-bold text-slate-900">
                Coach IA & Entretiens
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Simulez vos entretiens d'embauche et générez des lettres de motivation ciblées en quelques secondes.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}