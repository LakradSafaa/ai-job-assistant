"use client";

import { useFormContext } from "react-hook-form";

import { Input } from "@/components/ui/input";
import type { OnboardingSchema } from "@/lib/validations";

export default function ExperienceStep() {
  const {
    register,
  } = useFormContext<OnboardingSchema>();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">
          Expérience professionnelle
        </h2>

        <p className="mt-2 text-gray-500">
          Cette section est facultative. Si vous
          n'avez pas encore d'expérience, cliquez
          simplement sur « Suivant ».
        </p>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">
          Entreprise
        </label>

        <Input
          {...register("company")}
          placeholder="Nom de l'entreprise"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">
          Poste
        </label>

        <Input
          {...register("position")}
          placeholder="Ex. Développeur Full Stack"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium">
            Date de début
          </label>

          <Input
            type="date"
            {...register("experienceStart")}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Date de fin
          </label>

          <Input
            type="date"
            {...register("experienceEnd")}
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">
          Description
        </label>

        <textarea
          {...register("description")}
          rows={5}
          placeholder="Décrivez votre expérience..."
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </div>
    </div>
  );
}