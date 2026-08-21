const companies = [
  "Google",
  "Microsoft",
  "Amazon",
  "Meta",
  "Tesla",
  "Spotify",
];

export default function Companies() {
  return (
    <section className="border-y border-stone-200 bg-white py-10">

      <div className="mx-auto max-w-7xl px-6">

        <p className="mb-8 text-center text-sm uppercase tracking-widest text-stone-500">
          Trusted by candidates applying to
        </p>

        <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-6">

          {companies.map((company) => (
            <div
              key={company}
              className="rounded-2xl bg-stone-100 py-5 text-center font-semibold text-stone-600 transition hover:bg-[#1F6F5F] hover:text-white"
            >
              {company}
            </div>
          ))}

        </div>

      </div>

    </section>
  );
}