import type { ReactNode } from "react";

interface KpiCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: ReactNode;
  color: string;
  loading?: boolean;
}

export default function KpiCard({
  title,
  value,
  subtitle,
  icon,
  color,
  loading = false,
}: KpiCardProps) {
  return (
    <div className="group rounded-3xl border border-stone-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-stone-500">
            {title}
          </p>

          {loading ? (
            <div className="mt-4 h-10 w-24 animate-pulse rounded-xl bg-stone-100" />
          ) : (
            <h2 className="mt-4 truncate text-3xl font-bold tracking-tight text-[#1F2937]">
              {value}
            </h2>
          )}

          <p className="mt-2 text-sm text-stone-400">
            {subtitle}
          </p>
        </div>

        <div
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-white shadow-sm"
          style={{
            backgroundColor: color,
          }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}