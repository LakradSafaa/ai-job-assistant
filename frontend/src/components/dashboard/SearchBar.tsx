"use client";

import { Search } from "lucide-react";

export default function SearchBar() {
  return (
    <div className="relative w-full max-w-md">
      <Search
        size={18}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"
      />

      <input
        type="text"
        placeholder="Rechercher..."
        className="
          w-full
          rounded-xl
          border
          border-stone-200
          bg-white
          py-3
          pl-11
          pr-4
          outline-none
          transition
          focus:border-[#1F6F5F]
          focus:ring-2
          focus:ring-[#1F6F5F]/20
        "
      />
    </div>
  );
}