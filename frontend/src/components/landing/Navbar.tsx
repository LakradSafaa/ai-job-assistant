"use client";

import Link from "next/link";
import { Menu, X, Sparkles } from "lucide-react";
import { useState } from "react";
import Container from "@/components/layout/Container";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const links = [
    { name: "Accueil", href: "#" },
    { name: "Fonctionnalités", href: "#features" },
    { name: "Comment ça marche", href: "#how" },
    { name: "Tarifs", href: "#pricing" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-stone-200/70 bg-[#F8F6F2]/80 backdrop-blur-xl">
      <Container>
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#1F6F5F] text-white shadow-lg">
              <Sparkles size={22} />
            </div>

            <div>
              <h1 className="text-lg font-bold text-[#1F2937]">
                AI Job Assistant
              </h1>

              <p className="text-xs text-stone-500">
                Powered by AI
              </p>
            </div>
          </Link>

          {/* Desktop Menu */}
          <nav className="hidden items-center gap-8 lg:flex">
            {links.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-sm font-medium text-stone-600 transition hover:text-[#1F6F5F]"
              >
                {item.name}
              </a>
            ))}
          </nav>

          {/* Desktop Buttons */}
          <div className="hidden items-center gap-3 lg:flex">
            <Link
              href="/login"
              className="rounded-xl border border-stone-300 px-5 py-2.5 text-sm font-medium transition hover:bg-stone-100"
            >
              Connexion
            </Link>

            <Link
              href="/register"
              className="rounded-xl bg-[#1F6F5F] px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:bg-[#17594d]"
            >
              Commencer
            </Link>
          </div>

          {/* Mobile Button */}
          <button
            onClick={() => setOpen(!open)}
            className="lg:hidden"
          >
            {open ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {open && (
          <div className="border-t border-stone-200 py-6 lg:hidden">
            <div className="flex flex-col gap-5">
              {links.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-stone-700"
                >
                  {item.name}
                </a>
              ))}

              <Link
                href="/login"
                className="rounded-xl border border-stone-300 py-3 text-center"
              >
                Connexion
              </Link>

              <Link
                href="/register"
                className="rounded-xl bg-[#1F6F5F] py-3 text-center font-semibold text-white"
              >
                Commencer gratuitement
              </Link>
            </div>
          </div>
        )}
      </Container>
    </header>
  );
}