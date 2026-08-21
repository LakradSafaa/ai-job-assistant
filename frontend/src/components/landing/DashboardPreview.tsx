"use client";

import { motion } from "framer-motion";
import {
  BrainCircuit,
  Briefcase,
  CheckCircle2,
  DollarSign,
  FileText,
  Sparkles,
} from "lucide-react";

import Container from "@/components/layout/Container";
import SectionTitle from "@/components/layout/SectionTitle";

export default function DashboardPreview() {
  return (
    <section className="bg-[#F8F6F2] py-28">

      <Container>

        <SectionTitle
          badge="Dashboard IA"
          title="Votre assistant carrière dans un tableau de bord unique"
          description="Toutes vos analyses, candidatures et recommandations réunies dans une seule interface."
        />

        <motion.div
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: .6 }}
          viewport={{ once: true }}
          className="mt-20 overflow-hidden rounded-[40px] border border-stone-200 bg-white shadow-2xl"
        >

          <div className="grid lg:grid-cols-[280px_1fr]">

            {/* SIDEBAR */}

            <aside className="border-r border-stone-200 bg-[#1F2937] p-8 text-white">

              <h2 className="text-2xl font-bold">
                AI Job Assistant
              </h2>

              <div className="mt-12 space-y-5">

                {[
                  "Dashboard",
                  "Mes CV",
                  "Analyses IA",
                  "Offres",
                  "Entretiens",
                  "Profil",
                ].map((item) => (

                  <div
                    key={item}
                    className="rounded-xl px-4 py-3 transition hover:bg-white/10"
                  >
                    {item}
                  </div>

                ))}

              </div>

            </aside>

            {/* CONTENT */}

            <main className="bg-[#FCFBF9] p-10">

              {/* TOP */}

              <div className="grid gap-6 lg:grid-cols-4">

                <Card
                  icon={<BrainCircuit size={26} />}
                  value="94%"
                  title="Score ATS"
                  color="bg-[#1F6F5F]"
                />

                <Card
                  icon={<Briefcase size={26} />}
                  value="27"
                  title="Offres compatibles"
                  color="bg-[#B58863]"
                />

                <Card
                  icon={<DollarSign size={26} />}
                  value="38K"
                  title="Salaire estimé"
                  color="bg-green-600"
                />

                <Card
                  icon={<Sparkles size={26} />}
                  value="98%"
                  title="Matching IA"
                  color="bg-sky-600"
                />

              </div>

              {/* CV */}

              <div className="mt-10 rounded-3xl border border-stone-200 bg-white p-8">

                <div className="flex items-center justify-between">

                  <div>

                    <h3 className="text-2xl font-bold">

                      Analyse de votre CV

                    </h3>

                    <p className="mt-2 text-stone-500">

                      Dernière analyse

                    </p>

                  </div>

                  <CheckCircle2
                    size={34}
                    className="text-green-600"
                  />

                </div>

                <div className="mt-10 space-y-7">

                  <Progress
                    title="Compétences"
                    value={95}
                    color="bg-[#1F6F5F]"
                  />

                  <Progress
                    title="Expérience"
                    value={90}
                    color="bg-[#B58863]"
                  />

                  <Progress
                    title="Formation"
                    value={85}
                    color="bg-sky-600"
                  />

                  <Progress
                    title="ATS"
                    value={94}
                    color="bg-green-600"
                  />

                </div>

              </div>

              {/* Bottom */}

              <div className="mt-8 grid gap-6 lg:grid-cols-2">

                <div className="rounded-3xl border border-stone-200 bg-white p-7">

                  <div className="flex items-center gap-3">

                    <FileText
                      className="text-[#1F6F5F]"
                    />

                    <h3 className="font-bold">

                      Dernier CV

                    </h3>

                  </div>

                  <p className="mt-6 text-stone-600">

                    CV_Developpeur_IA.pdf

                  </p>

                </div>

                <div className="rounded-3xl border border-stone-200 bg-white p-7">

                  <div className="flex items-center gap-3">

                    <Sparkles
                      className="text-[#1F6F5F]"
                    />

                    <h3 className="font-bold">

                      Recommandation IA

                    </h3>

                  </div>

                  <p className="mt-6 text-stone-600">

                    Ajoutez davantage de projets et de
                    compétences techniques afin
                    d'augmenter votre score ATS.

                  </p>

                </div>

              </div>

            </main>

          </div>

        </motion.div>

      </Container>

    </section>
  );
}

function Card({
  icon,
  value,
  title,
  color,
}: {
  icon: React.ReactNode;
  value: string;
  title: string;
  color: string;
}) {
  return (
    <div className="rounded-3xl bg-white p-6 shadow">

      <div className={`inline-flex rounded-2xl p-4 text-white ${color}`}>
        {icon}
      </div>

      <h2 className="mt-6 text-4xl font-bold">
        {value}
      </h2>

      <p className="mt-2 text-stone-500">
        {title}
      </p>

    </div>
  );
}

function Progress({
  title,
  value,
  color,
}: {
  title: string;
  value: number;
  color: string;
}) {
  return (
    <div>

      <div className="mb-2 flex justify-between">

        <span>{title}</span>

        <span>{value}%</span>

      </div>

      <div className="h-3 rounded-full bg-stone-200">

        <div
          style={{ width: `${value}%` }}
          className={`h-3 rounded-full ${color}`}
        />

      </div>

    </div>
  );
}