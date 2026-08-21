"use client";

import { ChevronDown } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function UserMenu() {
  return (
    <button
      className="
      flex
      items-center
      gap-3
      rounded-xl
      border
      border-stone-200
      bg-white
      px-3
      py-2
      transition
      hover:bg-stone-100
    "
    >
      <Avatar>

        <AvatarFallback className="bg-[#1F6F5F] text-white">

          YL

        </AvatarFallback>

      </Avatar>

      <div className="hidden text-left lg:block">

        <p className="font-semibold">

          Yassine Lakrad

        </p>

        <p className="text-sm text-stone-500">

          Premium

        </p>

      </div>

      <ChevronDown size={18} />

    </button>
  );
}