interface SectionTitleProps {
  badge?: string;
  title: string;
  description?: string;
}

export default function SectionTitle({
  badge,
  title,
  description,
}: SectionTitleProps) {
  return (
    <div className="mx-auto max-w-3xl text-center mb-14">

      {badge && (
        <span className="inline-flex rounded-full bg-[#E7F5EF] px-4 py-1 text-sm font-semibold text-[#1F6F5F]">
          {badge}
        </span>
      )}

      <h2 className="mt-5 text-4xl font-bold tracking-tight text-[#1F2937]">
        {title}
      </h2>

      {description && (
        <p className="mt-5 text-lg leading-8 text-gray-600">
          {description}
        </p>
      )}

    </div>
  );
}