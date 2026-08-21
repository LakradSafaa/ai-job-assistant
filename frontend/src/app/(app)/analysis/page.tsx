"use client";

import { useState } from "react";

const recommendations = [
  "Ajoutez davantage de résultats chiffrés dans vos expériences.",
  "Mettez en avant vos projets liés à l'intelligence artificielle.",
  "Ajoutez les technologies utilisées sur chaque projet.",
  "Adaptez le titre du CV au poste recherché.",
];

export default function AnalysisPage() {
  const [score, setScore] = useState(78);
  const [analyzed, setAnalyzed] = useState(true);

  function analyze() {
    setAnalyzed(false);

    setTimeout(() => {
      setScore(84);
      setAnalyzed(true);
    }, 700);
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Analyse IA</h1>
            <p className="mt-2 text-slate-500">
              Analysez votre CV et obtenez des recommandations personnalisées.
            </p>
          </div>

          <button
            onClick={analyze}
            className="rounded-xl bg-slate-900 px-5 py-3 font-medium text-white hover:bg-slate-800"
          >
            {analyzed ? "Relancer l'analyse" : "Analyse en cours..."}
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Score global</p>

            <div className="mt-6 flex items-center justify-center">
              <div className="flex h-40 w-40 items-center justify-center rounded-full border-[14px] border-slate-900">
                <div className="text-center">
                  <p className="text-4xl font-bold text-slate-900">{score}</p>
                  <p className="text-sm text-slate-500">/100</p>
                </div>
              </div>
            </div>

            <p className="mt-6 text-center font-medium text-green-600">
              Bon profil
            </p>
          </section>

          <section className="rounded-2xl border bg-white p-6 shadow-sm lg:col-span-2">
            <h2 className="text-xl font-semibold text-slate-900">
              Évaluation détaillée
            </h2>

            <div className="mt-6 space-y-5">
              {[
                ["Structure du CV", 90],
                ["Compétences", 82],
                ["Expérience", 75],
                ["Mots-clés ATS", 70],
                ["Impact des réalisations", 73],
              ].map(([label, value]) => (
                <div key={label as string}>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="font-medium text-slate-700">
                      {label}
                    </span>
                    <span className="text-slate-500">{value}/100</span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-slate-900"
                      style={{ width: `${value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className="mt-6 rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">
            Recommandations IA
          </h2>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {recommendations.map((recommendation, index) => (
              <div
                key={recommendation}
                className="rounded-xl border border-slate-200 bg-slate-50 p-5"
              >
                <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
                  {index + 1}
                </div>

                <p className="text-slate-700">{recommendation}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}