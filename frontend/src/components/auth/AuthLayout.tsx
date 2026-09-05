import React from "react";

interface AuthLayoutProps {
  children: React.ReactNode;
  hero?: React.ReactNode;
}

export default function AuthLayout({
  children,
  hero,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      <div className="flex flex-col justify-center px-6 py-12 lg:px-8">
        {children}
      </div>

      {hero && (
        <div className="relative hidden min-h-screen w-full lg:block">
          {hero}
        </div>
      )}
    </div>
  );
}