import Link from "next/link";
import { BrainCircuit } from "lucide-react";

export default function SidebarLogo() {
  return (
    <Link
      href="/dashboard"
      className="flex items-center gap-3 px-2"
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#1F6F5F] text-white shadow-lg">
        <BrainCircuit size={22} />
      </div>

      <div>
        <h1 className="text-lg font-bold text-white">
          AI Job Assistant
        </h1>

        <p className="text-xs text-gray-400">
          Smart Career Platform
        </p>
      </div>
    </Link>
  );
}