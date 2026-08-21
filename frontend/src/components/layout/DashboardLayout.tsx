"use client";

import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Contenu */}
      <div className="flex flex-1 flex-col">
        {/* Navbar */}
        <Navbar />

        {/* Page */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}