import { Sparkles } from "lucide-react";

export default function RegisterHero() {
  return (
    <section className="relative flex h-full items-center justify-center overflow-hidden bg-gradient-to-br from-[#1F6F5F] via-[#2E8B75] to-[#63B59E] p-16 text-white">

      <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

      <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-black/10 blur-3xl" />

      <div className="relative z-10 max-w-xl">

        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20">

          <Sparkles size={32} />

        </div>

        <h1 className="text-5xl font-black leading-tight">
          Trouvez votre prochain emploi grâce à l'IA.
        </h1>

        <p className="mt-8 text-xl leading-9 text-white/90">
          Analyse ATS, estimation salariale, matching intelligent et génération
          automatique de candidatures.
        </p>

      </div>

    </section>
  );
}