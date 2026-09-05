import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function SidebarLogo() {
  return (
    <Link
      href="/dashboard"
      className="group flex items-center gap-3"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/20 transition duration-300 group-hover:scale-105">
        <Sparkles className="h-5 w-5" />
      </div>

      <div className="min-w-0">
        <div className="text-sm font-bold tracking-tight text-slate-900">
          AI Job Assistant
        </div>

        <div className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-600">
          Copilote carrière
        </div>
      </div>
    </Link>
  );
}