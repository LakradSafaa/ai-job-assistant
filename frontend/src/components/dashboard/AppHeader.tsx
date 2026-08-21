"use client";

import SearchBar from "./SearchBar";
import NotificationBell from "./NotificationBell";
import UserMenu from "./UserMenu";

export default function AppHeader() {
  return (
    <header className="flex min-h-16 items-center justify-between border-b border-stone-200 bg-white px-4 md:px-6">
      <div className="hidden flex-1 md:block">
        <SearchBar />
      </div>

      <div className="ml-auto flex items-center gap-3">
        <NotificationBell />
        <UserMenu />
      </div>
    </header>
  );
}