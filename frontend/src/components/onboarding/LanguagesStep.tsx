"use client";

import {
  useFieldArray,
  useFormContext,
} from "react-hook-form";

import type { OnboardingSchema } from "@/lib/validations";

const languageOptions = [
  "Français",
  "Anglais",
  "Arabe",
  "Espagnol",
  "Allemand",
  "Italien",
  "Portugais",
  "Néerlandais",
  "Chinois",
  "Japonais",
  "Coréen",
  "Russe",
  "Turc",
  "Hindi",
  "Amazigh",
  "Autre",
];

const levelOptions = [
  {
    value: "native",
    label: "Langue maternelle",
  },
  {
    value: "fluent",
    label: "Couramment",
  },
  {
    value: "advanced",
    label: "Avancé",
  },
  {
    value: "intermediate",
    label: "Intermédiaire",
  },
  {
    value: "beginner",
    label: "Débutant",
  },
];

export default function LanguagesStep() {
  const {
    register,
    control,
    formState: { errors },
  } =
    useFormContext<OnboardingSchema>();

  const { fields, append, remove } =
    useFieldArray({
      control,
      name: "languages",
    });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">
          Langues
        </h2>

        <p className="mt-2 text-gray-500">
          Ajoutez jusqu'à 3 langues et indiquez
          votre niveau.
        </p>
      </div>

      {fields.map((field, index) => {
        const languageError =
          errors.languages?.[index]
            ?.language;

        const levelError =
          errors.languages?.[index]?.level;

        return (
          <div
            key={field.id}
            className="rounded-xl border p-5"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Langue{" "}
                  <span className="text-red-500">
                    *
                  </span>
                </label>

                <select
                  {...register(
                    `languages.${index}.language`
                  )}
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                >
                  <option value="">
                    Sélectionnez une langue
                  </option>

                  {languageOptions.map(
                    (language) => (
                      <option
                        key={language}
                        value={language}
                      >
                        {language}
                      </option>
                    )
                  )}
                </select>

                {languageError && (
                  <p className="mt-1 text-sm text-red-500">
                    {languageError.message}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Niveau{" "}
                  <span className="text-red-500">
                    *
                  </span>
                </label>

                <select
                  {...register(
                    `languages.${index}.level`
                  )}
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                >
                  <option value="">
                    Sélectionnez votre niveau
                  </option>

                  {levelOptions.map(
                    (level) => (
                      <option
                        key={level.value}
                        value={level.value}
                      >
                        {level.label}
                      </option>
                    )
                  )}
                </select>

                {levelError && (
                  <p className="mt-1 text-sm text-red-500">
                    {levelError.message}
                  </p>
                )}
              </div>
            </div>

            {fields.length > 1 && (
              <button
                type="button"
                onClick={() =>
                  remove(index)
                }
                className="mt-4 text-sm font-medium text-red-500"
              >
                Supprimer cette langue
              </button>
            )}
          </div>
        );
      })}

      {fields.length < 3 && (
        <button
          type="button"
          onClick={() =>
            append({
              language: "",
              level: "",
            })
          }
          className="rounded-lg border border-dashed px-4 py-3 text-sm font-medium text-[#1F6F5F]"
        >
          + Ajouter une langue
        </button>
      )}

      {typeof errors.languages?.message ===
        "string" && (
        <p className="text-sm text-red-500">
          {errors.languages.message}
        </p>
      )}
    </div>
  );
}