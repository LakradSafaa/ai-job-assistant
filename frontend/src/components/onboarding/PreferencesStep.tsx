"use client";

import { useFieldArray, useFormContext } from "react-hook-form";

import type { OnboardingSchema } from "@/lib/validations";
import { countries } from "@/constants/countries";

export default function PreferencesStep() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<OnboardingSchema>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "jobLocations",
  });

  return (
    <div className="space-y-8">
      {/* ========================= */}
      {/* MÉTIER RECHERCHÉ */}
      {/* ========================= */}

      <div>
        <h2 className="text-2xl font-semibold">
          Préférences d'emploi
        </h2>

        <p className="mt-2 text-sm text-gray-500">
          Indiquez le type de poste et les lieux dans lesquels
          vous souhaitez travailler.
        </p>
      </div>

      {/* ========================= */}
      {/* MÉTIER */}
      {/* ========================= */}

      <div>
        <label className="mb-2 block text-sm font-medium">
          Métier recherché{" "}
          <span className="text-red-500">*</span>
        </label>

        <input
          {...register("desiredJob")}
          placeholder="Ex. Ingénieur en intelligence artificielle"
          className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm"
        />

        {errors.desiredJob && (
          <p className="mt-1 text-sm text-red-500">
            {errors.desiredJob.message}
          </p>
        )}
      </div>

      {/* ========================= */}
      {/* SALAIRE */}
      {/* ========================= */}

      <div>
        <label className="mb-2 block text-sm font-medium">
          Salaire souhaité{" "}
          <span className="text-red-500">*</span>
        </label>

        <input
          {...register("desiredSalary")}
          placeholder="Ex. 15 000 MAD"
          className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm"
        />

        {errors.desiredSalary && (
          <p className="mt-1 text-sm text-red-500">
            {errors.desiredSalary.message}
          </p>
        )}
      </div>

      {/* ========================= */}
      {/* LIEUX */}
      {/* ========================= */}

      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">
            Où souhaitez-vous travailler ?
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            Vous pouvez sélectionner jusqu'à 3 lieux.
          </p>
        </div>

        {fields.map((field, index) => {
          const countryError =
            errors.jobLocations?.[index]?.country;

          const cityError =
            errors.jobLocations?.[index]?.city;

          return (
            <div
              key={field.id}
              className="rounded-xl border p-5"
            >
              <div className="mb-4 flex items-center justify-between">
                <h4 className="font-medium">
                  Lieu {index + 1}
                </h4>

                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="text-sm font-medium text-red-500 hover:text-red-700"
                  >
                    Supprimer
                  </button>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {/* PAYS */}

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Pays{" "}
                    <span className="text-red-500">*</span>
                  </label>

                  <select
                    {...register(
                      `jobLocations.${index}.country`
                    )}
                    className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="">
                      Sélectionnez un pays
                    </option>

                    {countries.map((country) => (
                      <option
                        key={country.code}
                        value={country.name}
                      >
                        {country.name}
                      </option>
                    ))}
                  </select>

                  {countryError && (
                    <p className="mt-1 text-sm text-red-500">
                      {countryError.message}
                    </p>
                  )}
                </div>

                {/* VILLE */}

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Ville{" "}
                    <span className="text-red-500">*</span>
                  </label>

                  <input
                    {...register(
                      `jobLocations.${index}.city`
                    )}
                    placeholder="Ex. Casablanca"
                    className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm"
                  />

                  {cityError && (
                    <p className="mt-1 text-sm text-red-500">
                      {cityError.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* AJOUTER */}

        {fields.length < 3 && (
          <button
            type="button"
            onClick={() =>
              append({
                country: "",
                city: "",
              })
            }
            className="w-full rounded-lg border border-dashed px-4 py-3 text-sm font-medium text-[#1F6F5F] hover:bg-gray-50"
          >
            + Ajouter un autre lieu
          </button>
        )}

        <p className="text-xs text-gray-500">
          {fields.length}/3 lieux sélectionnés
        </p>
      </div>
    </div>
  );
}