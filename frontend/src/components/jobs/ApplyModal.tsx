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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) {
    return null;
  }

  async function handleConfirmApply() {
    try {
      setLoading(true);
      setError(null);

      console.log(
        "================================="
      );
      console.log(
        "APPLICATION PREPARE"
      );
      console.log(
        "job_match_id:",
        jobMatchId
      );
      console.log(
        "================================="
      );

      if (!jobMatchId) {
        throw new Error(
          "job_match_id manquant."
        );
      }

      const response = await fetch(
        "/api/applications/prepare",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            job_match_id: jobMatchId,
          }),
        }
      );

      const text =
        await response.text();

      console.log(
        "STATUS API:",
        response.status
      );

      console.log(
        "RAW RESPONSE:",
        text
      );

      let data: any = {};

      try {
        data = text
          ? JSON.parse(text)
          : {};
      } catch {
        data = {
          raw: text,
        };
      }

      console.log(
        "DATA API:",
        data
      );

      if (!response.ok) {
        throw new Error(
          data?.error ||
          data?.message ||
          `Erreur serveur (${response.status})`
        );
      }

      if (!data?.success) {
        throw new Error(
          data?.error ||
          data?.message ||
          "La candidature n'a pas été préparée."
        );
      }

      /**
       * IMPORTANT :
       * Si n8n ne renvoie pas application_id,
       * on affiche un avertissement.
       */

      if (!data.application_id) {
        console.warn(
          "⚠️ n8n n'a pas retourné application_id."
        );
      }

      onSuccess?.();

      onClose();

      alert(
        data.application_id
          ? "Candidature préparée avec succès."
          : "La préparation a été envoyée à n8n, mais n8n n'a pas retourné d'application_id."
      );

    } catch (err: unknown) {

      console.error(
        "Erreur candidature:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Erreur inconnue."
      );

    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="
        fixed inset-0
        z-50
        flex
        items-center
        justify-center
        bg-black/60
        p-4
        backdrop-blur-sm
      "
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

      <div
        className="
          w-full
          max-w-md
          rounded-2xl
          border border-slate-800
          bg-slate-900
          p-6
          text-white
          shadow-2xl
        "
      >

        <h2 className="text-xl font-bold">
          Préparer la candidature
        </h2>

        <p
          className="
            mt-2
            text-sm
            leading-6
            text-slate-300
          "
        >
          Vous allez lancer la préparation
          de votre candidature pour :
        </p>

        <div
          className="
            mt-4
            rounded-xl
            border border-slate-800
            bg-slate-950
            p-4
          "
        >

          <p
            className="
              font-semibold
              text-blue-400
            "
          >
            {jobTitle}
          </p>

          {companyName && (
            <p
              className="
                mt-1
                text-sm
                text-slate-400
              "
            >
              chez {companyName}
            </p>
          )}

          <p
            className="
              mt-2
              text-xs
              text-slate-600
            "
          >
            Match ID : {jobMatchId}
          </p>

        </div>

        <div
          className="
            mt-4
            rounded-lg
            border border-blue-500/10
            bg-blue-500/5
            p-3
          "
        >
          <p
            className="
              text-xs
              leading-5
              text-slate-400
            "
          >
            Votre candidature sera préparée
            automatiquement à partir de votre
            profil et du matching IA.
          </p>
        </div>

        {error && (

          <div
            className="
              mt-4
              rounded-lg
              border border-red-500/20
              bg-red-500/10
              p-3
            "
          >
            <p
              className="
                text-sm
                text-red-400
              "
            >
              {error}
            </p>
          </div>

        )}

        <div
          className="
            mt-6
            flex
            justify-end
            gap-3
          "
        >

          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="
              rounded-lg
              bg-slate-800
              px-4
              py-2
              text-sm
              font-medium
              text-slate-300
              transition
              hover:bg-slate-700
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            Annuler
          </button>

          <button
            type="button"
            onClick={handleConfirmApply}
            disabled={loading}
            className="
              rounded-lg
              bg-blue-600
              px-4
              py-2
              text-sm
              font-medium
              text-white
              transition
              hover:bg-blue-500
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            {loading
              ? "Lancement n8n..."
              : "Confirmer et préparer"}
          </button>

        </div>

      </div>

    </div>
  );
}

export default ApplyModal;