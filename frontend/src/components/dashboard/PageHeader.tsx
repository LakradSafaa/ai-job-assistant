export default function PageHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div>
      <h1 className="text-3xl font-bold text-[#1F2937]">
        {title}
      </h1>

      <p className="mt-2 text-stone-600">
        {subtitle}
      </p>
    </div>
  );
}