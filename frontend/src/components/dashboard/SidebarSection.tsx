interface SidebarSectionProps {
  title: string;
  children: React.ReactNode;
}

export default function SidebarSection({
  title,
  children,
}: SidebarSectionProps) {
  return (
    <section className="space-y-3">

      <h3 className="px-4 text-xs font-semibold uppercase tracking-widest text-gray-500">
        {title}
      </h3>

      <div className="space-y-2">
        {children}
      </div>

    </section>
  );
}