"use client";

import { motion } from "framer-motion";
import {
  BrainCircuit,
  FileSearch,
  FileText,
  Briefcase,
  BadgeDollarSign,
  BarChart3,
} from "lucide-react";

import Container from "@/components/layout/Container";
import SectionTitle from "@/components/layout/SectionTitle";

const features = [
  {
    icon: BrainCircuit,
    title: "Analyse IA du CV",
    description:
      "Notre intelligence artificielle analyse votre CV comme un recruteur professionnel et détecte les points forts ainsi que les axes d'amélioration.",
  },
  {
    icon: FileSearch,
    title: "Score ATS",
    description:
      "Obtenez un score ATS détaillé afin d'augmenter vos chances de passer les logiciels de recrutement utilisés par les entreprises.",
  },
  {
    icon: FileText,
    title: "Optimisation automatique",
    description:
      "L'IA réécrit certaines parties du CV pour améliorer son impact sans modifier votre parcours professionnel.",
  },
  {
    icon: Briefcase,
    title: "Matching des offres",
    description:
      "Recevez automatiquement les offres qui correspondent réellement à votre profil et à vos compétences.",
  },
  {
    icon: BadgeDollarSign,
    title: "Estimation salariale",
    description:
      "Découvrez le salaire moyen que vous pouvez négocier selon votre expérience, votre localisation et votre métier.",
  },
  {
    icon: BarChart3,
    title: "Dashboard intelligent",
    description:
      "Suivez votre progression, vos candidatures, vos analyses IA et votre évolution depuis un tableau de bord unique.",
  },
];

export default function Features() {
  return (
    <section
      id="features"
      className="bg-[#F8F6F2] py-28"
    >
      <Container>
        <SectionTitle
          badge="Fonctionnalités"
          title="Tout ce qu'il faut pour décrocher votre prochain emploi"
          description="Une plateforme complète alimentée par l'intelligence artificielle pour optimiser chaque étape de votre recherche d'emploi."
        />

        <div className="mt-20 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 35 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{
                  duration: .5,
                  delay: index * .1,
                }}
                viewport={{ once: true }}
                whileHover={{
                  y: -8,
                }}
                className="group rounded-3xl border border-stone-200 bg-white p-8 shadow-sm transition-all hover:shadow-2xl"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E8F5EF] transition group-hover:bg-[#1F6F5F]">
                  <Icon
                    size={30}
                    className="text-[#1F6F5F] transition group-hover:text-white"
                  />
                </div>

                <h3 className="mt-8 text-2xl font-bold text-[#1F2937]">
                  {feature.title}
                </h3>

                <p className="mt-5 leading-8 text-stone-600">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}