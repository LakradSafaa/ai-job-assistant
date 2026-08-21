import TestimonialCard from "./TestimonialCard";

const testimonials = [
  {
    name: "Sarah Johnson",
    job: "Software Engineer",
    message:
      "AI Job Assistant helped me improve my CV and I received interviews within two weeks.",
  },
  {
    name: "Ahmed Benali",
    job: "Data Analyst",
    message:
      "The ATS analysis was incredibly accurate. It showed exactly what recruiters were missing.",
  },
  {
    name: "Maria Lopez",
    job: "UX Designer",
    message:
      "Beautiful interface and powerful AI. It became my daily career assistant.",
  },
];

export default function Testimonials() {
  return (
    <section className="bg-white py-28">

      <div className="mx-auto max-w-7xl px-6">

        <div className="mb-20 text-center">

          <h2 className="text-5xl font-black text-[#1F2937]">
            Loved by Candidates
          </h2>

          <p className="mt-5 text-lg text-stone-600">
            Thousands of professionals trust AI Job Assistant.
          </p>

        </div>

        <div className="grid gap-8 lg:grid-cols-3">

          {testimonials.map((item) => (
            <TestimonialCard key={item.name} {...item} />
          ))}

        </div>

      </div>

    </section>
  );
}