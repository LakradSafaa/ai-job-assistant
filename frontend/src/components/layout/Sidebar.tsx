"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Briefcase,
  BrainCircuit,
  Bookmark,
  CalendarDays,
  Bell,
  Settings,
} from "lucide-react";

const menuItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Mon CV",
    href: "/cv",
    icon: FileText,
  },
  {
    title: "Offres",
    href: "/jobs",
    icon: Briefcase,
  },
  {
    title: "Assistant IA",
    href: "/assistant",
    icon: BrainCircuit,
  },
  {
    title: "Candidatures",
    href: "/applications",
    icon: Bookmark,
  },
  {
    title: "Entretiens",
    href: "/interviews",
    icon: CalendarDays,
  },
  {
    title: "Notifications",
    href: "/notifications",
    icon: Bell,
  },
  {
    title: "Paramètres",
    href: "/settings",
    icon: Settings,
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 min-h-screen border-r bg-white">
      <div className="p-6 border-b">
        <h1 className="text-2xl font-bold text-blue-600">
          AI Job Assistant
        </h1>
      </div>

      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;

          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-all ${
                active
                  ? "bg-blue-600 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Icon size={20} />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}