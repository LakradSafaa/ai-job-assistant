"use client";

import { useState } from "react";

export default function SettingsPage() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [jobAlerts, setJobAlerts] = useState(true);
  const [aiRecommendations, setAiRecommendations] = useState(true);
  const [saved, setSaved] = useState(false);

  function saveSettings() {
    setSaved(true);

    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Paramètres</h1>
          <p className="mt-2 text-slate-500">
            Configurez votre expérience AI Job Assistant.
          </p>
        </div>

        <div className="space-y-6">
          <section className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">
              Notifications
            </h2>

            <div className="mt-5 divide-y">
              <Setting
                title="Notifications email"
                description="Recevoir les notifications importantes par email."
                enabled={emailNotifications}
                onChange={setEmailNotifications}
              />

              <Setting
                title="Alertes emploi"
                description="Recevoir les nouvelles offres correspondant à votre profil."
                enabled={jobAlerts}
                onChange={setJobAlerts}
              />

              <Setting
                title="Recommandations IA"
                description="Recevoir des recommandations personnalisées."
                enabled={aiRecommendations}
                onChange={setAiRecommendations}
              />
            </div>
          </section>

          <section className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">
              Préférences
            </h2>

            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-sm font-medium text-slate-700">
                  Langue
                </span>
                <select className="rounded-xl border border-slate-300 px-4 py-3">
                  <option>Français</option>
                  <option>English</option>
                  <option>العربية</option>
                </select>
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-medium text-slate-700">
                  Type de contrat préféré
                </span>
                <select className="rounded-xl border border-slate-300 px-4 py-3">
                  <option>CDI</option>
                  <option>CDD</option>
                  <option>Alternance</option>
                  <option>Stage</option>
                  <option>Freelance</option>
                </select>
              </label>
            </div>
          </section>

          <div className="flex justify-end gap-4">
            {saved && (
              <span className="self-center text-sm font-medium text-green-600">
                Paramètres enregistrés.
              </span>
            )}

            <button
              onClick={saveSettings}
              className="rounded-xl bg-slate-900 px-6 py-3 font-medium text-white hover:bg-slate-800"
            >
              Enregistrer les paramètres
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

function Setting({
  title,
  description,
  enabled,
  onChange,
}: {
  title: string;
  description: string;
  enabled: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-5 py-5">
      <div>
        <h3 className="font-medium text-slate-900">{title}</h3>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>

      <button
        type="button"
        onClick={() => onChange(!enabled)}
        className={`relative h-7 w-12 rounded-full transition ${
          enabled ? "bg-slate-900" : "bg-slate-300"
        }`}
        aria-label={title}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
            enabled ? "left-6" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}