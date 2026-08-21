"use client";

import Link from "next/link";
import { LucideIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import clsx from "clsx";

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

  const active = pathname === href;

  return (
    <Link
      href={href}
      className={clsx(
        "flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200",
        active
          ? "bg-[#1F6F5F] text-white shadow-md"
          : "text-gray-400 hover:bg-white/5 hover:text-white"
      )}
    >
      <Icon size={20} />

      <span className="font-medium">
        {label}
      </span>
    </Link>
  );
}