"use client";

import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type RegisterData = {
  fullName: string;
  email: string;
  password: string;
  domaine: string;
};

const DOMAINES = [
  "Informatique / Software",
  "Data / Intelligence Artificielle",
  "Ingénierie industrielle",
  "Génie mécanique",
  "Génie électrique / Électronique",
  "Automatisation / Robotique",
  "Supply Chain / Logistique",
  "Qualité / Amélioration continue",
  "Finance / Comptabilité",
  "Marketing / Communication",
  "Ressources humaines",
  "Commercial / Business Development",
  "Cybersécurité",
  "Cloud / DevOps",
  "Gestion de projet",
  "Autre",
];

export default function RegisterForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterData>();

  const onSubmit = (data: RegisterData) => {
    console.log("DONNÉES INSCRIPTION :", data);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6"
    >
      <div>
        <h2 className="text-4xl font-black text-[#1F2937]">
          Créer un compte
        </h2>

        <p className="mt-3 text-stone-500">
          Commencez votre recherche d'emploi avec l'IA.
        </p>
      </div>

      {/* NOM */}
      <div>
        <Input
          placeholder="Nom complet"
          {...register("fullName", {
            required: "Le nom complet est obligatoire",
          })}
        />

        {errors.fullName && (
          <p className="mt-1 text-sm text-red-500">
            {errors.fullName.message}
          </p>
        )}
      </div>

      {/* EMAIL */}
      <div>
        <Input
          type="email"
          placeholder="Adresse email"
          {...register("email", {
            required: "L'adresse email est obligatoire",
          })}
        />

        {errors.email && (
          <p className="mt-1 text-sm text-red-500">
            {errors.email.message}
          </p>
        )}
      </div>

      {/* MOT DE PASSE */}
      <div>
        <Input
          type="password"
          placeholder="Mot de passe"
          {...register("password", {
            required: "Le mot de passe est obligatoire",
            minLength: {
              value: 6,
              message: "Minimum 6 caractères",
            },
          })}
        />

        {errors.password && (
          <p className="mt-1 text-sm text-red-500">
            {errors.password.message}
          </p>
        )}
      </div>

      {/* DOMAINE */}
      <div>
        <label
          htmlFor="domaine"
          className="mb-2 block text-sm font-medium text-[#1F2937]"
        >
          Votre domaine professionnel
        </label>

        <select
          id="domaine"
          {...register("domaine", {
            required: "Veuillez sélectionner votre domaine",
          })}
          className="h-12 w-full rounded-md border border-input bg-background px-3 text-sm text-[#1F2937] outline-none focus:ring-2 focus:ring-[#1F6F5F]"
          defaultValue=""
        >
          <option value="" disabled>
            Sélectionnez votre domaine
          </option>

          {DOMAINES.map((domaine) => (
            <option key={domaine} value={domaine}>
              {domaine}
            </option>
          ))}
        </select>

        {errors.domaine && (
          <p className="mt-1 text-sm text-red-500">
            {errors.domaine.message}
          </p>
        )}
      </div>

      {/* BOUTON */}
      <Button
        type="submit"
        className="h-12 w-full bg-[#1F6F5F] hover:bg-[#18584C]"
      >
        Créer mon compte
      </Button>
    </form>
  );
}