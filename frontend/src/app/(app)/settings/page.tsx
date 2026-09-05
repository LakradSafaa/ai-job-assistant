"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Bell, User, Save, Loader2, CheckCircle } from "lucide-react";

export default function SettingsPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    emailNotifications: true,
    jobAlerts: true,
  });

  useEffect(() => {
    async function loadSettings() {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name, email")
            .eq("id", user.id)
            .maybeSingle();

          setFormData((prev) => ({
            ...prev,
            fullName: profile?.full_name || user.user_metadata?.full_name || "",
            email: user.email || "",
          }));
        }
      } catch (err) {
        console.error("Erreur de chargement des paramètres :", err);
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { error } = await supabase
          .from("profiles")
          .update({
            full_name: formData.fullName,
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.id);

        if (error) throw error;

        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Erreur de sauvegarde :", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#1F6F5F]" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Paramètres du compte</h1>
        <p className="text-sm text-stone-500">
          Gérez vos préférences de profil et vos notifications.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="rounded-2xl border border-stone-200/90 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3 border-b border-stone-100 pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1F6F5F]/10 text-[#1F6F5F]">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900">Profil utilisateur</h2>
              <p className="text-xs text-stone-500">Vos informations publiques de candidat</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-stone-700">Nom complet</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="mt-1.5 w-full rounded-xl border border-stone-200 bg-stone-50/50 px-3.5 py-2 text-sm text-stone-900 transition focus:border-[#1F6F5F] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1F6F5F]/20"
                placeholder="Votre nom"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700">Adresse email</label>
              <input
                type="email"
                disabled
                value={formData.email}
                className="mt-1.5 w-full cursor-not-allowed rounded-xl border border-stone-200 bg-stone-100 px-3.5 py-2 text-sm text-stone-500"
              />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-stone-200/90 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3 border-b border-stone-100 pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1F6F5F]/10 text-[#1F6F5F]">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900">Notifications</h2>
              <p className="text-xs text-stone-500">Choisissez comment vous souhaitez être informé</p>
            </div>
          </div>

          <div className="space-y-4">
            <label className="flex items-center justify-between">
              <span className="text-sm font-medium text-stone-700">Notifications par email</span>
              <input
                type="checkbox"
                checked={formData.emailNotifications}
                onChange={(e) => setFormData({ ...formData, emailNotifications: e.target.checked })}
                className="h-4 w-4 rounded border-stone-300 text-[#1F6F5F] focus:ring-[#1F6F5F]"
              />
            </label>

            <label className="flex items-center justify-between border-t border-stone-100 pt-3">
              <span className="text-sm font-medium text-stone-700">Alertes de nouvelles offres</span>
              <input
                type="checkbox"
                checked={formData.jobAlerts}
                onChange={(e) => setFormData({ ...formData, jobAlerts: e.target.checked })}
                className="h-4 w-4 rounded border-stone-300 text-[#1F6F5F] focus:ring-[#1F6F5F]"
              />
            </label>
          </div>
        </section>

        <div className="flex items-center justify-between pt-2">
          {savedSuccess ? (
            <div className="flex items-center gap-2 text-sm font-semibold text-emerald-600">
              <CheckCircle className="h-4 w-4" />
              <span>Paramètres enregistrés avec succès !</span>
            </div>
          ) : <div />}

          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-[#1F6F5F] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#19594c] active:scale-95 disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span>Enregistrer</span>
          </button>
        </div>
      </form>
    </div>
  );
}