"use client";

import { motion } from "framer-motion";
import {
  UserPlus,
  FileUp,
  BrainCircuit,
  SearchCheck,
  Briefcase,
  Trophy,
} from "lucide-react";

import Container from "@/components/layout/Container";
import SectionTitle from "@/components/layout/SectionTitle";

const steps = [
  {
    icon: UserPlus,
    title: "Créer un compte",
    description:
      "Inscrivez-vous en quelques secondes et créez votre espace personnel.",
  },
  {
    icon: FileUp,
    title: "Importer votre CV",
    description:
      "Déposez simplement votre CV au format PDF.",
  },
  {
    icon: BrainCircuit,
    title: "Analyse IA",
    description:
      "Notre IA analyse automatiquement votre CV et détecte les améliorations possibles.",
  },
  {
    icon: SearchCheck,
    title: "Matching intelligent",
    description:
      "Nous comparons votre profil avec les offres les plus pertinentes.",
  },
  {
    icon: Briefcase,
    title: "Postuler",
    description:
      "Envoyez votre candidature avec un CV optimisé.",
  },
  {
    icon: Trophy,
    title: "Décrocher votre emploi",
    description:
      "Suivez vos candidatures jusqu'à votre prochain poste.",
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how"
      className="bg-white py-28"
    >
      <Container>

        <SectionTitle
          badge="Comment ça fonctionne"
          title="6 étapes pour trouver votre prochain emploi"
          description="Notre plateforme automatise toute votre recherche d'emploi grâce à l'intelligence artificielle."
        />

        <div className="relative mt-24">

          {/* Ligne verticale */}

          <div className="absolute left-6 top-0 hidden h-full w-1 rounded-full bg-[#DDEEE7] lg:block" />

          <div className="space-y-12">

            {steps.map((step, index) => {

              const Icon = step.icon;

              return (

                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, x: -25 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{
                    duration: .5,
                    delay: index * .1,
                  }}
                  viewport={{ once: true }}
                  className="flex gap-8"
                >

                  {/* Number */}

                  <div className="relative z-10 hidden h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#1F6F5F] text-lg font-bold text-white lg:flex">
                    {index + 1}
                  </div>

                  {/* Card */}

                  <div className="flex-1 rounded-3xl border border-stone-200 bg-[#F8F6F2] p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">

                    <div className="flex items-center gap-5">

                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E8F5EF]">

                        <Icon
                          size={28}
                          className="text-[#1F6F5F]"
                        />

                      </div>

                      <div>

                        <h3 className="text-2xl font-bold text-[#1F2937]">
                          {step.title}
                        </h3>

                        <p className="mt-2 leading-7 text-stone-600">
                          {step.description}
                        </p>

                      </div>

                    </div>

                  </div>

                </motion.div>

              );

            })}

          </div>

        </div>

      </Container>
    </section>
  );
}