"use client";

import { useState } from "react";

export default function ProfilePage() {
  const [name, setName] = useState("Safaa Lakrad");
  const [email, setEmail] = useState("safaa@example.com");
  const [jobTitle, setJobTitle] = useState("AI & Data Engineer");
  const [location, setLocation] = useState("Paris, France");
  const [saved, setSaved] = useState(false);

  function saveProfile(event: React.FormEvent) {
    event.preventDefault();
    setSaved(true);

    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Mon profil</h1>
          <p className="mt-2 text-slate-500">
            Gérez les informations utilisées par votre espace carrière.
          </p>
        </div>

        <form
          onSubmit={saveProfile}
          className="rounded-2xl border bg-white p-6 shadow-sm"
        >
          <div className="mb-8 flex items-center gap-5">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-900 text-2xl font-bold text-white">
              SL
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900">{name}</h2>
              <p className="text-slate-500">{jobTitle}</p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm font-medium text-slate-700">
                Nom complet
              </span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium text-slate-700">
                Email
              </span>
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                type="email"
                className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium text-slate-700">
                Poste recherché
              </span>
              <input
                value={jobTitle}
                onChange={(event) => setJobTitle(event.target.value)}
                className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium text-slate-700">
                Localisation
              </span>
              <input
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
              />
            </label>
          </div>

          <div className="mt-6 flex items-center justify-end gap-4">
            {saved && (
              <span className="text-sm font-medium text-green-600">
                Profil enregistré.
              </span>
            )}

            <button
              type="submit"
              className="rounded-xl bg-slate-900 px-6 py-3 font-medium text-white hover:bg-slate-800"
            >
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}