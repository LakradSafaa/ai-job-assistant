"use client";

import { useFormContext } from "react-hook-form";

import FormField from "@/components/shared/FormField";
import type { OnboardingSchema } from "@/lib/validations";

export default function EducationStep() {
  const {
    register,
    formState: { errors },
  } = useFormContext<OnboardingSchema>();

  return (
    <div className="space-y-6">

      <div>
        <h2 className="text-3xl font-bold text-stone-900">
          Formation
        </h2>

        <p className="mt-2 text-stone-500">
          Ajoutez votre parcours académique.
        </p>
      </div>

      <FormField
        label="Diplôme"
        placeholder="Ex. Licence en informatique"
        required
        register={register("degree")}
        error={errors.degree?.message}
      />

      <FormField
        label="Établissement"
        placeholder="Ex. Université Hassan II"
        required
        register={register("school")}
        error={errors.school?.message}
      />

      <div className="grid gap-5 md:grid-cols-2">

        <div className="space-y-2">
          <label className="text-sm font-semibold text-stone-700">
            Date de début
            <span className="ml-1 text-red-500">*</span>
          </label>

          <input
            type="date"
            {...register("educationStart")}
            className={`w-full rounded-lg border bg-white px-3 py-3 outline-none focus:border-emerald-500 ${
              errors.educationStart
                ? "border-red-500"
                : "border-stone-300"
            }`}
          />

          {errors.educationStart && (
            <p className="text-sm text-red-500">
              {errors.educationStart.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-stone-700">
            Date de fin
            <span className="ml-1 text-red-500">*</span>
          </label>

          <input
            type="date"
            {...register("educationEnd")}
            className={`w-full rounded-lg border bg-white px-3 py-3 outline-none focus:border-emerald-500 ${
              errors.educationEnd
                ? "border-red-500"
                : "border-stone-300"
            }`}
          />

          {errors.educationEnd && (
            <p className="text-sm text-red-500">
              {errors.educationEnd.message}
            </p>
          )}
        </div>

      </div>

    </div>
  );
}