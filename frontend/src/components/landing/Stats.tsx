import {
  Briefcase,
  FileCheck,
  Users,
  Zap,
} from "lucide-react";

const stats = [
  {
    icon: <Users size={30} />,
    value: "15K+",
    label: "Candidates",
  },
  {
    icon: <Briefcase size={30} />,
    value: "3K+",
    label: "Jobs",
  },
  {
    icon: <FileCheck size={30} />,
    value: "96%",
    label: "ATS Success",
  },
  {
    icon: <Zap size={30} />,
    value: "24/7",
    label: "AI Assistant",
  },
];

export default function Stats() {
  return (
    <section className="bg-[#1F6F5F] py-20 text-white">

      <div className="mx-auto grid max-w-7xl gap-8 px-6 md:grid-cols-2 lg:grid-cols-4">

        {stats.map((item) => (
          <div
            key={item.label}
            className="rounded-3xl bg-white/10 p-8 backdrop-blur"
          >
            <div className="mb-6">{item.icon}</div>

            <h2 className="text-5xl font-black">
              {item.value}
            </h2>

            <p className="mt-3 text-stone-200">
              {item.label}
            </p>

          </div>
        ))}

      </div>

    </section>
  );
}