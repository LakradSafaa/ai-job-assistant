"use client";

import { useMemo, useState } from "react";
import { Plus, X, Search } from "lucide-react";
import { useFormContext } from "react-hook-form";

import type { OnboardingSchema } from "@/lib/validations";

const skillCategories = [
  {
    name: "Compétences métier",
    skills: [
      "Gestion de projet",
      "Analyse financière",
      "Vente",
      "Prospection",
      "Comptabilité",
      "Marketing",
      "Ressources humaines",
      "Recrutement",
      "Analyse de données",
      "Conception",
      "Planification",
      "Audit",
    ],
  },
  {
    name: "Outils & logiciels",
    skills: [
      "Microsoft Excel",
      "Microsoft Word",
      "PowerPoint",
      "SAP",
      "Salesforce",
      "HubSpot",
      "AutoCAD",
      "Figma",
      "Jira",
      "Canva",
      "Google Workspace",
      "Microsoft Office",
    ],
  },
  {
    name: "Gestion & organisation",
    skills: [
      "Organisation",
      "Gestion du temps",
      "Gestion d'équipe",
      "Gestion budgétaire",
      "Planification stratégique",
      "Suivi de projet",
      "Prise de décision",
      "Coordination",
    ],
  },
  {
    name: "Communication",
    skills: [
      "Communication orale",
      "Communication écrite",
      "Présentation",
      "Négociation",
      "Écoute active",
      "Relation client",
      "Service client",
      "Rédaction professionnelle",
    ],
  },
  {
    name: "Analyse & résolution de problèmes",
    skills: [
      "Résolution de problèmes",
      "Esprit analytique",
      "Esprit critique",
      "Analyse de données",
      "Recherche",
      "Diagnostic",
      "Amélioration continue",
      "Prise de décision",
    ],
  },
  {
    name: "Compétences techniques",
    skills: [
      "Python",
      "JavaScript",
      "SQL",
      "Java",
      "C++",
      "React",
      "Machine Learning",
      "Docker",
      "Git",
      "Cybersécurité",
      "Réseaux",
      "Automatisation",
    ],
  },
  {
    name: "Management & leadership",
    skills: [
      "Leadership",
      "Management",
      "Encadrement",
      "Formation",
      "Mentorat",
      "Travail d'équipe",
      "Délégation",
      "Gestion des conflits",
    ],
  },
];

const popularSkills = [
  "Gestion de projet",
  "Communication",
  "Microsoft Excel",
  "Leadership",
  "Négociation",
  "Analyse de données",
  "Travail d'équipe",
  "Résolution de problèmes",
];

const MAX_SKILLS = 15;

