"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BrainCircuit,
  Briefcase,
  CheckCircle2,
  FileText,
  Sparkles,
} from "lucide-react";

import Container from "@/components/layout/Container";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#F8F6F2] py-24 lg:py-32">
      {/* Background Blur */}
      <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-[#1F6F5F]/10 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-[#B58863]/10 blur-3xl" />

      <Container>
        <div className="grid items-center gap-20 lg:grid-cols-2">
          {/* LEFT */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: .7 }}
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-[#E8F5EF] px-4 py-2 text-sm font-semibold text-[#1F6F5F]">
              <Sparkles size={16} />
              Nouvelle génération d'assistant IA
            </div>

            <h1 className="text-5xl font-extrabold leading-tight text-[#1F2937] lg:text-7xl">
              Votre carrière,
              <br />
              propulsée par
              <span className="text-[#1F6F5F]"> l'IA.</span>
            </h1>

            <p className="mt-8 max-w-xl text-lg leading-8 text-stone-600">
              Analyse ATS, optimisation du CV,
              matching intelligent avec les offres,
              estimation salariale et recommandations
              personnalisées en quelques secondes.
            </p>

            {/* Buttons */}

            <div className="mt-10 flex flex-wrap gap-4">

              <Link
                href="/register"
                className="flex items-center gap-2 rounded-xl bg-[#1F6F5F] px-7 py-4 font-semibold text-white shadow-lg transition hover:bg-[#165448]"
              >
                Commencer gratuitement
                <ArrowRight size={18} />
              </Link>

              <Link
                href="#demo"
                className="rounded-xl border border-stone-300 bg-white px-7 py-4 font-semibold transition hover:bg-stone-100"
              >
                Voir une démo
              </Link>

            </div>

            {/* Features */}

            <div className="mt-12 grid grid-cols-2 gap-4">

              <div className="flex items-center gap-3">

                <CheckCircle2 className="text-green-600" />

                <span>Analyse ATS</span>

              </div>

              <div className="flex items-center gap-3">

                <BrainCircuit className="text-green-600" />

                <span>Matching IA</span>

              </div>

              <div className="flex items-center gap-3">

                <Briefcase className="text-green-600" />

                <span>Offres adaptées</span>

              </div>

              <div className="flex items-center gap-3">

                <FileText className="text-green-600" />

                <span>Optimisation CV</span>

              </div>

            </div>
          </motion.div>

          {/* RIGHT */}

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: .8 }}
            className="relative"
          >

            {/* Main Card */}

            <div className="rounded-3xl bg-white p-8 shadow-2xl">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-sm text-stone-500">
                    Analyse IA
                  </p>

                  <h3 className="mt-2 text-2xl font-bold">
                    Score ATS
                  </h3>

                </div>

                <div className="rounded-2xl bg-green-100 px-5 py-4">

                  <span className="text-4xl font-bold text-[#1F6F5F]">
                    94%
                  </span>

                </div>

              </div>

              <div className="mt-8 space-y-4">

                <div>

                  <div className="mb-2 flex justify-between">

                    <span>Compétences</span>

                    <span>95%</span>

                  </div>

                  <div className="h-3 rounded-full bg-stone-200">

                    <div className="h-3 w-[95%] rounded-full bg-[#1F6F5F]" />

                  </div>

                </div>

                <div>

                  <div className="mb-2 flex justify-between">

                    <span>Expérience</span>

                    <span>90%</span>

                  </div>

                  <div className="h-3 rounded-full bg-stone-200">

                    <div className="h-3 w-[90%] rounded-full bg-[#B58863]" />

                  </div>

                </div>

                <div>

                  <div className="mb-2 flex justify-between">

                    <span>Matching</span>

                    <span>88%</span>

                  </div>

                  <div className="h-3 rounded-full bg-stone-200">

                    <div className="h-3 w-[88%] rounded-full bg-green-500" />

                  </div>

                </div>

              </div>

            </div>

            {/* Floating Card */}

            <motion.div
              animate={{
                y: [0, -12, 0],
              }}
              transition={{
                repeat: Infinity,
                duration: 4,
              }}
              className="absolute -left-8 top-12 rounded-2xl bg-white p-5 shadow-xl"
            >

              <p className="text-sm text-stone-500">

                Salaire estimé

              </p>

              <h3 className="mt-2 text-3xl font-bold text-[#1F6F5F]">

                38 000 DH

              </h3>

            </motion.div>

            {/* Floating Card */}

            <motion.div
              animate={{
                y: [0, 10, 0],
              }}
              transition={{
                repeat: Infinity,
                duration: 5,
              }}
              className="absolute -bottom-8 right-0 rounded-2xl bg-[#1F6F5F] p-6 text-white shadow-xl"
            >

              <p className="text-sm">

                Matching emploi

              </p>

              <h2 className="mt-2 text-4xl font-bold">

                27

              </h2>

              <p className="text-sm">

                Offres compatibles

              </p>

            </motion.div>

          </motion.div>
        </div>
      </Container>
    </section>
  );
}