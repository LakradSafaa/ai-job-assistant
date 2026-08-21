"use client";

import { Bell } from "lucide-react";

export default function NotificationBell() {
  return (
    <button
      className="
      relative
      flex
      h-11
      w-11
      items-center
      justify-center
      rounded-xl
      border
      border-stone-200
      bg-white
      transition
      hover:bg-stone-100
    "
    >
      <Bell size={20} />

      <span
        className="
        absolute
        right-2
        top-2
        h-2.5
        w-2.5
        rounded-full
        bg-red-500
      "
      />
    </button>
  );
}