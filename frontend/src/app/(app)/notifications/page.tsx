"use client";

import React from "react";
import { Bell, CheckCircle2 } from "lucide-react";

export default function NotificationsPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Notifications</h1>
        <p className="text-xs text-stone-500">
          Nouvelles correspondances, candidatures, entretiens et changements de statut.
        </p>
      </div>

      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-stone-200 bg-white p-12 text-center shadow-sm">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1F6F5F]/10 text-[#1F6F5F]">
          <Bell className="h-6 w-6" />
        </div>
        <h3 className="mt-4 text-base font-bold text-stone-800">Aucune notification</h3>
        <p className="mt-1 text-xs text-stone-500">Vous êtes à jour.</p>
      </div>
    </div>
  );
}