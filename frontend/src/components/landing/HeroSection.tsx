"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#EEF6F2] via-white to-[#F8FAFC] py-28">

      <div className="mx-auto max-w-7xl px-6">

        <div className="grid items-center gap-16 lg:grid-cols-2">

          {/* LEFT */}

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: .6 }}
          >

            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-[#E3F3ED] px-4 py-2 text-sm font-medium text-[#1F6F5F]">

              <Sparkles size={16} />

              Powered by Artificial Intelligence

            </div>

            <h1 className="text-6xl font-black leading-tight text-[#1F2937]">

              Find Your

              <span className="block text-[#1F6F5F]">

                Dream Job

              </span>

              Faster with AI

            </h1>

            <p className="mt-8 max-w-xl text-lg leading-8 text-stone-600">

              Upload your CV, receive an AI-powered ATS analysis,
              improve your resume, discover matching jobs and automate
              your job search.

            </p>

            <div className="mt-12 flex gap-4">

              <button className="rounded-2xl bg-[#1F6F5F] px-8 py-4 font-semibold text-white transition hover:scale-105">

                Get Started

              </button>

              <button className="flex items-center gap-2 rounded-2xl border border-stone-300 bg-white px-8 py-4 font-semibold hover:bg-stone-100">

                Live Demo

                <ArrowRight size={18} />

              </button>

            </div>

          </motion.div>

          {/* RIGHT */}

          <motion.div
            initial={{ opacity: 0, scale: .9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: .3 }}
          >

            <div className="rounded-[40px] border border-stone-200 bg-white p-8 shadow-2xl">

              <img
                src="/dashboard-preview.png"
                alt="Dashboard"
                className="rounded-3xl"
              />

            </div>

          </motion.div>

        </div>

      </div>

    </section>
  );
}