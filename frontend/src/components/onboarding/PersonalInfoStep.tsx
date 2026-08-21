"use client";

import { useFormContext } from "react-hook-form";

import { Input } from "@/components/ui/input";
import type { OnboardingSchema } from "@/lib/validations";

const countries = [
  "Afghanistan",
  "Afrique du Sud",
  "Albanie",
  "Algérie",
  "Allemagne",
  "Arabie saoudite",
  "Argentine",
  "Australie",
  "Autriche",
  "Belgique",
  "Brésil",
  "Canada",
  "Chine",
  "Colombie",
  "Danemark",
  "Égypte",
  "Espagne",
  "États-Unis",
  "France",
  "Inde",
  "Italie",
  "Japon",
  "Maroc",
  "Mexique",
  "Niger",
  "Norvège",
  "Pays-Bas",
  "Portugal",
  "Royaume-Uni",
  "Suisse",
  "Suède",
  "Tunisie",
  "Turquie",
  "Émirats arabes unis",
];

export default function PersonalInfoStep() {
  const {
    register,
    formState: { errors },
  } = useFormContext<OnboardingSchema>();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">
          Informations personnelles
        </h2>

        <p className="mt-2 text-gray-500">
          Renseignez vos informations personnelles.
        </p>
      </div>

      {/* Nom complet */}
      <div>
        <label className="mb-2 block text-sm font-medium">
          Nom complet{" "}
          <span className="text-red-500">*</span>
        </label>

        <Input
          {...register("fullName")}
          placeholder="Ex. Yassine Lakhrar"
        />

        {errors.fullName && (
          <p className="mt-1 text-sm text-red-500">
            {errors.fullName.message}
          </p>
        )}
      </div>

      {/* Date de naissance */}
      <div>
        <label className="mb-2 block text-sm font-medium">
          Date de naissance{" "}
          <span className="text-red-500">*</span>
        </label>

        <Input
          type="date"
          {...register("dateOfBirth")}
        />

        {errors.dateOfBirth && (
          <p className="mt-1 text-sm text-red-500">
            {errors.dateOfBirth.message}
          </p>
        )}
      </div>

      {/* Téléphone */}
      <div>
        <label className="mb-2 block text-sm font-medium">
          Téléphone{" "}
          <span className="text-red-500">*</span>
        </label>

        <div className="grid grid-cols-[140px_1fr] gap-3">
          <Input
            {...register("phoneCode")}
            placeholder="+212"
          />

          <Input
            {...register("phone")}
            placeholder="600000000"
            type="tel"
          />
        </div>

        {errors.phoneCode && (
          <p className="mt-1 text-sm text-red-500">
            {errors.phoneCode.message}
          </p>
        )}

        {errors.phone && (
          <p className="mt-1 text-sm text-red-500">
            {errors.phone.message}
          </p>
        )}
      </div>

      {/* Pays */}
      <div>
        <label className="mb-2 block text-sm font-medium">
          Pays{" "}
          <span className="text-red-500">*</span>
        </label>

        <select
          {...register("country")}
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">
            Sélectionnez votre pays
          </option>

          {countries.map((country) => (
            <option
              key={country}
              value={country}
            >
              {country}
            </option>
          ))}
        </select>

        {errors.country && (
          <p className="mt-1 text-sm text-red-500">
            {errors.country.message}
          </p>
        )}
      </div>

      {/* Ville */}
      <div>
        <label className="mb-2 block text-sm font-medium">
          Ville{" "}
          <span className="text-red-500">*</span>
        </label>

        <Input
          {...register("city")}
          placeholder="Ex. Casablanca"
        />

        {errors.city && (
          <p className="mt-1 text-sm text-red-500">
            {errors.city.message}
          </p>
        )}
      </div>

      {/* Adresse */}
      <div>
        <label className="mb-2 block text-sm font-medium">
          Adresse{" "}
          <span className="text-red-500">*</span>
        </label>

        <Input
          {...register("address")}
          placeholder="Votre adresse"
        />

        {errors.address && (
          <p className="mt-1 text-sm text-red-500">
            {errors.address.message}
          </p>
        )}
      </div>
    </div>
  );
}