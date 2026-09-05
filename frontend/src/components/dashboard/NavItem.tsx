"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";

interface NavItemProps {
  href: string;
  label: string;
  icon: LucideIcon;
}

export default function NavItem({
  href,
  label,
  icon: Icon,
}: NavItemProps) {
  const pathname = usePathname();

  const active =
    pathname === href ||
    (href !== "/dashboard" &&
      pathname.startsWith(`${href}/`));

  return (
    <Link
      href={href}
      className={[
        "group relative flex items-center gap-3 rounded-xl px-3 py-2.5",
        "text-[12px] font-medium transition-all duration-200",
        active
          ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
          : "text-slate-500 hover:bg-emerald-50 hover:text-emerald-700",
      ].join(" ")}
    >

      {active && (
        <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-white" />
      )}

      <Icon
        className={[
          "h-[17px] w-[17px] shrink-0 transition-all duration-200",
          active
            ? "text-white"
            : "text-slate-400 group-hover:text-emerald-600 group-hover:scale-105",
        ].join(" ")}
        strokeWidth={1.8}
      />

      <span className="truncate">
        {label}
      </span>

      {active && (
        <ChevronRightSmall />
      )}

    </Link>
  );
}

function ChevronRightSmall() {
  return (
    <svg
      className="ml-auto h-3.5 w-3.5 text-white/70"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M7.21 14.77a.75.75 0 01.02-1.06L10.94 10 7.23 6.29a.75.75 0 111.06-1.06l4.24 4.24a.75.75 0 010 1.06l-4.24 4.24a.75.75 0 01-1.08 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}