export default function SkillsStep() {
  const {
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<OnboardingSchema>();

  const skillsValue = watch("skills") ?? "";

  const selectedSkills = useMemo(() => {
    if (!skillsValue.trim()) {
      return [];
    }

    return skillsValue
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);
  }, [skillsValue]);

  const [search, setSearch] = useState("");

  const updateSkills = (skills: string[]) => {
    setValue("skills", skills.join(", "), {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  };

  const addSkill = (skill: string) => {
    const normalizedSkill = skill.trim();

    if (!normalizedSkill) {
      return;
    }

    const alreadyExists = selectedSkills.some(
      (existingSkill) =>
        existingSkill.toLowerCase() ===
        normalizedSkill.toLowerCase()
    );

    if (alreadyExists) {
      setSearch("");
      return;
    }

    if (selectedSkills.length >= MAX_SKILLS) {
      return;
    }

    updateSkills([
      ...selectedSkills,
      normalizedSkill,
    ]);

    setSearch("");
  };

  const removeSkill = (skillToRemove: string) => {
    updateSkills(
      selectedSkills.filter(
        (skill) => skill !== skillToRemove
      )
    );
  };

  const filteredSkills = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return [];
    }

    const allSkills = skillCategories.flatMap(
      (category) => category.skills
    );

    return Array.from(new Set(allSkills))
      .filter((skill) =>
        skill.toLowerCase().includes(query)
      )
      .filter(
        (skill) =>
          !selectedSkills.some(
            (selected) =>
              selected.toLowerCase() ===
              skill.toLowerCase()
          )
      )
      .slice(0, 8);
  }, [search, selectedSkills]);

  const skillsError = errors.skills;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-[#1F2937]">
          Compétences
        </h2>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-500">
          Ajoutez les compétences qui correspondent à
          votre profil professionnel. Elles nous aideront
          à trouver les offres les plus pertinentes pour
          vous.
        </p>
      </div>

      {/* Recherche */}
      <div>
        <label
          htmlFor="skill-search"
          className="mb-2 block text-sm font-medium text-[#1F2937]"
        >
          Rechercher une compétence
        </label>

        <div className="relative">
          <Search
            size={18}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
          />

          <input
            id="skill-search"
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();

                if (search.trim()) {
                  addSkill(search);
                }
              }
            }}
            placeholder="Ex. Excel, gestion de projet, vente, Python..."
            className="h-12 w-full rounded-xl border border-stone-200 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-[#1F6F5F] focus:ring-2 focus:ring-[#1F6F5F]/10"
          />
        </div>

        {/* Résultats recherche */}
        {filteredSkills.length > 0 && (
          <div className="mt-2 overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
            {filteredSkills.map((skill) => (
              <button
                key={skill}
                type="button"
                onClick={() => addSkill(skill)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm hover:bg-stone-50"
              >
                <Plus
                  size={16}
                  className="text-[#1F6F5F]"
                />

                {skill}
              </button>
            ))}
          </div>
        )}

        {search.trim() &&
          filteredSkills.length === 0 && (
            <div className="mt-2 rounded-xl border border-dashed border-stone-300 bg-stone-50 p-4">
              <p className="text-sm text-stone-500">
                Cette compétence n'est pas dans nos
                suggestions.
              </p>

              <button
                type="button"
                onClick={() => addSkill(search)}
                className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-[#1F6F5F] hover:underline"
              >
                <Plus size={16} />
                Ajouter « {search.trim()} »
              </button>
            </div>
          )}
      </div>

      {/* Compétences sélectionnées */}
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-[#1F2937]">
              Vos compétences
            </h3>

            <p className="mt-1 text-xs text-stone-500">
              Vous pouvez ajouter jusqu'à{" "}
              {MAX_SKILLS} compétences.
            </p>
          </div>

          <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-600">
            {selectedSkills.length}/{MAX_SKILLS}
          </span>
        </div>

        {selectedSkills.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {selectedSkills.map((skill) => (
              <div
                key={skill}
                className="inline-flex items-center gap-2 rounded-full border border-[#1F6F5F]/20 bg-[#1F6F5F]/5 px-3 py-2 text-sm font-medium text-[#1F6F5F]"
              >
                <span>{skill}</span>

                <button
                  type="button"
                  onClick={() => removeSkill(skill)}
                  aria-label={`Supprimer ${skill}`}
                  className="rounded-full p-0.5 hover:bg-[#1F6F5F]/10"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-4 rounded-xl border border-dashed border-stone-300 bg-stone-50 p-6 text-center">
            <p className="text-sm text-stone-500">
              Aucune compétence ajoutée pour le moment.
            </p>

            <p className="mt-1 text-xs text-stone-400">
              Recherchez une compétence ou choisissez
              parmi les suggestions ci-dessous.
            </p>
          </div>
        )}

        {skillsError?.message && (
          <p className="mt-2 text-sm text-red-500">
            {String(skillsError.message)}
          </p>
        )}
      </div>

      {/* Suggestions populaires */}
      <div>
        <h3 className="text-sm font-semibold text-[#1F2937]">
          Suggestions populaires
        </h3>

        <p className="mt-1 text-xs text-stone-500">
          Cliquez sur une compétence pour l'ajouter.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {popularSkills.map((skill) => {
            const isSelected = selectedSkills.some(
              (selected) =>
                selected.toLowerCase() ===
                skill.toLowerCase()
            );

            return (
              <button
                key={skill}
                type="button"
                disabled={isSelected}
                onClick={() => addSkill(skill)}
                className={`rounded-full border px-3 py-2 text-sm transition ${
                  isSelected
                    ? "cursor-not-allowed border-stone-200 bg-stone-100 text-stone-400"
                    : "border-stone-200 bg-white text-stone-600 hover:border-[#1F6F5F] hover:bg-[#1F6F5F]/5 hover:text-[#1F6F5F]"
                }`}
              >
                {isSelected ? "✓ " : "+ "}
                {skill}
              </button>
            );
          })}
        </div>
      </div>

      {/* Catégories */}
      <div>
        <h3 className="text-sm font-semibold text-[#1F2937]">
          Explorer par catégorie
        </h3>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {skillCategories.map((category) => (
            <div
              key={category.name}
              className="rounded-2xl border border-stone-200 bg-white p-5"
            >
              <h4 className="font-medium text-[#1F2937]">
                {category.name}
              </h4>

              <div className="mt-4 flex flex-wrap gap-2">
                {category.skills.map((skill) => {
                  const isSelected =
                    selectedSkills.some(
                      (selected) =>
                        selected.toLowerCase() ===
                        skill.toLowerCase()
                    );

                  return (
                    <button
                      key={skill}
                      type="button"
                      disabled={isSelected}
                      onClick={() => addSkill(skill)}
                      className={`rounded-lg border px-2.5 py-1.5 text-xs transition ${
                        isSelected
                          ? "cursor-not-allowed border-stone-200 bg-stone-100 text-stone-400"
                          : "border-stone-200 text-stone-600 hover:border-[#1F6F5F] hover:text-[#1F6F5F]"
                      }`}
                    >
                      {isSelected ? "✓ " : "+ "}
                      {skill}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Information */}
      <div className="rounded-xl border border-[#1F6F5F]/10 bg-[#1F6F5F]/5 p-4">
        <p className="text-sm leading-6 text-stone-600">
          💡 <strong>Conseil :</strong> choisissez des
          compétences concrètes qui apparaissent
          réellement dans votre CV ou votre expérience
          professionnelle. Cela permettra à notre système
          de matching de mieux identifier les offres qui
          vous correspondent.
        </p>
      </div>
    </div>
  );
}