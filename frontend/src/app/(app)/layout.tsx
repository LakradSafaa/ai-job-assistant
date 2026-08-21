import type { ReactNode } from "react";

import AppLayout from "@/components/dashboard/AppLayout";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  return <AppLayout>{children}</AppLayout>;
}