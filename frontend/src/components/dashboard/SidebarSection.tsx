interface SidebarSectionProps {
  title: string;
  children: React.ReactNode;
}

export default function SidebarSection({
  title,
  children,
}: SidebarSectionProps) {
  return (
    <section className="mb-7">

      <div className="mb-2 px-3 text-[9px] font-bold uppercase tracking-[0.16em] text-emerald-600/70">
        {title}
      </div>

      <div className="space-y-1">
        {children}
      </div>

    </section>
  );
}