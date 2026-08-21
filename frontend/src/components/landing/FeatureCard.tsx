import React from "react";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export default function FeatureCard({
  icon,
  title,
  description,
}: FeatureCardProps) {
  return (
    <div className="rounded-3xl bg-white p-8 shadow-sm transition hover:shadow-lg">

      <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1F2937] text-white">
        {icon}
      </div>

      <h3 className="text-xl font-bold text-[#1F2937]">
        {title}
      </h3>

      <p className="mt-4 leading-relaxed text-stone-600">
        {description}
      </p>

    </div>
  );
}