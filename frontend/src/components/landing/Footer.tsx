import {
  Github,
  LinkedinIcon,
  Mail,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#1F2937] py-16 text-white">

      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 px-6 lg:flex-row">

        <div>

          <h2 className="text-2xl font-black">
            AI Job Assistant
          </h2>

          <p className="mt-3 text-stone-400">
            Find your dream job with Artificial Intelligence.
          </p>

        </div>

        <div className="flex gap-5">

          <Github className="cursor-pointer transition hover:text-[#5BBFA5]" />

          <LinkedinIcon className="cursor-pointer transition hover:text-[#5BBFA5]" />
          <Mail className="cursor-pointer transition hover:text-[#5BBFA5]" />

        </div>

      </div>

    </footer>
  );
}