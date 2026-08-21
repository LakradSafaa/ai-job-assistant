import { z } from "zod";

// =====================================================
// LANGUES
// =====================================================

const languageSchema = z.object({
  language: z
    .string()
    .trim()
    .min(1, "Veuillez sélectionner une langue."),

  level: z
    .string()
    .trim()
    .min(1, "Veuillez sélectionner votre niveau."),
});

// =====================================================
// LIEUX DE RECHERCHE
// =====================================================

const jobLocationSchema = z.object({
  country: z
    .string()
    .trim()
    .min(1, "Veuillez sélectionner un pays."),

  city: z
    .string()
    .trim()
    .min(1, "Veuillez sélectionner une ville."),
});

// =====================================================
// ONBOARDING
// =====================================================

export const onboardingSchema = z.object({
  // ===================================================
  // INFORMATIONS PERSONNELLES
  // ===================================================

  fullName: z
    .string()
    .trim()
    .min(2, "Veuillez entrer votre nom complet."),

  dateOfBirth: z
    .string()
    .min(
      1,
      "Veuillez renseigner votre date de naissance."
    ),

  phoneCode: z
    .string()
    .min(
      1,
      "Veuillez sélectionner l'indicatif du pays."
    ),

  phone: z
    .string()
    .trim()
    .min(
      5,
      "Veuillez renseigner un numéro de téléphone valide."
    ),

  city: z
    .string()
    .trim()
    .min(
      1,
      "Veuillez renseigner votre ville."
    ),

  country: z
    .string()
    .trim()
    .min(
      1,
      "Veuillez sélectionner votre pays."
    ),

  address: z
    .string()
    .trim()
    .min(
      1,
      "Veuillez renseigner votre adresse."
    ),

  // ===================================================
  // FORMATION
  // ===================================================

  degree: z
    .string()
    .trim()
    .min(
      1,
      "Veuillez renseigner votre formation."
    ),

  school: z
    .string()
    .trim()
    .min(
      1,
      "Veuillez renseigner votre établissement."
    ),

  educationStart: z
    .string()
    .min(
      1,
      "Veuillez renseigner la date de début."
    ),

  educationEnd: z
    .string()
    .min(
      1,
      "Veuillez renseigner la date de fin."
    ),

  // ===================================================
  // EXPÉRIENCE — FACULTATIVE
  // ===================================================

  company: z.string().trim(),

  position: z.string().trim(),

  experienceStart: z.string(),

  experienceEnd: z.string(),

  description: z.string().trim(),

  // ===================================================
  // COMPÉTENCES
  // ===================================================

  skills: z
    .string()
    .trim()
    .min(
      1,
      "Ajoutez au moins une compétence."
    )
    .refine(
      (value) => {
        const skills = value
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean);

        return skills.length <= 15;
      },
      {
        message:
          "Vous pouvez ajouter au maximum 15 compétences.",
      }
    ),

  // ===================================================
  // LANGUES
  // ===================================================

  languages: z
    .array(languageSchema)
    .min(
      1,
      "Ajoutez au moins une langue."
    )
    .max(
      3,
      "Vous pouvez ajouter au maximum 3 langues."
    ),

  // ===================================================
  // PRÉFÉRENCES
  // ===================================================

  desiredJob: z
    .string()
    .trim()
    .min(
      1,
      "Veuillez renseigner le métier recherché."
    ),

  desiredSalary: z
    .string()
    .trim()
    .min(
      1,
      "Veuillez renseigner votre salaire souhaité."
    ),

  // Compatibilité avec les anciennes colonnes
  desiredCountry: z.string(),

  desiredCity: z.string(),

  // ===================================================
  // LIEUX DE RECHERCHE
  // ===================================================

  jobLocations: z
    .array(jobLocationSchema)
    .min(
      1,
      "Ajoutez au moins un lieu de recherche."
    )
    .max(
      3,
      "Vous pouvez ajouter au maximum 3 lieux de recherche."
    ),
});

// =====================================================
// TYPE
// =====================================================

export type OnboardingSchema = z.infer<
  typeof onboardingSchema
>;