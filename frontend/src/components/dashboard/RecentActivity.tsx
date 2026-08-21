"use client";

import {
  ArrowRight,
  Brain,
  Briefcase,
  CheckCircle2,
  Clock3,
  FileCheck,
  Sparkles,
} from "lucide-react";

export interface ActivityItem {
  id: string;
  type: "application" | "match" | "profile";
  title: string;
  description: string;
  date: string;
  status?: string | null;
}

interface RecentActivityProps {
  activities: ActivityItem[];
  loading?: boolean;
}

function getActivityIcon(
  type: ActivityItem["type"]
) {
  if (type === "application") {
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#8B6A4F]/10 text-[#8B6A4F]">
        <FileCheck size={19} />
      </div>
    );
  }

  if (type === "match") {
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#5B8DEF]/10 text-[#5B8DEF]">
        <Brain size={19} />
      </div>
    );
  }

  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1F6F5F]/10 text-[#1F6F5F]">
      <Sparkles size={19} />
    </div>
  );
}

function formatDate(date: string) {
  const value = new Date(date);

  if (Number.isNaN(value.getTime())) {
    return "";
  }

  return value.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function RecentActivity({
  activities,
  loading = false,
}: RecentActivityProps) {
  return (
    <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <p className="text-sm font-medium text-[#1F6F5F]">
          Votre activité
        </p>

        <h2 className="mt-1 text-xl font-bold text-[#1F2937]">
          Activité récente
        </h2>

        <p className="mt-1 text-sm text-stone-500">
          Les dernières actions de votre compte.
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-16 animate-pulse rounded-2xl bg-stone-50"
            />
          ))}
        </div>
      ) : activities.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-200 bg-stone-50 p-8 text-center">
          <Clock3
            size={30}
            className="mx-auto text-stone-400"
          />

          <p className="mt-3 font-medium text-stone-700">
            Aucune activité récente.
          </p>

          <p className="mt-1 text-sm text-stone-500">
            Votre activité apparaîtra ici.
          </p>
        </div>
      ) : (
        <div className="space-y-1">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-3 rounded-2xl p-3 transition hover:bg-stone-50"
            >
              {getActivityIcon(activity.type)}

              <div className="min-w-0 flex-1">
                <div className="flex flex-col justify-between gap-1 sm:flex-row">
                  <h3 className="text-sm font-semibold text-[#1F2937]">
                    {activity.title}
                  </h3>

                  <span className="shrink-0 text-xs text-stone-400">
                    {formatDate(activity.date)}
                  </span>
                </div>

                <p className="mt-1 text-xs text-stone-500">
                  {activity.description}
                </p>

                {activity.status && (
                  <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-stone-100 px-2 py-1 text-[11px] font-medium text-stone-600">
                    <CheckCircle2 size={11} />
                    {activity.status}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <a
        href="/applications"
        className="mt-5 flex items-center justify-center gap-2 text-sm font-medium text-[#1F6F5F] transition hover:text-[#155443]"
      >
        Voir mes candidatures
        <ArrowRight size={16} />
      </a>
    </section>
  );
}