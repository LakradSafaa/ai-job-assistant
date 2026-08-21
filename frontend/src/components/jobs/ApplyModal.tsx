"use client";

import { useState } from "react";

interface ApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobMatchId: string;
  jobTitle: string;
  companyName?: string;
  onSuccess?: () => void;
}

export function ApplyModal({
  isOpen,
  onClose,
  jobMatchId,
  jobTitle,
  companyName,
  onSuccess,
}: ApplyModalProps) {
  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  if (!isOpen) {
    return null;
  }

  async function handleConfirmApply() {
    try {
      setLoading(true);
      setError(null);

      console.log(
        "Préparation candidature :",
        {
          job_match_id: jobMatchId,
        }
      );

      const response = await fetch(
        "/api/applications/prepare",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            job_match_id: jobMatchId,
          }),
        }
      );

      let data: {
        success?: boolean;
        message?: string;
        error?: string;
      } = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok) {
        throw new Error(
          data.error ||
            `Erreur serveur (${response.status})`
        );
      }

      if (data.success === false) {
        throw new Error(
          data.error ||
            "La préparation n'a pas pu être lancée."
        );
      }

      console.log(
        "Préparation lancée avec succès :",
        data
      );

      onSuccess?.();

      onClose();
    } catch (err: unknown) {
      console.error(
        "Erreur préparation candidature :",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Une erreur est survenue."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget &&
          !loading
        ) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 text-white shadow-2xl">

        {/* TITLE */}

        <h2 className="text-xl font-bold">
          Préparer la candidature
        </h2>

        {/* DESCRIPTION */}

        <p className="mt-2 text-sm leading-6 text-slate-300">
          Vous allez lancer la préparation
          de votre candidature pour :
        </p>

        {/* JOB */}

        <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950 p-4">

          <p className="font-semibold text-blue-400">
            {jobTitle}
          </p>

          {companyName && (
            <p className="mt-1 text-sm text-slate-400">
              chez {companyName}
            </p>
          )}

        </div>

        {/* ERROR */}

        {error && (
          <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 p-3">
            <p className="text-sm text-red-400">
              {error}
            </p>
          </div>
        )}

        {/* ACTIONS */}

        <div className="mt-6 flex justify-end gap-3">

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Annuler
          </button>

          <button
            type="button"
            onClick={
              handleConfirmApply
            }
            disabled={loading}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Lancement n8n..."
              : "Confirmer et Préparer"}
          </button>

        </div>

      </div>
    </div>
  );
}

export default ApplyModal;