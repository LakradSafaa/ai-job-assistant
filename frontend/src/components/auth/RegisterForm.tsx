"use client";

import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type RegisterData = {
  fullName: string;
  email: string;
  password: string;
};

export default function RegisterForm() {
  const { register, handleSubmit } = useForm<RegisterData>();

  const onSubmit = (data: RegisterData) => {
    console.log(data);
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

      <Input
        placeholder="Nom complet"
        {...register("fullName")}
      />

      <Input
        type="email"
        placeholder="Adresse email"
        {...register("email")}
      />

      <Input
        type="password"
        placeholder="Mot de passe"
        {...register("password")}
      />

      <Button
        className="h-12 w-full bg-[#1F6F5F] hover:bg-[#18584C]"
      >
        Créer mon compte
      </Button>
    </form>
  );
}