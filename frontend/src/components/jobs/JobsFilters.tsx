"use client";

import {
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";

interface JobsFiltersProps {
  search: string;
  setSearch: (value: string) => void;

  location: string;
  setLocation: (value: string) => void;

  contract: string;
  setContract: (value: string) => void;

  experience: string;
  setExperience: (value: string) => void;

  remote: boolean;
  setRemote: (value: boolean) => void;

  onReset: () => void;
}

export default function JobsFilters({
  search,
  setSearch,
  location,
  setLocation,
  contract,
  setContract,
  experience,
  setExperience,
  remote,
  setRemote,
  onReset,
}: JobsFiltersProps) {
  const hasFilters =
    search !== "" ||
    location !== "" ||
    contract !== "" ||
    experience !== "" ||
    remote;

  return (
    <section className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal
            size={18}
            className="text-[#1F6F5F]"
          />

          <h2 className="font-semibold text-[#1F2937]">
            Rechercher une offre
          </h2>
        </div>

        {hasFilters && (
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1.5 text-xs font-medium text-stone-500 hover:text-[#1F6F5F]"
          >
            <X size={14} />
            Réinitialiser
          </button>
        )}
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 lg:grid-cols-5">
        <div className="relative lg:col-span-2">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"
          />

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Métier, compétence, mot-clé..."
            className="h-12 w-full rounded-2xl border border-stone-200 bg-stone-50 pl-11 pr-4 text-sm text-[#1F2937] outline-none transition placeholder:text-stone-400 focus:border-[#1F6F5F] focus:bg-white"
          />
        </div>

        <input
          type="text"
          value={location}
          onChange={(event) =>
            setLocation(event.target.value)
          }
          placeholder="Ville / pays"
          className="h-12 rounded-2xl border border-stone-200 bg-stone-50 px-4 text-sm text-[#1F2937] outline-none transition placeholder:text-stone-400 focus:border-[#1F6F5F] focus:bg-white"
        />

        <select
          value={contract}
          onChange={(event) =>
            setContract(event.target.value)
          }
          className="h-12 rounded-2xl border border-stone-200 bg-stone-50 px-4 text-sm text-[#1F2937] outline-none focus:border-[#1F6F5F] focus:bg-white"
        >
          <option value="">
            Tous les contrats
          </option>
          <option value="CDI">CDI</option>
          <option value="CDD">CDD</option>
          <option value="Freelance">
            Freelance
          </option>
          <option value="Stage">Stage</option>
          <option value="Alternance">
            Alternance
          </option>
        </select>

        <select
          value={experience}
          onChange={(event) =>
            setExperience(event.target.value)
          }
          className="h-12 rounded-2xl border border-stone-200 bg-stone-50 px-4 text-sm text-[#1F2937] outline-none focus:border-[#1F6F5F] focus:bg-white"
        >
          <option value="">
            Tous les niveaux
          </option>
          <option value="Débutant">
            Débutant
          </option>
          <option value="Junior">Junior</option>
          <option value="Intermédiaire">
            Intermédiaire
          </option>
          <option value="Senior">Senior</option>
          <option value="Expert">Expert</option>
        </select>
      </div>

      <label className="mt-4 inline-flex cursor-pointer items-center gap-3">
        <input
          type="checkbox"
          checked={remote}
          onChange={(event) =>
            setRemote(event.target.checked)
          }
          className="h-4 w-4 rounded border-stone-300 accent-[#1F6F5F]"
        />

        <span className="text-sm text-stone-600">
          Afficher uniquement les offres en télétravail
        </span>
      </label>
    </section>
  );
}