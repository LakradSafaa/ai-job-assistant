interface Props {
  name: string;
  job: string;
  message: string;
}

export default function TestimonialCard({
  name,
  job,
  message,
}: Props) {
  return (
    <div className="rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">

      <p className="leading-8 text-stone-600">
        "{message}"
      </p>

      <div className="mt-8">

        <h3 className="font-bold">
          {name}
        </h3>

        <p className="text-sm text-stone-500">
          {job}
        </p>

      </div>

    </div>
  );
}